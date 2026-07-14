import { Octokit } from "@octokit/rest"
import { decrypt } from "@/lib/crypto"
import { getSettingsDAL } from "@/lib/dal/settings"
import { updateScanStatusDAL } from "@/lib/dal/scans"
import { insertDiscoveryDAL } from "@/lib/dal/discoveries"
import { insertAlertDAL } from "@/lib/dal/alerts"
import { getManagedPatterns } from "@/lib/core/patterns-registry"

export interface ScanSource {
  type: "github" | "gitlab" | "pastebin" | "other"
  value: string
}

interface ScanItem {
  path: string
  sha: string
  html_url: string
  repository: {
    name: string
    full_name: string
    owner: { login: string }
  }
}

const EXCLUDED_PATHS = [
  "node_modules/",
  ".git/",
  ".next/",
  "dist/",
  "build/",
  ".cache/",
  "vendor/",
  "bower_components/",
  "tmp/",
  "temp/",
]

const EXCLUDED_EXTENSIONS = [
  // Images & Media
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".tiff", ".bmp",
  ".mp4", ".webm", ".mkv", ".avi", ".mov", ".flv", ".mp3", ".wav", ".flac", ".aac", ".ogg",
  // Fonts
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  // Archives & Compressed files
  ".zip", ".tar", ".gz", ".rar", ".7z", ".dmg", ".iso",
  // Documents & Data files
  ".pdf", ".epub", ".docx", ".xlsx", ".pptx", ".odt", ".csv",
  // Compiled Binaries & Executables
  ".exe", ".dll", ".so", ".dylib", ".bin", ".class", ".jar", ".war", ".o", ".a",
  // Lockfiles (usually contain dependencies hashes, not code secrets)
  "composer.lock", "cargo.lock", "gemfile.lock", "poetry.lock", "mix.lock", "pnpm-lock.yaml", "package-lock.json", "yarn.lock"
]

function isFileExcluded(path: string): boolean {
  const lowercasePath = path.toLowerCase()
  const isPathExcluded = EXCLUDED_PATHS.some((excluded) => lowercasePath.includes(excluded.toLowerCase()))
  const isExtExcluded = EXCLUDED_EXTENSIONS.some((ext) => {
    // Matches if it ends with the extension or if the filename exactly matches the lockfile name
    return lowercasePath.endsWith(ext) || lowercasePath.split("/").pop() === ext
  })
  return isPathExcluded || isExtExcluded
}

function getFilePriority(path: string): number {
  const lowercasePath = path.toLowerCase()
  const fileName = lowercasePath.split("/").pop() || ""

  // Priority 1: Environment configurations and credential containers
  if (fileName.includes(".env") || fileName === "config" || fileName === "credentials" || fileName === "secrets") {
    return 1
  }

  // Priority 2: Script configurations, databases, structured settings
  const highPriorityExtensions = [".json", ".yml", ".yaml", ".conf", ".ini", ".toml", ".sh", ".bash", ".cfg", ".sql"]
  if (highPriorityExtensions.some(ext => fileName.endsWith(ext))) {
    return 2
  }

  // Priority 3: Source code files
  const mediumPriorityExtensions = [".js", ".ts", ".tsx", ".jsx", ".py", ".go", ".rb", ".php", ".cs", ".java", ".rs", ".swift", ".kt", ".cpp", ".c", ".h"]
  if (mediumPriorityExtensions.some(ext => fileName.endsWith(ext))) {
    return 3
  }

  // Priority 4: Everything else (e.g. style files, HTML, text files)
  return 4
}

/**
 * Builds a list of ScanItems from a repository's recursive Git tree.
 * This is the reliable fallback when GitHub Code Search hasn't indexed a repo yet.
 */
async function getRepoTreeItems(
  octokit: Octokit,
  owner: string,
  repoName: string,
  defaultBranch: string
): Promise<ScanItem[]> {
  const items: ScanItem[] = []

  const { data: treeData } = await octokit.git.getTree({
    owner,
    repo: repoName,
    tree_sha: defaultBranch,
    recursive: "true",
  })

  if (!treeData.tree) return items

  const filteredTree = treeData.tree.filter(
    (item) =>
      item.type === "blob" &&
      item.path &&
      !isFileExcluded(item.path)
  )

  // Sort files by scanning priority (env/configs first)
  filteredTree.sort((a, b) => getFilePriority(a.path!) - getFilePriority(b.path!))

  for (const file of filteredTree) {
    if (!file.path || !file.sha) continue
    items.push({
      path: file.path,
      sha: file.sha,
      html_url: `https://github.com/${owner}/${repoName}/blob/${defaultBranch}/${file.path}`,
      repository: {
        name: repoName,
        full_name: `${owner}/${repoName}`,
        owner: { login: owner },
      },
    })
  }

  return items
}

/**
 * Lists repositories for a GitHub user or organization account.
 */
async function listReposForAccount(
  octokit: Octokit,
  account: string,
  limit: number
): Promise<any[]> {
  try {
    const { data } = await octokit.repos.listForUser({
      username: account,
      sort: "pushed",
      direction: "desc",
      per_page: limit,
    })
    return data || []
  } catch {
    try {
      const { data } = await octokit.repos.listForOrg({
        org: account,
        sort: "pushed",
        direction: "desc",
        per_page: limit,
      })
      return data || []
    } catch {
      console.error(`Failed to list repos for user or org "${account}"`)
      return []
    }
  }
}

export async function runGitHubScan(
  userId: string,
  sources: ScanSource[],
  scanId: string
): Promise<{ keysFound: number; durationSeconds: number; reposScanned: number; filesScanned: number }> {
  // Get GitHub Token
  let githubToken = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN
  try {
    const settings = await getSettingsDAL(userId)
    if (settings?.github_token) {
      githubToken = decrypt(settings.github_token)
    }
  } catch (err) {
    console.error("Failed to fetch user settings github_token", err)
  }

  if (!githubToken) {
    const errMsg = "GitHub token is missing. Please configure your GitHub API token in Settings before running a scan."
    await updateScanStatusDAL(scanId, { status: "failed" })
    throw new Error(errMsg)
  }

  const octokit = new Octokit({ auth: githubToken })
  const startTime = Date.now()
  let keysFoundCount = 0
  const scannedRepos = new Set<string>()
  const patterns = await getManagedPatterns()
  let totalFilesScanned = 0
  let scannedFilesCount = 0

  try {
    for (const src of sources) {
      if (src.type !== "github" || !src.value) continue

      try {
        let itemsToScan: ScanItem[] = []

        if (src.value.includes("/")) {
          // ─── Specific repository scan ───
          const [owner, repoName] = src.value.split("/")

          try {
            const searchRes = await octokit.search.code({
              q: `repo:${src.value} "sk-" OR "ghp_" OR "AKIA" OR "sk_live_" OR "AIza"`,
              per_page: 10,
            })
            if (searchRes.data.items && searchRes.data.items.length > 0) {
              // Code search returned results — use them directly
              itemsToScan = searchRes.data.items.map((item) => ({
                path: item.path,
                sha: item.sha,
                html_url: item.html_url,
                repository: {
                  name: item.repository.name,
                  full_name: item.repository.full_name,
                  owner: { login: item.repository.owner.login },
                },
              }))
            }
          } catch {
            // Search API failed — will fall through to tree scan
          }

          // If code search returned nothing, fall back to recursive tree scan
          if (itemsToScan.length === 0) {
            const { data: repoData } = await octokit.repos.get({ owner, repo: repoName })
            const defaultBranch = repoData.default_branch || "main"
            itemsToScan = await getRepoTreeItems(octokit, owner, repoName, defaultBranch)
          }
        } else {
          // ─── User or organization account scan ───
          // List up to 100 repos (increased from 10 to cover large accounts)
          const repos = await listReposForAccount(octokit, src.value, 100)
          console.log(`Found ${repos.length} repos to scan for user/org "${src.value}"`)

          for (const repoInfo of repos) {
            try {
              const owner = repoInfo.owner.login
              const repoName = repoInfo.name
              const defaultBranch = repoInfo.default_branch || "main"

              const repoItems = await getRepoTreeItems(octokit, owner, repoName, defaultBranch)
              
              // Cap at 15 files per repo to ensure fair share across all 75+ repos
              const MAX_FILES_PER_REPO = 15
              const limitedRepoItems = repoItems.slice(0, MAX_FILES_PER_REPO)
              
              itemsToScan.push(...limitedRepoItems)
            } catch (repoErr) {
              console.error(`Failed to fetch tree for repository ${repoInfo.full_name}`, repoErr)
            }
          }
        }

        // Cap the number of files to scan globally to avoid excessive API calls
        // Increased from 200 to 500 to allow broad coverage across multiple repos
        const MAX_FILES_TO_SCAN = 5000
        if (itemsToScan.length > MAX_FILES_TO_SCAN) {
          itemsToScan = itemsToScan.slice(0, MAX_FILES_TO_SCAN)
        }

        // Add to scanned stats
        itemsToScan.forEach((item) => scannedRepos.add(item.repository.full_name))
        totalFilesScanned += itemsToScan.length

        // Scan each file for exposed keys
        for (const item of itemsToScan) {
          try {
            const { data: blobData } = await octokit.git.getBlob({
              owner: item.repository.owner.login,
              repo: item.repository.name,
              file_sha: item.sha,
            })

            if (!blobData.content) continue
            const decodedContent = Buffer.from(blobData.content, "base64").toString("utf-8")

            // Loop through all active patterns
            for (const pattern of patterns) {
              try {
                // Ensure regex has the global 'g' flag for matchAll to work
                const isGlobal = pattern.flags.includes("g")
                const regexFlags = isGlobal ? pattern.flags : pattern.flags + "g"
                const patternRegex = new RegExp(pattern.regex, regexFlags)
                
                let match: RegExpExecArray | null
                while ((match = patternRegex.exec(decodedContent)) !== null) {
                  const matchedKey = match[0]
                  keysFoundCount++

                  // Redact key for database storage
                  const redactedKey = matchedKey.length > 16
                    ? matchedKey.substring(0, 8) + "...redacted..." + matchedKey.substring(matchedKey.length - 8)
                    : matchedKey.substring(0, Math.min(matchedKey.length, 4)) + "...redacted..."

                  const keyData = {
                    user_id: userId,
                    key_hash: redactedKey,
                    provider: pattern.provider,
                    status: "active",
                    source: "GitHub",
                    link: item.html_url,
                    repository: item.repository.full_name,
                    risk_level: pattern.riskLevel,
                    scan_id: scanId,
                  }

                  try {
                    const insertedKey = await insertDiscoveryDAL(userId, keyData)
                    if (insertedKey) {
                      await insertAlertDAL(userId, {
                        api_key_id: insertedKey.id,
                        title: `Exposed ${pattern.provider} Key Discovered`,
                        description: `Discovered exposed ${pattern.provider} key in ${item.repository.full_name}/${item.path}`,
                        severity: pattern.riskLevel === "critical" ? "critical" : "high",
                        is_read: false,
                      })
                    }
                  } catch (keyErr) {
                    console.error("Failed to insert api_key", keyErr)
                  }
                }
              } catch (regErr) {
                console.error(`Invalid regex pattern ${pattern.id}: ${pattern.regex}`, regErr)
              }
            }
          } catch (fileErr) {
            console.error(`Error scanning file ${item.path}`, fileErr)
          }

          scannedFilesCount++
          if (scannedFilesCount % 10 === 0) {
            const elapsed = Math.ceil((Date.now() - startTime) / 1000)
            await updateScanStatusDAL(scanId, {
              files_scanned: scannedFilesCount,
              repos_scanned: scannedRepos.size,
              keys_found: keysFoundCount,
              duration_seconds: elapsed,
            }).catch((err) => {
              console.error("Failed to write intermediate scan stats progress:", err)
            })
          }
        }
      } catch (srcErr: any) {
        console.error(`Error searching code for source ${src.value}`, srcErr)
        throw new Error(`Scan failed for source "${src.value}": ${srcErr.message || srcErr}`)
      }
    }

    const durationSeconds = Math.ceil((Date.now() - startTime) / 1000)

    // Update scan history
    await updateScanStatusDAL(scanId, {
      keys_found: keysFoundCount,
      duration_seconds: durationSeconds,
      status: "completed",
      repos_scanned: scannedRepos.size,
      files_scanned: totalFilesScanned,
    })

    return {
      keysFound: keysFoundCount,
      durationSeconds,
      reposScanned: scannedRepos.size,
      filesScanned: totalFilesScanned,
    }
  } catch (error: any) {
    console.error("Scan processing error:", error)
    await updateScanStatusDAL(scanId, {
      status: "failed",
      duration_seconds: Math.ceil((Date.now() - startTime) / 1000),
    })
    throw error
  }
}
