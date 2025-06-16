# Contributing to FCM Push Notification Tester

Thank you for your interest in contributing to the FCM Push Notification Tester! This document provides guidelines and information about contributing to this project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/fcm-push-notification-tester.git
   cd fcm-push-notification-tester
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase credentials
5. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🛠️ Development Workflow

1. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following the coding standards
3. **Test your changes** thoroughly
4. **Commit your changes** with a clear message:
   ```bash
   git commit -m "feat: add new feature description"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request** on GitHub

## 📝 Coding Standards

### Code Style
- Use **TypeScript** for all new code
- Follow **ESLint** configuration (run `npm run lint`)
- Use **Prettier** for code formatting
- Write descriptive variable and function names
- Add JSDoc comments for complex functions

### Component Guidelines
- Use **functional components** with hooks
- Implement **proper TypeScript types**
- Use **shadcn/ui components** when possible
- Follow the **dark theme** design system
- Ensure **responsive design** on all screen sizes

### Commit Messages
Use conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

## 🧪 Testing

- Test all new features manually
- Ensure the application works with:
  - Single device tokens
  - Multiple device tokens
  - Topic subscriptions
  - Template loading
  - Error handling scenarios
- Verify the dark theme displays correctly
- Test responsive design on different screen sizes

## 🎨 UI/UX Guidelines

- Maintain the **dark theme** aesthetic
- Ensure **accessibility** standards are met
- Use **consistent spacing** and **typography**
- Follow **shadcn/ui** design patterns
- Keep the interface **clean and minimal**
- Provide **clear feedback** for user actions

## 📱 Feature Requests

When adding new features, consider:
- **User experience** impact
- **Performance** implications
- **Accessibility** requirements
- **Mobile responsiveness**
- **Dark theme** compatibility

### Potential Areas for Contribution

- **Additional notification templates**
- **Improved error handling**
- **Batch notification scheduling**
- **Notification analytics**
- **Export/import functionality**
- **Advanced payload builders**
- **Integration with other services**

## 🐛 Bug Reports

When reporting bugs, include:
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Browser/OS information**
- **Console errors** (if any)

## 📚 Documentation

- Update **README.md** for new features
- Add **JSDoc comments** to functions
- Update **payload-testcase.md** for new templates
- Include **setup instructions** for new dependencies

## 🔒 Security

- **Never commit** sensitive data (API keys, tokens)
- Use **environment variables** for configuration
- Follow **Firebase security** best practices
- Report security issues privately

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Community

- Be **respectful** and **inclusive**
- Help others learn and grow
- Share **constructive feedback**
- Follow the **code of conduct**

## 📞 Questions?

If you have questions about contributing:
- Open an **issue** for discussion
- Check existing **issues** and **pull requests**
- Review the **README.md** for setup help

Thank you for contributing to make this tool better for everyone! 🚀 