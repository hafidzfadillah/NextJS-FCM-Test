import admin from "firebase-admin"

// Firebase credentials type
export type FirebaseCredentials = {
  projectId: string
  clientEmail: string
  privateKey: string
}

// This is a utility function to get Firebase Admin instance with dynamic credentials
// It prevents multiple initializations when the function is called multiple times
export function getFirebaseAdmin(credentials?: FirebaseCredentials) {
  // If no credentials provided, try to use environment variables (for backward compatibility)
  if (!credentials) {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error("Firebase credentials are required. Please provide projectId, clientEmail, and privateKey.")
    }
    
    credentials = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    }
  }

  // Create a unique app name based on project ID to support multiple projects
  const appName = `app-${credentials.projectId}`
  
  // Check if app already exists
  const existingApp = admin.apps.find(app => app?.name === appName)
  if (existingApp) {
    return existingApp
  }

  try {
    // Validate required credentials
    if (!credentials.projectId) {
      throw new Error("projectId is required")
    }
    if (!credentials.clientEmail) {
      throw new Error("clientEmail is required")
    }
    if (!credentials.privateKey) {
      throw new Error("privateKey is required")
    }

    // Clean and properly format the private key
    let privateKey = credentials.privateKey
    
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
      projectId: credentials.projectId,
      clientEmail: credentials.clientEmail,
      privateKey: privateKey,
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: credentials.projectId,
    }, appName)

    console.log(`Firebase Admin SDK initialized successfully for project: ${credentials.projectId}`)
    return app
  } catch (error) {
    console.error("Firebase admin initialization error:", error)
    throw error
  }
}
