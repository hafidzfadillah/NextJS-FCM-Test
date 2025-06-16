"use client"

import { useState, useEffect, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AlertCircle, CheckCircle2, Copy, Clock, Trash2, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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
    name: "Cashout",
    title: "Cashout Request",
    body: "Your cashout request has been approved. We're excited to have you.",
    payload: '{"action": "cashout_detail", "type": "cashout", "id":"19"}',
  },
  {
    name: "Overtime",
    title: "Overtime Request",
    body: "Your overtime request has been approved. We're excited to have you.",
    payload: '{"action": "approval", "type": "overtime-request", "approval_type": "overtime", "id": "OT-2024-001", "employee_name": "John Doe", "date": "2024-01-15", "hours": "3"}',
  },
  {
    name: "Attendance",
    title: "Attendance Request",
    body: "Your attendance request has been approved. We're excited to have you.",
    payload: '{"action": "approval", "type": "attendance-request", "approval_type": "attendance", "id": "ATT-2024-001", "employee_name": "John Doe", "date": "2024-01-15", "hours": "3"}',
  },
  {
    name: "Leave",
    title: "Leave Request",
    body: "Your leave request has been approved. We're excited to have you.",
    payload: '{"action": "approval", "type": "timeoff-request", "approval_type": "timeoff", "id": "TO-2024-005", "employee_name": "Alex Chen", "start_date": "2024-01-25", "end_date": "2024-01-26", "reason": "Personal matters"}',
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
      const submitValues: FormValues & { target: string } = {
        ...values,
        target: values.targetType === "multitoken" 
          ? tokenList.filter(token => token.trim()).join('\n')
          : values.target || ""
      }
      
      const result = await sendPushNotification(submitValues)
      
              const historyItem: NotificationHistory = {
          id: Date.now().toString(),
          ...submitValues,
          status: result.success ? "success" : "error",
          timestamp: new Date(),
          error: result.success ? undefined : result.error,
        }
      
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]) // Keep last 10 items

      if (result.success) {
        let successMessage = "Push notification sent successfully!"
        if (values.targetType === "multitoken") {
          const tokenCount = tokenList.filter(t => t.trim()).length
          successMessage = `Push notification sent to ${tokenCount} device${tokenCount > 1 ? 's' : ''} successfully!`
        }
        
        setStatus({
          type: "success",
          message: successMessage,
        })
        // Preserve target and targetType values
        const currentTargetType = form.getValues("targetType")
        const currentTokenList = [...tokenList]
        form.reset()
        form.setValue("targetType", currentTargetType)
        if (currentTargetType === "multitoken") {
          setTokenList(currentTokenList)
        } else {
          const currentTarget = form.getValues("target")
          form.setValue("target", currentTarget)
        }
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to send push notification",
        })
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "An unexpected error occurred",
      })
      console.error(error)
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
    if (!textarea) return
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'
    
    // Calculate the new height based on scrollHeight
    const newHeight = Math.max(textarea.scrollHeight, 48) // Minimum 48px (about 2 rows)
    const maxHeight = 200 // Maximum height in pixels
    
    // Set the height, but don't exceed maxHeight
    textarea.style.height = `${Math.min(newHeight, maxHeight)}px`
    
    // Show scrollbar if content exceeds maxHeight
    textarea.style.overflowY = newHeight > maxHeight ? 'auto' : 'hidden'
  }

  const handlePayloadChange = (value: string, onChange: (value: string) => void) => {
    onChange(value)
    
    // Adjust height on next tick to ensure the value is updated
    setTimeout(() => {
      if (payloadTextareaRef.current) {
        adjustTextareaHeight(payloadTextareaRef.current)
      }
    }, 0)
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quick Templates */}
      <div className="space-y-2">
        <h3 className="text-base font-medium">Quick Templates</h3>
        <div className="grid grid-cols-3 gap-1.5">
          {testTemplates.map((template) => (
            <Button
              key={template.name}
              variant="outline"
              size="sm"
              onClick={() => loadTemplate(template)}
              className="text-xs h-7 px-2"
            >
              {template.name}
            </Button>
          ))}
        </div>
      </div>

      {status.type && (
        <Alert variant={status.type === "success" ? "default" : "destructive"}>
          {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{status.type === "success" ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notification Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter notification title" {...field} />
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
                <FormLabel>Notification Body</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter notification message" className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="targetType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select target type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="token">Single Token</SelectItem>
                      <SelectItem value="multitoken">Multiple Tokens</SelectItem>
                      <SelectItem value="topic">Topic</SelectItem>
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
                  <FormLabel>
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
                              className="h-9 font-mono text-sm"
                              placeholder={`Token ${index + 1}`}
                              value={token}
                              onChange={(e) => updateToken(index, e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-9 px-3"
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
                          className="h-8"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Token
                        </Button>
                      </div>
                    ) : (
                      <Input
                        className="h-9"
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
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Sample {form.watch("targetType") === "multitoken" ? "tokens" : form.watch("targetType")}s:
            </p>
            <div className="flex flex-wrap gap-1">
              {form.watch("targetType") === "multitoken" ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
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
                      className="h-6 px-2 text-xs"
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
                    className="h-6 px-2 text-xs"
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

          <FormField
            control={form.control}
            name="payload"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Payload (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    ref={payloadTextareaRef}
                    placeholder='{"action": "custom_action", "key": "value"}'
                    className="resize-none font-mono text-sm min-h-[48px] overflow-hidden"
                    value={field.value || ""}
                    onChange={(e) => handlePayloadChange(e.target.value, field.onChange)}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Notification"}
          </Button>
        </form>
      </Form>

      {/* Notification History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">Recent Notifications</h3>
            <Button variant="ghost" size="sm" onClick={clearHistory} className="h-7 px-2">
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.id}
                className={`p-2 rounded border text-sm ${
                  item.status === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{item.title}</div>
                    <div className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{item.body}</div>
                    {item.payload && (
                      <div className="text-xs text-blue-600 mt-1 font-mono bg-blue-50 px-1 py-0.5 rounded truncate">
                        {item.payload.length > 40 ? `${item.payload.slice(0, 40)}...` : item.payload}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
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
                      <div className="text-red-600 text-xs mt-1 truncate">{item.error}</div>
                    )}
                  </div>
                  <div className={`ml-2 px-1.5 py-0.5 rounded text-xs flex-shrink-0 ${
                    item.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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
