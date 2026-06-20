import { Octokit } from "@octokit/rest"
import { createClient } from "@/lib/supabase/server"

const openAiKeyRegex = /sk-[a-zA-Z0-9]{48}/

export interface ScanSource {
  type: "github" | "gitlab" | "pastebin" | "other"
  value: string
}

export async function runGitHubScan(
  userId: string,
  sources: ScanSource[],
  scanId: string
): Promise<{ keysFound: number; durationSeconds: number }> {
  const supabase = await createClient()

  // Get GitHub Token
  let githubToken = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN
  try {
    const { data: settings } = await supabase
      .from("user_settings")
      .select("github_token")
      .eq("user_id", userId)
      .single()
    if (settings?.github_token) {
      githubToken = settings.github_token
    }
  } catch (err) {
    console.error("Failed to fetch user settings github_token", err)
  }

  const octokit = new Octokit({ auth: githubToken })
  const startTime = Date.now()
  let keysFoundCount = 0

  for (const src of sources) {
    if (src.type !== "github" || !src.value) continue

    try {
      // Find files using octokit code search
      const query = `repo:${src.value} sk-`
      const searchRes = await octokit.search.code({ q: query, per_page: 10 })

      for (const item of searchRes.data.items) {
        try {
          const { data: contentData } = await octokit.repos.getContent({
            owner: item.repository.owner.login,
            repo: item.repository.name,
            path: item.path,
            ref: item.sha,
          })

          if (!("content" in contentData)) continue
          const decodedContent = Buffer.from(contentData.content, "base64").toString("utf-8")

          const matches = decodedContent.match(openAiKeyRegex)
          if (matches) {
            for (const matchedKey of matches) {
              keysFoundCount++
              
              const keyData = {
                user_id: userId,
                key_hash: matchedKey.substring(0, 8) + "...redacted..." + matchedKey.substring(matchedKey.length - 8),
                provider: "OpenAI",
                status: "active",
                source: "GitHub",
                link: item.html_url,
                repository: item.repository.full_name,
                risk_level: "high",
              }

              const { data: insertedKey, error: keyErr } = await supabase
                .from("api_keys")
                .insert(keyData)
                .select()
                .single()

              if (keyErr) {
                console.error("Failed to insert api_key", keyErr)
              } else if (insertedKey) {
                // Insert Alert
                await supabase.from("alerts").insert({
                  user_id: userId,
                  api_key_id: insertedKey.id,
                  title: `Exposed API Key Discovered`,
                  description: `Discovered exposed OpenAI API key in ${item.repository.full_name}/${item.path}`,
                  severity: "high",
                  is_read: false,
                })
              }
            }
          }
        } catch (fileErr) {
          console.error(`Error scanning file ${item.path}`, fileErr)
        }
      }
    } catch (srcErr: any) {
      console.error(`Error searching code for source ${src.value}`, srcErr.message)
    }
  }

  const durationSeconds = Math.ceil((Date.now() - startTime) / 1000)

  // Update scan history
  await supabase
    .from("scan_history")
    .update({
      keys_found: keysFoundCount,
      duration_seconds: durationSeconds,
      status: "completed",
    })
    .eq("id", scanId)

  return {
    keysFound: keysFoundCount,
    durationSeconds,
  }
}
