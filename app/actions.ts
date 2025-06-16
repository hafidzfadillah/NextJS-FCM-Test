"use server"

import { getFirebaseAdmin } from "@/lib/firebase-admin"

type NotificationData = {
  title: string
  body: string
  targetType: "token" | "topic" | "multitoken"
  target: string
  payload?: string
}

export async function sendPushNotification(data: NotificationData) {
  try {
    const admin = getFirebaseAdmin()
    const { title, body, targetType, target, payload } = data

    // Parse custom payload if provided
    let customData: Record<string, string> = {
      clickAction: "FLUTTER_NOTIFICATION_CLICK",
      id: "1",
      status: "done",
    }

    if (payload && payload.trim()) {
      try {
        const parsedPayload = JSON.parse(payload)
        // Merge custom payload with default data
        customData = {
          ...customData,
          ...parsedPayload,
        }
      } catch (error) {
        console.warn("Invalid JSON in payload, using default data:", error)
        // Continue with default data if payload parsing fails
      }
    }

    const message = {
      notification: {
        title,
        body,
      },
      // Use the merged data (default + custom payload)
      data: customData,
      // Set Android-specific options
      android: {
        priority: "high" as const,
        notification: {
          sound: "default",
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
        },
      },
      // Set Apple-specific options
      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    }

    let response

    if (targetType === "token") {
      // Send to specific device
      response = await admin.messaging().send({
        ...message,
        token: target,
      })
    } else if (targetType === "multitoken") {
      // Send to multiple devices
      const tokens = target.split('\n').map(t => t.trim()).filter(t => t.length > 0)
      if (tokens.length === 0) {
        throw new Error("No valid tokens provided")
      }
      
      response = await admin.messaging().sendEachForMulticast({
        ...message,
        tokens: tokens,
      })
      
      console.log("Multicast response:", response)
      console.log(`Successfully sent: ${response.successCount}/${tokens.length}`)
      
      if (response.failureCount > 0) {
        const failedTokens = response.responses
          .map((resp, idx) => resp.success ? null : { token: tokens[idx], error: resp.error?.message || 'Unknown error' })
          .filter(Boolean)
        console.log("Failed tokens:", failedTokens)
        
        // If some tokens failed, still return success but with details
        if (response.successCount > 0) {
          console.log(`Partial success: ${response.successCount} succeeded, ${response.failureCount} failed`)
        } else {
          // All tokens failed
          throw new Error(`All ${tokens.length} tokens failed to receive notification`)
        }
      }
    } else {
      // Send to topic
      response = await admin.messaging().send({
        ...message,
        topic: target,
      })
    }

    console.log("Successfully sent message:", response)
    console.log("Message data payload:", customData)
    return { success: true }
  } catch (error) {
    console.error("Error sending message:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
