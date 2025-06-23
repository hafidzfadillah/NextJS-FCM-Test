# FCM Push Notification Tester

A modern, feature-rich Next.js application for testing Firebase Cloud Messaging (FCM) push notifications with a beautiful dark theme interface. **Now available for public deployment** - users can provide their own Firebase credentials directly in the interface.

## ✨ Features

- 🚀 **Send push notifications** to device tokens, multiple tokens, or topics
- 🔐 **Dynamic Firebase configuration** - users provide their own credentials securely
- 📝 **Pre-built message templates** for quick testing
- 📱 **Multiple target types**:
  - Single device token
  - Multiple device tokens (dynamic input fields)
  - Topic-based broadcasting
- 📊 **Notification history tracking** with success/failure status
- ⚡ **Modern dark theme UI** with Tailwind CSS and shadcn/ui
- 📐 **Dynamic textarea** that auto-resizes based on content
- 🎯 **Sample tokens and topics** for easy testing
- 🔧 **Built with Next.js 15, TypeScript, and React Hook Form**
- 🌐 **Public deployment ready** - no environment variables needed

## 🎨 Interface

- **Dark theme** optimized for development environments
- **Compact, responsive design** that works on all screen sizes
- **Dynamic form elements** that adapt to content
- **Real-time feedback** with success/error notifications
- **Template system** for quick payload testing
- **Secure credential input** with masked private key field

## 🛠️ Setup Instructions

### 1. Firebase Project Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Navigate to **Project Settings** → **Service accounts**
4. Click **Generate new private key** to download the service account JSON file
5. Note down your project ID, client email, and private key

### 2. Installation (No Environment Variables Required!)

```bash
git clone https://github.com/yourusername/fcm-push-notification-tester.git
cd fcm-push-notification-tester
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and enter your Firebase credentials directly in the interface!

## 🚀 Usage

### Firebase Configuration

When you first open the application, you'll see a Firebase Configuration section where you need to enter:

1. **Project ID**: Your Firebase project ID (found in Project Settings)
2. **Client Email**: The service account email (ends with `.iam.gserviceaccount.com`)
3. **Private Key**: The complete private key including BEGIN and END lines

Your credentials are processed securely and are **never stored** - they're only used for the current session.

### Quick Templates

Choose from pre-built templates including:
- Welcome messages
- System updates  
- Security alerts
- Promotional offers
- Achievement notifications
- Test notifications

### Sending Notifications

1. **Configure Firebase credentials** in the configuration section
2. **Choose a template** (optional): Click any template to auto-fill the form
3. **Enter notification details**:
   - **Title**: The notification title
   - **Body**: The notification message
4. **Select target type**:
   - **Single Token**: Send to one specific device
   - **Multiple Tokens**: Send to multiple devices using dynamic input fields
   - **Topic**: Send to all subscribers of a topic
5. **Configure target**:
   - For single tokens: Enter the FCM token
   - For multiple tokens: Use individual input fields with add/remove functionality
   - For topics: Enter the topic name
6. **Add custom payload** (optional): JSON data for app-specific actions
7. **Send**: Click the "Send Notification" button

### Multiple Device Tokens

When using "Multiple Tokens":
- Each token gets its own input field
- ➕ **Add Token** button to create new fields
- ❌ **Remove** buttons for each token (except the last one)
- **Sample buttons** to quickly populate with test data
- **Smart validation** ensures at least one token is provided

### Custom Payloads

The payload textarea features:
- **Auto-resizing height** based on content
- **JSON syntax highlighting** with monospace font
- **Template integration** - payloads auto-adjust when templates are loaded
- **Validation** for proper JSON formatting

### Testing with Sample Data

The app includes sample tokens and topics for easy testing:
- **Sample Tokens**: Pre-defined test tokens (replace with real device tokens)
- **Sample Topics**: Common topic names like "general", "news", "promotions"

Click on any sample to auto-fill the target field or add to multiple token inputs.

### Notification History

Track your recent notifications (last 10) with:
- ✅ **Success/failure status**
- ⏰ **Timestamp**
- 📝 **Message content**
- 🎯 **Target information** (shows token count for multiple tokens)
- ❌ **Error details** (if any)
- 🗑️ **Clear history** option

## 🔐 Security

- **Credentials are never stored** - they're only used during the current session
- **Client-side processing** - your private keys never leave your browser environment
- **HTTPS recommended** for production deployments
- **No server-side credential storage** - fully client-configured

## 📱 Getting Device Tokens

To get real device tokens for testing:

### For Android (React Native/Flutter)
```javascript
import messaging from '@react-native-firebase/messaging';

// Get the device token
messaging().getToken().then(token => {
  console.log('FCM Token:', token);
});
```

### For Web
```javascript
import { getMessaging, getToken } from 'firebase/messaging';

const messaging = getMessaging();
getToken(messaging, { vapidKey: 'your-vapid-key' }).then((currentToken) => {
  if (currentToken) {
    console.log('FCM Token:', currentToken);
  }
});
```

## 📢 Topic Subscriptions

To subscribe devices to topics:

```javascript
// Subscribe to a topic
messaging().subscribeToTopic('your-topic-name');

// Unsubscribe from a topic
messaging().unsubscribeFromTopic('your-topic-name');
```

## 🌐 Deployment

This application is designed for public deployment! You can deploy it to:

- **Vercel**: `vercel --prod`
- **Netlify**: Connect your GitHub repository
- **Firebase Hosting**: `firebase deploy`
- **Any static hosting service**

No environment variables or server configuration required!

## 🔧 Troubleshooting

### Common Issues

1. **"Firebase credentials are required"**
   - Make sure all three Firebase fields are filled out
   - Verify your project ID, client email, and private key are correct

2. **"Invalid registration token"**
   - The device token might be expired or invalid
   - Generate a new token from your client app

3. **"Topic name is invalid"**
   - Topic names must match the pattern `[a-zA-Z0-9-_.~%]+`
   - No spaces or special characters except `-`, `_`, `.`, `~`, `%`

4. **"Private key must contain BEGIN PRIVATE KEY"**
   - Copy the entire private key including the BEGIN and END lines
   - Ensure there are no extra quotes or escaping

5. **"All X tokens failed to receive notification"**
   - Check that the tokens are valid and active
   - Ensure your Firebase project has proper permissions

### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Project Settings** (gear icon)
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file and extract:
   - `project_id` → Project ID
   - `client_email` → Client Email  
   - `private_key` → Private Key

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (dark theme)
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Backend**: Firebase Admin SDK (client-configured)
- **Icons**: Lucide React
- **State Management**: React hooks

## 📁 Project Structure

```
├── app/
│   ├── actions.ts          # Server actions for sending notifications
│   ├── globals.css         # Global styles with dark theme
│   ├── layout.tsx          # Root layout with dark mode
│   └── page.tsx           # Main page with dark styling
├── components/
│   ├── ui/                # shadcn/ui components
│   └── push-notification-form.tsx  # Main form component with credential inputs
├── lib/
│   ├── firebase-admin.ts  # Dynamic Firebase admin setup
│   └── utils.ts          # Utility functions
├── public/               # Static assets
└── payload-testcase.md   # Comprehensive test payload examples
```

## 🧪 Test Payloads

Check out `payload-testcase.md` for comprehensive test payload examples including:
- Overtime request approvals
- Attendance requests
- Leave requests
- Reimbursement requests
- CRM notifications
- And more...

## 🌟 Recent Updates

- ✅ **Public deployment ready** - no environment variables required
- ✅ **Dynamic Firebase configuration** with secure credential input
- ✅ **Enhanced security** - credentials never stored server-side
- ✅ **Dark theme implementation** for better developer experience
- ✅ **Multiple device token support** with dynamic input fields
- ✅ **Auto-resizing textarea** for payload input
- ✅ **Improved UI compactness** and responsiveness
- ✅ **Enhanced validation** and error handling
- ✅ **Better notification history** with token count display

## 🤝 Contributing

Feel free to open issues or submit pull requests to improve this testing tool!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Firebase Console](https://console.firebase.google.com/)

---

**🚀 Ready to test your push notifications? Just enter your Firebase credentials and start sending!**
