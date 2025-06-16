import PushNotificationForm from "@/components/push-notification-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🚀 FCM Push Notification Tester
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Test and send Firebase Cloud Messaging notifications with ease. 
            Use templates, track history, and validate your push notification setup.
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-slate-800/80 rounded-xl shadow-lg border border-slate-700 p-6 md:p-8 backdrop-blur-sm">
          <PushNotificationForm />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-400">
          <p>
            Need help? Check the{" "}
            <a 
              href="https://firebase.google.com/docs/cloud-messaging" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              Firebase Cloud Messaging documentation
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
