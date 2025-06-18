# ChatApp

**Mobile chat application with a notebook & post-it UI theme**

---

## 📖 Description
ChatApp is a real-time one-to-one & group chat application built with React Native CLI and Socket.IO. It features a unique notebook-inspired interface with lined-paper backgrounds and post-it note message bubbles for a personal, analogue feel.

## ✨ Features
- **Lined-paper UI**: Consistent notebook-style background across all screens
- **Post-it message bubbles**: Pastel-colored bubbles with spring animation on arrival
- **One-to-one & global chat**: Switch between global room and private conversations
- **Auth screens**: Themed Login & Register forms with lined-paper and post-it inputs
- **Presence & last seen**: Real-time online/offline indicators with "last seen" timestamps
- **Read receipts**: Double-tick status for message read confirmation
- **Persistent storage**: Offline message history saved in AsyncStorage and synced on reconnect
- **Message management**: Delete single messages or clear entire chat (both client & server)

## 🚀 Tech Stack
- **Frontend**: React Native CLI, TypeScript, Zustand/MobX (state), React Native Reanimated
- **Backend**: Node.js, Express, MongoDB, JWT, Socket.IO
- **Storage**: AsyncStorage for offline caching
- **UI**: Ionicons, react-native-safe-area-context, ImageBackground for textures, reanimated for animations
- **Calendar & Date**: date-fns for last-seen formatting

## 🛠 Installation & Setup
1. Clone the repo:
   ```bash
   git clone https://github.com/Enver-Onur-Cogalan/chatApp.git
   cd chatapp
   ```
2. Install dependencies:
   ```bash
   yarn install
   cd ios && pod install && cd ..
   ```
3. Add assets:
   - Place `lined-paper.png` in `assets/` folder
4. Create a `.env` file in root with:
   ```env
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-secret>
   ```
5. Start backend server:
   ```bash
   cd server
   yarn start
   ```
6. Run mobile app:
   ```bash
   yarn android   # or yarn ios
   ```

## 🎨 UI & Theming
- All colors, fonts and dimensions are centralized in `src/theme/theme.ts`
- Post-it colors: `#FFF2A6`, `#A7FFC4`, `#A6E0FF`, …
- Handwriting font: `Patrick Hand` for headings, `Reenie Beanie` for subheaders

## 🧩 Architecture

<pre markdown> ## 🧩 Architecture ``` chatapp-backend/ ├─ controllers/ │ └─ authController.js ├─ middlewares/ │ └─ authMiddleware.js ├─ models/ │ ├─ Message.js │ └─ User.js ├─ routes/ │ ├─ authRoutes.js │ ├─ chatRoutes.js │ ├─ messageRoutes.js │ └─ userRoutes.js ├─ sockets/ │ └─ socketManager.js └─ server.js chatapp-frontend/ ├─ src/ │ ├─ assets/ │ │ └─ lined-paper.png │ ├─ components/ │ │ ├─ modals/ │ │ │ └─ UserListModal.tsx │ │ ├─ ChatMessage.tsx │ │ └─ MessageBubble.tsx │ ├─ hooks/ │ │ └─ useChat.tsx │ ├─ navigation/ │ │ └─ AppNavigator.tsx │ ├─ screens/ │ │ ├─ ChatScreen.tsx │ │ ├─ LoginScreen.tsx │ │ └─ RegisterScreen.tsx │ ├─ services/ │ │ └─ chatStorageService.tsx │ ├─ stores/ │ │ └─ authStore.tsx │ ├─ theme/ │ │ └─ theme.ts │ └─ utils/ │ └─ socket.ts └─ App.tsx ``` </pre>

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/YourFeature\`)
3. Commit your changes (\`git commit -m "feat: description"\`)
4. Push to the branch (\`git push origin feature/YourFeature\`)
5. Open a Pull Request

## 📄 License
MIT © [Onur Cogalan]
