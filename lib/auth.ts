import { createClient } from './supabase/component'


/**
 * Gets the current session if it exists
 * Does not redirect if no session
 */
export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  console.log(session)
  return session
}
