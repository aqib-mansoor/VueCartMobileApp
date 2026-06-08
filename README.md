# VueCart Frontend 📱

VueCart is a premium, state-of-the-art e-commerce mobile application built on top of **React Native** and **Expo SDK 56**. It features a modern design, file-based routing, global state management via Redux Toolkit, and a robust centralized API network layer with automatic response caching.

---

## 🚀 Key Features

*   **Authentication Flow**: Clean Login & Registration pages with full validation, persistent token storage, and automatic redirection.
*   **Dynamic Home Dashboard**: Features a search bar, active order trackers, category filters, and an auto-scrolling promotional slider (`AutoPromoSlider`).
*   **Interactive Product Cards**: Micro-interactions, live stock checks, quick-add-to-cart, and favorite toggling.
*   **Product Detail Modal**: An immersive bottom-sheet style detail view showing rich descriptions, reviews, specifications, and custom quantities.
*   **Cart & Checkout Management**: Detailed checkout flow with optimistic state updates to ensure zero UI delay.
*   **Order History & Tracking**: Real-time order progress tracking (`ActiveOrderTracker`) mapping out packing, shipping, and delivery status.
*   **Centralized API Client**: Custom fetch client with bearer token injection, global 401 interceptor, and 10-second automatic GET request caching.
*   **Global Custom UI Modules**: Animated toast notifications (`Toast`), confirmation dialogs (`ConfirmDialog`), and premium visual effects like glassmorphism.

---

## 🛠️ Tech Stack & Dependencies

*   **Framework**: [Expo SDK 56.0.0](https://docs.expo.dev/versions/v56.0.0/)
*   **Routing**: [Expo Router v56](https://docs.expo.dev/router/introduction/) (File-based navigation)
*   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) (`react-redux`)
*   **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
*   **Icons**: [Lucide React Native](https://lucide.dev/icons/)
*   **Storage**: [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) for session caching
*   **Styling**: Premium stylesheets utilizing glassmorphic and linear gradient elements (`expo-glass-effect`, `expo-linear-gradient`).

---

## 📂 Directory Structure

Here is a breakdown of the core frontend architecture:

```text
Frontend/
├── assets/                 # App icons, splash screens, and images
├── src/
│   ├── app/                # Expo Router App Entry & Routes
│   │   ├── (auth)/         # Authentication Screens (login, register)
│   │   ├── (screens)/      # Main Screens (home, cart, checkout, favorites, orders, profile)
│   │   ├── _layout.tsx     # Global Providers (Redux, Toast, Fonts)
│   │   └── index.tsx       # Root gateway check
│   │
│   ├── components/         # Reusable Component Modules
│   │   ├── home/           # Home sub-components (ProductCard, WelcomeHeader, AutoPromoSlider)
│   │   ├── ui/             # Core UI components (Toast, ConfirmDialog)
│   │   └── cart/checkout/  # Feature-specific components
│   │
│   ├── redux/              # Redux State Management
│   │   ├── action-types.ts # Action type definitions
│   │   ├── action.ts       # Async API Thunks & Action dispatchers
│   │   ├── reducer.ts      # Store Reducers (Auth, Cart, Favorites, Orders, Cache)
│   │   └── store.ts        # Configured Redux Store & hooks
│   │
│   ├── utils/              # Utility Libraries
│   │   ├── api.ts          # Centralized API client (GET Cache, Token injection)
│   │   ├── apiLogger.ts    # Custom API Logger formatting requests/responses
│   │   └── orderUtils.ts   # Helper utilities for tracking & ordering
│   └── styles/             # Common theme tokens & styling
```

---

## ⚡ Setup & Installation

### 1. Prerequisites
Ensure you have Node.js installed, along with either an Android Emulator, iOS Simulator, or the **Expo Go** app on your physical device.

### 2. Install Dependencies
Navigate to the frontend directory and install the necessary npm packages:
```bash
npm install
```

### 3. Configure API Connection
To redirect all endpoints to your backend server, configure your `.env` file or adjust the default fallback URL in [src/utils/api.ts](file:///d:/project/VueCart/Frontend/src/utils/api.ts):
```typescript
// Local development server URL
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.10.20.238:8000/api";
```

### 4. Running the App
Start the Expo development server:
```bash
# Start default dev server
npx expo start

# Run on specific platforms
npm run android  # Open on Android Emulator
npm run ios      # Open on iOS Simulator
npm run web      # Open in Web Browser
```

---

## 📡 Networking & Cache Strategy

The application uses a custom `apiClient` located in `src/utils/api.ts` that manages the following automated tasks:
1. **Authorization**: Injects `Authorization: Bearer <token>` automatically if `authToken` is found in AsyncStorage.
2. **Response Cache**: Caches all `GET` request responses in Redux with a **10-second** lifetime. Repeated requests within 10 seconds return cached results instantly to optimize battery and bandwidth.
3. **Cache Invalidation**: Any mutating request method (`POST`, `PUT`, `DELETE`) automatically clears the cache database to guarantee data fresh-state sync.
4. **Auth Expiry**: Listens for `401 Unauthenticated` statuses, clears local storage state automatically, and redirects back to the login screen.
