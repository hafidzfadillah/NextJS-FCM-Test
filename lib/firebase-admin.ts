import admin from "firebase-admin"

// This is a utility function to get Firebase Admin instance
// It prevents multiple initializations when the function is called multiple times
export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      // Validate required environment variables
      if (!process.env.FIREBASE_PROJECT_ID) {
        throw new Error("FIREBASE_PROJECT_ID is required")
      }
      if (!process.env.FIREBASE_CLIENT_EMAIL) {
        throw new Error("FIREBASE_CLIENT_EMAIL is required")
      }
      if (!process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error("FIREBASE_PRIVATE_KEY is required")
      }

      // Clean and properly format the private key
      let privateKey = process.env.FIREBASE_PRIVATE_KEY
      
      // Remove quotes if they exist (both single and double, including escaped ones)
      privateKey = privateKey.replace(/^["']|["']$/g, '')
      privateKey = privateKey.replace(/^\\"|\\\"$/g, '')
      
      // Replace literal \n with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n')
      
      // Trim any extra whitespace
      privateKey = privateKey.trim()
      
      // Fix common formatting issues
      if (!privateKey.includes('\n')) {
        // If there are no newlines, try to detect and fix the format
        const beginIndex = privateKey.indexOf('-----BEGIN PRIVATE KEY-----')
        const endIndex = privateKey.indexOf('-----END PRIVATE KEY-----')
        
        if (beginIndex !== -1 && endIndex !== -1) {
          const keyContent = privateKey.substring(beginIndex + 27, endIndex).replace(/\s/g, '')
          // Reconstruct the key with proper line breaks
          const lines = []
          lines.push('-----BEGIN PRIVATE KEY-----')
          
          // Split key content into 64-character lines
          for (let i = 0; i < keyContent.length; i += 64) {
            lines.push(keyContent.substring(i, i + 64))
          }
          
          lines.push('-----END PRIVATE KEY-----')
          privateKey = lines.join('\n')
        }
      }
      
      // Final validation
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        throw new Error("Private key must contain '-----BEGIN PRIVATE KEY-----'")
      }
      
      if (!privateKey.includes('-----END PRIVATE KEY-----')) {
        throw new Error("Private key must contain '-----END PRIVATE KEY-----'")
      }

      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      })

      console.log("Firebase Admin SDK initialized successfully")
    } catch (error) {
      console.error("Firebase admin initialization error:", error)
      throw error
    }
  }

  return admin
}
