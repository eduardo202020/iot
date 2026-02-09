# React Native Expo Project

This is a React Native Expo project for IoT development.

## Getting Started

1. **Install dependencies** (already done during project creation):
   ```bash
   npm install
   ```

2. **Start development server**:
   Use the VS Code task "Start Expo Dev Server" or run:
   ```bash
   npm start
   ```

## Available Commands

- `npm start` - Start the development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator (requires macOS)
- `npm run web` - Run on web browser
- `npm run reset-project` - Reset to blank project state

## Available Tasks (VS Code)

Run these from the Task Explorer or with Ctrl+Shift+B:
- **Start Expo Dev Server** - Launch development server (default)
- **Run on Web** - Start web version
- **Run on Android** - Deploy to Android
- **Run on iOS** - Deploy to iOS (macOS only)

## Project Structure

- `app.json` - Expo app configuration
- `package.json` - Project dependencies and scripts
- `App.js` - Main application component
- `assets/` - Static assets (images, fonts, etc.)
- `.vscode/tasks.json` - VS Code development tasks

## File-Based Routing

This project uses [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing. Edit files in the app directory to get started.

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Go App](https://expo.dev/go) - Test on physical devices
