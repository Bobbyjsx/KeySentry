import crypto from "crypto"

// We require a 32-byte key. We hash the ENCRYPTION_KEY to ensure it is exactly 32 bytes.
const getEncryptionKey = (): Buffer => {
  const rawKey = process.env.ENCRYPTION_KEY || "keysentry-default-development-encryption-key-32chars!"
  return crypto.createHash("sha256").update(rawKey).digest()
}

/**
 * Encrypts a text string using AES-256-GCM
 */
export function encrypt(text: string): string {
  if (!text) return text
  
  const iv = crypto.randomBytes(12)
  const key = getEncryptionKey()
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  
  const authTag = cipher.getAuthTag().toString("hex")
  
  // Format: iv:authTag:encryptedText
  return `${iv.toString("hex")}:${authTag}:${encrypted}`
}

/**
 * Decrypts an AES-256-GCM encrypted text string
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText
  
  try {
    const parts = encryptedText.split(":")
    if (parts.length !== 3) {
      // Graceful upgrade: if it does not contain colons, it is likely an unencrypted legacy token.
      if (!encryptedText.includes(":")) {
        return encryptedText
      }
      throw new Error("Invalid encrypted text format")
    }
    
    const [ivHex, authTagHex, encrypted] = parts
    const iv = Buffer.from(ivHex, "hex")
    const authTag = Buffer.from(authTagHex, "hex")
    const key = getEncryptionKey()
    
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")
    
    return decrypted
  } catch (error) {
    console.error("Failed to decrypt token:", error)
    throw new Error("Failed to decrypt the GitHub token. Please verify your ENCRYPTION_KEY.")
  }
}
