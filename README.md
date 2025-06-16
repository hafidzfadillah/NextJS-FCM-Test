# FCM Push Notification Tester

A modern, feature-rich Next.js application for testing Firebase Cloud Messaging (FCM) push notifications with a beautiful dark theme interface.

## ✨ Features

- 🚀 **Send push notifications** to device tokens, multiple tokens, or topics
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

## 🎨 Interface

- **Dark theme** optimized for development environments
- **Compact, responsive design** that works on all screen sizes
- **Dynamic form elements** that adapt to content
- **Real-time feedback** with success/error notifications
- **Template system** for quick payload testing

## 🛠️ Setup Instructions

### 1. Firebase Project Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Navigate to **Project Settings** → **Service accounts**
4. Click **Generate new private key** to download the service account JSON file
5. Note down your project ID, client email, and private key

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
```

**Important:** Make sure to wrap the private key in quotes and use `\n` for line breaks.

### 3. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Usage

### Quick Templates

Choose from pre-built templates.

### Sending Notifications

1. **Choose a template** (optional): Click any template to auto-fill the form
2. **Enter notification details**:
   - **Title**: The notification title
   - **Body**: The notification message
3. **Select target type**:
   - **Single Token**: Send to one specific device
   - **Multiple Tokens**: Send to multiple devices using dynamic input fields
   - **Topic**: Send to all subscribers of a topic
4. **Configure target**:
   - For single tokens: Enter the FCM token
   - For multiple tokens: Use individual input fields with add/remove functionality
   - For topics: Enter the topic name
5. **Add custom payload** (optional): JSON data for app-specific actions
6. **Send**: Click the "Send Notification" button

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

## 🔧 Troubleshooting

### Common Issues

1. **"Firebase admin initialization error"**
   - Check your environment variables
   - Ensure the private key is properly formatted with `\n` for line breaks

2. **"Invalid registration token"**
   - The device token might be expired or invalid
   - Generate a new token from your client app

3. **"Topic name is invalid"**
   - Topic names must match the pattern `[a-zA-Z0-9-_.~%]+`
   - No spaces or special characters except `-`, `_`, `.`, `~`, `%`

4. **"All X tokens failed to receive notification"**
   - Check that the tokens are valid and active
   - Ensure your Firebase project has proper permissions

### Validation

- Ensure your Firebase project has Cloud Messaging enabled
- Check that your service account has the necessary permissions
- Verify that the target device/app is properly configured to receive notifications

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (dark theme)
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Backend**: Firebase Admin SDK
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
│   └── push-notification-form.tsx  # Main form component
├── lib/
│   ├── firebase-admin.ts  # Firebase admin setup
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
- [Tailwind CSS](https://tailwindcss.com/)
