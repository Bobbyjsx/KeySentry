export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      api_keys: {
        Row: {
          id: string
          user_id: string
          key_hash: string
          provider: string
          discovered_at: string
          status: string
          source: string
          link: string | null
          repository: string | null
          created_at: string
          updated_at: string
          is_archived: boolean
          risk_level: string
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          key_hash: string
          provider: string
          discovered_at: string
          status: string
          source: string
          link?: string | null
          repository?: string | null
          created_at?: string
          updated_at?: string
          is_archived?: boolean
          risk_level?: string
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          key_hash?: string
          provider?: string
          discovered_at?: string
          status?: string
          source?: string
          link?: string | null
          repository?: string | null
          created_at?: string
          updated_at?: string
          is_archived?: boolean
          risk_level?: string
          notes?: string | null
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          api_key_id: string | null
          title: string
          description: string
          severity: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          api_key_id?: string | null
          title: string
          description: string
          severity: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          api_key_id?: string | null
          title?: string
          description?: string
          severity?: string
          is_read?: boolean
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          email_alerts: boolean
          slack_webhook: string | null
          github_token: string | null
          scan_frequency: string
          created_at: string
          updated_at: string
          theme: string
        }
        Insert: {
          id?: string
          user_id: string
          email_alerts?: boolean
          slack_webhook?: string | null
          github_token?: string | null
          scan_frequency?: string
          created_at?: string
          updated_at?: string
          theme?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_alerts?: boolean
          slack_webhook?: string | null
          github_token?: string | null
          scan_frequency?: string
          created_at?: string
          updated_at?: string
          theme?: string
        }
      }
      scan_history: {
        Row: {
          id: string
          user_id: string
          scan_date: string
          keys_found: number
          sources_scanned: number
          duration_seconds: number
          status: string
        }
        Insert: {
          id?: string
          user_id: string
          scan_date?: string
          keys_found?: number
          sources_scanned?: number
          duration_seconds?: number
          status?: string
        }
        Update: {
          id?: string
          user_id?: string
          scan_date?: string
          keys_found?: number
          sources_scanned?: number
          duration_seconds?: number
          status?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
