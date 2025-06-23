"use client"

import { useState, useEffect, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AlertCircle, CheckCircle2, Copy, Clock, Trash2, Plus, X, Key, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { sendPushNotification } from "@/app/actions"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Message body is required"),
  targetType: z.enum(["token", "topic", "multitoken"]),
  target: z.string().optional(),
  payload: z.string().optional(),
  firebaseProjectId: z.string().min(1, "Firebase Project ID is required"),
  firebaseClientEmail: z.string().email("Invalid email format").min(1, "Firebase Client Email is required"),
  firebasePrivateKey: z.string().min(1, "Firebase Private Key is required"),
})

type FormValues = z.infer<typeof formSchema>

type NotificationHistory = {
  id: string
  title: string
  body: string
  targetType: string
  target: string
  payload?: string
  status: "success" | "error"
  timestamp: Date
  error?: string
}

// Test templates for quick testing
const testTemplates = [
  {
    name: "Welcome Message",
    title: "Welcome to Our App!",
    body: "Thank you for joining us. Get started by exploring the features and setting up your profile.",
    payload: '{"action": "onboarding", "screen": "welcome", "step": 1}',
  },
  {
    name: "System Update",
    title: "App Update Available",
    body: "A new version of the app is available with exciting new features and improvements.",
    payload: '{"action": "update", "version": "2.1.0", "required": false}',
  },
  {
    name: "Reminder",
    title: "Don't Forget!",
    body: "You have pending tasks that need your attention. Tap to view details.",
    payload: '{"action": "open_screen", "screen": "tasks", "highlight": "pending"}',
  },
  {
    name: "Promotional",
    title: "Special Offer - 50% Off!",
    body: "Limited time offer just for you. Don't miss out on amazing deals ending soon.",
    payload: '{"action": "promotion", "offer_id": "SAVE50", "expires": "2024-12-31"}',
  },
  {
    name: "Security Alert",
    title: "Security Notice",
    body: "We detected a new login to your account. If this wasn't you, please secure your account immediately.",
    payload: '{"action": "security", "type": "login_alert", "location": "New York, US"}',
  },
  {
    name: "Achievement",
    title: "Congratulations! 🎉",
    body: "You've reached a new milestone! Keep up the great work and unlock more rewards.",
    payload: '{"action": "achievement", "badge": "week_streak", "points": 100}',
  },
  {
    name: "Test Notification",
    title: "Test Notification",
    body: "This is a test push notification to verify your setup is working correctly.",
    payload: '{"action": "test", "timestamp": "' + Date.now() + '"}',
  },
]

// Sample tokens and topics for testing
const sampleTargets = {
  tokens: [
    "dGVzdF90b2tlbl8xMjM0NTY3ODkw", // This is just a sample - replace with real tokens
    "c2FtcGxlX3Rva2VuX2Zvcl90ZXN0aW5n",
  ],
  topics: [
    "general",
    "news",
    "promotions",
    "test-topic",
  ],
}

export default function PushNotificationForm() {
  const [status, setStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [mounted, setMounted] = useState(false)
  const [tokenList, setTokenList] = useState<string[]>([""])
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const payloadTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      body: "",
      targetType: "token",
      target: "",
      payload: "",
      firebaseProjectId: "",
      firebaseClientEmail: "",
      firebasePrivateKey: "",
    },
  })

  // Reset token list when switching away from multitoken
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "targetType" && value.targetType !== "multitoken") {
        setTokenList([""])
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Adjust textarea height when payload value changes (including template loads)
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "payload" && payloadTextareaRef.current) {
        setTimeout(() => {
          if (payloadTextareaRef.current) {
            adjustTextareaHeight(payloadTextareaRef.current)
          }
        }, 0)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Initial height adjustment after mount
  useEffect(() => {
    if (mounted && payloadTextareaRef.current) {
      adjustTextareaHeight(payloadTextareaRef.current)
    }
  }, [mounted])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    setStatus({ type: null, message: "" })

    try {
      // Validate inputs based on type
      if (values.targetType === "multitoken") {
        const validTokens = tokenList.filter(token => token.trim())
        if (validTokens.length === 0) {
          setStatus({
            type: "error",
            message: "At least one token is required",
          })
          setIsSubmitting(false)
          return
        }
      } else if (!values.target?.trim()) {
        setStatus({
          type: "error",
          message: "Target is required",
        })
        setIsSubmitting(false)
        return
      }

      // For multitoken, combine the tokenList into the target field
      const submitValues = {
        title: values.title,
        body: values.body,
        targetType: values.targetType,
        target: values.targetType === "multitoken" 
          ? tokenList.filter(token => token.trim()).join('\n')
          : values.target || "",
        payload: values.payload,
        firebaseCredentials: {
          projectId: values.firebaseProjectId,
          clientEmail: values.firebaseClientEmail,
          privateKey: values.firebasePrivateKey,
        }
      }
      
      const result = await sendPushNotification(submitValues)
      
      const historyItem: NotificationHistory = {
        id: Date.now().toString(),
        title: submitValues.title,
        body: submitValues.body,
        targetType: submitValues.targetType,
        target: submitValues.target,
        payload: submitValues.payload,
        status: result.success ? "success" : "error",
        timestamp: new Date(),
        error: result.success ? undefined : result.error,
      }
      
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]) // Keep last 10 items

      if (result.success) {
        setStatus({
          type: "success",
          message: "Push notification sent successfully!",
        })
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to send notification",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadTemplate = (template: typeof testTemplates[0]) => {
    form.setValue("title", template.title)
    form.setValue("body", template.body)
    form.setValue("payload", template.payload)
  }

  const copyToClipboard = async (text: string) => {
    if (!mounted) return
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const clearHistory = () => {
    setHistory([])
  }

  const addToken = () => {
    setTokenList([...tokenList, ""])
  }

  const removeToken = (index: number) => {
    if (tokenList.length > 1) {
      setTokenList(tokenList.filter((_, i) => i !== index))
    }
  }

  const updateToken = (index: number, value: string) => {
    const newTokenList = [...tokenList]
    newTokenList[index] = value
    setTokenList(newTokenList)
  }

  const addSampleToken = (token: string) => {
    const emptyIndex = tokenList.findIndex(t => !t.trim())
    if (emptyIndex !== -1) {
      updateToken(emptyIndex, token)
    } else {
      setTokenList([...tokenList, token])
    }
  }

  const loadAllSampleTokens = () => {
    setTokenList([...sampleTargets.tokens])
  }

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'
    
    // Calculate the new height based on content
    const newHeight = Math.max(40, Math.min(200, textarea.scrollHeight))
    
    // Apply the new height
    textarea.style.height = `${newHeight}px`
    
    // Ensure the textarea shows scrollbar if content exceeds max height
    if (textarea.scrollHeight > 200) {
      textarea.style.overflowY = 'auto'
    } else {
      textarea.style.overflowY = 'hidden'
    }
  }

  const handlePayloadChange = (value: string, onChange: (value: string) => void) => {
    onChange(value)
    
    // Adjust height after the value has been set
    setTimeout(() => {
      if (payloadTextareaRef.current) {
        adjustTextareaHeight(payloadTextareaRef.current)
      }
    }, 0)
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {status.type && (
        <Alert className={status.type === "success" ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-red-500 bg-red-50 dark:bg-red-950/30"}>
          {status.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
          <AlertTitle className={status.type === "success" ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
            {status.type === "success" ? "Success" : "Error"}
          </AlertTitle>
          <AlertDescription className={status.type === "success" ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
            {status.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Templates */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white">📋 Quick Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {testTemplates.map((template, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => loadTemplate(template)}
              className="text-left justify-start h-auto p-3 border-slate-600 hover:border-slate-500 bg-slate-700/50 hover:bg-slate-700 text-slate-200"
            >
              <div className="space-y-2 w-full">
                <div className="font-medium text-sm text-white">{template.name}</div>
                <div className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap break-words">
                  {template.body}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Firebase Configuration Section */}
          <div className="space-y-4 p-4 border border-slate-600 rounded-lg bg-slate-700/30">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-yellow-400" />
              <h3 className="text-base font-medium text-white">🔧 Firebase Configuration</h3>
            </div>
            <div className="text-sm text-slate-300 mb-4">
              Enter your Firebase project credentials. You can get these from your Firebase project settings.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firebaseProjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Project ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your-firebase-project-id" 
                        {...field} 
                        className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="firebaseClientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Client Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com" 
                        type="email"
                        {...field} 
                        className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="firebasePrivateKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Private Key</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder="-----BEGIN PRIVATE KEY-----&#10;Your private key here...&#10;-----END PRIVATE KEY-----"
                        {...field}
                        className={`bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 font-mono text-xs min-h-[80px] pr-10 ${!showPrivateKey ? 'password-style' : ''}`}
                        style={!showPrivateKey ? { fontFamily: 'text-security-disc' } as React.CSSProperties : {}}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-6 w-6 p-0 text-slate-400 hover:text-slate-200"
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                      >
                        {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <div className="text-xs text-slate-400">
                    Copy the entire private key including the BEGIN and END lines. Your key is processed securely and not stored.
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Notification Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Notification Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter notification title" {...field} className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Message Body</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter notification message" {...field} className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Target Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="targetType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Target Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Select target type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="token" className="text-white hover:bg-slate-700">Single Token</SelectItem>
                      <SelectItem value="multitoken" className="text-white hover:bg-slate-700">Multiple Tokens</SelectItem>
                      <SelectItem value="topic" className="text-white hover:bg-slate-700">Topic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">
                    {form.watch("targetType") === "token" 
                      ? "Device Token" 
                      : form.watch("targetType") === "multitoken"
                      ? "Device Tokens"
                      : "Topic"}
                  </FormLabel>
                  <FormControl>
                    {form.watch("targetType") === "multitoken" ? (
                      <div className="space-y-2">
                        {tokenList.map((token, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 font-mono text-sm"
                              placeholder={`Token ${index + 1}`}
                              value={token}
                              onChange={(e) => updateToken(index, e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-200 hover:bg-slate-700"
                              onClick={() => removeToken(index)}
                              disabled={tokenList.length === 1}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addToken}
                          className="border-slate-600 text-slate-200 hover:bg-slate-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Token
                        </Button>
                      </div>
                    ) : (
                      <Input
                        className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                        placeholder={form.watch("targetType") === "token" ? "Enter FCM token" : "Enter topic name"}
                        {...field}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Sample targets for testing */}
          <div className="space-y-2">
            <p className="text-sm text-slate-300">
              Sample {form.watch("targetType") === "multitoken" ? "tokens" : form.watch("targetType")}s:
            </p>
            <div className="flex flex-wrap gap-2">
              {form.watch("targetType") === "multitoken" ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs border border-slate-600 text-slate-200 hover:bg-slate-700"
                    onClick={() => {
                      loadAllSampleTokens()
                      copyToClipboard(sampleTargets.tokens.join('\n'))
                    }}
                  >
                    All Sample Tokens
                    <Copy className="ml-1 h-3 w-3" />
                  </Button>
                  {sampleTargets.tokens.map((token, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs border border-slate-600 text-slate-200 hover:bg-slate-700"
                      onClick={() => {
                        addSampleToken(token)
                        copyToClipboard(token)
                      }}
                    >
                      Add Token {index + 1}
                      <Copy className="ml-1 h-3 w-3" />
                    </Button>
                  ))}
                </>
              ) : (
                (form.watch("targetType") === "token" ? sampleTargets.tokens : sampleTargets.topics).map((sample, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs border border-slate-600 text-slate-200 hover:bg-slate-700"
                    onClick={() => {
                      form.setValue("target", sample)
                      copyToClipboard(sample)
                    }}
                  >
                    {form.watch("targetType") === "token" ? `Token ${index + 1}` : sample}
                    <Copy className="ml-1 h-3 w-3" />
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Custom Payload */}
          <FormField
            control={form.control}
            name="payload"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Custom Payload (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    ref={payloadTextareaRef}
                    placeholder='{"action": "custom_action", "key": "value"}'
                    className="resize-none font-mono text-sm min-h-[48px] overflow-hidden bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                    value={field.value || ""}
                    onChange={(e) => handlePayloadChange(e.target.value, field.onChange)}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <div className="text-xs text-slate-400">
                  JSON data that will be sent with the notification for custom app actions.
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Notification"}
          </Button>
        </form>
      </Form>

      {/* Notification History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">📈 Recent Notifications</h3>
            <Button variant="ghost" size="sm" onClick={clearHistory} className="h-8 px-3 text-slate-400 hover:text-slate-200 hover:bg-slate-700">
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border text-sm ${
                  item.status === "success" 
                    ? "bg-green-950/30 border-green-800 text-green-100" 
                    : "bg-red-950/30 border-red-800 text-red-100"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate text-white">{item.title}</div>
                    <div className="text-slate-300 text-xs mt-0.5 line-clamp-1">{item.body}</div>
                    {item.payload && (
                      <div className="text-xs text-blue-400 mt-1 font-mono bg-blue-950/30 px-2 py-1 rounded truncate">
                        {item.payload.length > 40 ? `${item.payload.slice(0, 40)}...` : item.payload}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-slate-400 mt-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.timestamp.toLocaleTimeString()}
                      <span className="mx-2">•</span>
                      <span className="truncate">
                        {item.targetType === "multitoken" 
                          ? `${item.target.split('\n').filter(t => t.trim()).length} tokens`
                          : `${item.targetType}: ${item.target.length > 15 ? `${item.target.slice(0, 15)}...` : item.target}`
                        }
                      </span>
                    </div>
                    {item.error && (
                      <div className="text-red-400 text-xs mt-2 truncate bg-red-950/50 px-2 py-1 rounded">{item.error}</div>
                    )}
                  </div>
                  <div className={`ml-3 px-2 py-1 rounded text-xs flex-shrink-0 font-medium ${
                    item.status === "success" 
                      ? "bg-green-900/50 text-green-300 border border-green-800" 
                      : "bg-red-900/50 text-red-300 border border-red-800"
                  }`}>
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
