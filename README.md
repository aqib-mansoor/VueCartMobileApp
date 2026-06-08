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

Here is a comprehensive breakdown of the core frontend architecture:

```text
Frontend/
├── assets/                       # App icons, splash screens, and image assets
├── src/
│   ├── app/                      # Expo Router app entry & routes (file-based navigation)
│   │   ├── (auth)/               # Authentication route screens
│   │   │   ├── login.tsx         # Sign In screen
│   │   │   └── register.tsx      # Sign Up screen
│   │   ├── (screens)/            # Main app route screens
│   │   │   ├── cart.tsx          # Shopping Cart screen
│   │   │   ├── checkout.tsx      # Order Checkout screen
│   │   │   ├── favorites.tsx     # Saved Favorites screen
│   │   │   ├── home.tsx          # Store Home / Product Browsing screen
│   │   │   ├── orders.tsx        # Past and Active Orders list screen
│   │   │   └── profile.tsx       # User Profile & Address settings screen
│   │   ├── _layout.tsx           # Application layout wrapper & global providers (Redux, Toast)
│   │   └── index.tsx             # Root gateway check/redirect logic
│   │
│   ├── components/               # Modular UI Components grouped by feature
│   │   ├── cart/                 # Cart sub-components
│   │   │   ├── CartEmptyState.tsx
│   │   │   ├── CartHeader.tsx
│   │   │   └── CartItemRow.tsx
│   │   ├── checkout/             # Checkout sub-components
│   │   │   ├── CheckoutAddressSection.tsx
│   │   │   ├── CheckoutHeader.tsx
│   │   │   ├── CheckoutSteps.tsx
│   │   │   └── OrderSuccessOverlay.tsx
│   │   ├── favorites/            # Favorites sub-components
│   │   │   ├── FavoritesEmptyState.tsx
│   │   │   └── FavoritesHeader.tsx
│   │   ├── home/                 # Dashboard sub-components
│   │   │   ├── ActiveOrderTracker.tsx
│   │   │   ├── AutoPromoSlider.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductDetailModal.tsx
│   │   │   └── WelcomeHeader.tsx
│   │   ├── orders/               # Orders sub-components
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrdersEmptyState.tsx
│   │   │   ├── OrdersHeader.tsx
│   │   │   └── ReviewModal.tsx
│   │   ├── profile/              # Profile & settings sub-components
│   │   │   ├── AddressPanel.tsx
│   │   │   ├── EditProfileModal.tsx
│   │   │   ├── FavouritesPanel.tsx
│   │   │   ├── InfoModal.tsx
│   │   │   ├── MenuItem.tsx
│   │   │   ├── ProfileHeader.tsx
│   │   │   └── ProfileHero.tsx
│   │   └── ui/                   # Shared design system components
│   │       ├── ConfirmDialog.tsx
│   │       └── Toast.tsx
│   │
│   ├── constants/                # Configuration and Application constants
│   │   ├── endpoints.ts          # API Endpoints registry
│   │   ├── images.ts             # Image asset declarations
│   │   ├── routes.ts             # App route mapping configurations
│   │   └── theme.ts              # Global design system color and font tokens
│   │
│   ├── hooks/                    # Custom React Hooks (Business Logic separation)
│   │   ├── useCartData.ts        # Cart CRUD actions and loader hook
│   │   ├── useCheckoutData.ts    # Shipping address and order checkout validation hook
│   │   ├── useFavoritesData.ts   # Favorites toggling and fetching state hook
│   │   ├── useHomeData.ts        # Home products loading, categories filter and search hook
│   │   ├── useOrdersData.ts      # Active/Past orders history & reviews hook
│   │   └── useProfileData.ts     # User edit profile and address storage hook
│   │
│   ├── redux/                    # Redux Global State Management
│   │   ├── action-types.ts       # Central action type definitions
│   │   ├── action.ts             # Thunk actions and dispatchers
│   │   ├── reducer.ts            # Root combined reducers (auth, cart, favorites, orders, cache)
│   │   └── store.ts              # Redux store config and typed react hooks
│   │
│   ├── styles/                   # Modular layout design stylesheets
│   │   ├── cartStyles.ts
│   │   ├── checkoutStyles.ts
│   │   ├── favoritesStyles.ts
│   │   ├── homeStyles.ts
│   │   ├── ordersStyles.ts
│   │   └── profileStyles.ts
│   │
│   └── utils/                    # Shared Utility methods and helpers
│       ├── api.ts                # Custom API client with interceptors & caching
│       ├── apiLogger.ts          # Advanced Request & Response terminal logging
│       └── orderUtils.ts         # Formatting and mapping of order data
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
