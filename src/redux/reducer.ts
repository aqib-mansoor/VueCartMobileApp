import { combineReducers } from "redux";
import * as types from "./action-types";

// User type definition
export type User = {
  name?: string;
  email: string;
  age?: number;
  phone?: string;
};

// Cart Item type definition
export type CartItem = {
  cart_item_id: number;
  product_id: number;
  name: string;
  price: string | number;
  quantity: number;
  total_price: number;
};

// Cart Meta type definition
export type CartMeta = {
  total_items: number;
  grand_total: number;
};

// Product type definition
export type Product = {
  id: number;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  category_id: number;
  category?: { name: string };
};

// Auth Reducer
interface AuthState {
  authToken: string | null;
  user: User | null;
  isLoading: boolean;
}

const initialAuthState: AuthState = {
  authToken: null,
  user: null,
  isLoading: true,
};

function authReducer(state = initialAuthState, action: any): AuthState {
  switch (action.type) {
    case types.SET_AUTH:
      return {
        ...state,
        authToken: action.payload.token,
        user: action.payload.user,
      };
    case types.CLEAR_AUTH:
      return {
        ...state,
        authToken: null,
        user: null,
      };
    case types.SET_AUTH_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Cart Reducer
interface CartState {
  items: CartItem[];
  meta: CartMeta;
  isLoading: boolean;
  isAddingToCartId: number | null;
}

const initialCartState: CartState = {
  items: [],
  meta: { total_items: 0, grand_total: 0 },
  isLoading: false,
  isAddingToCartId: null,
};

function cartReducer(state = initialCartState, action: any): CartState {
  switch (action.type) {
    case types.SET_CART:
      return {
        ...state,
        items: action.payload.items,
        meta: action.payload.meta,
      };
    case types.SET_CART_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case types.SET_ADDING_TO_CART_ID:
      return {
        ...state,
        isAddingToCartId: action.payload,
      };
    // Instantly bump the cart count before API responds — real sync happens after
    case types.OPTIMISTIC_ADD_TO_CART:
      return {
        ...state,
        meta: {
          ...state.meta,
          total_items: state.meta.total_items + action.payload,
        },
      };
    default:
      return state;
  }
}

// Favorites Reducer
interface FavoritesState {
  items: Product[];
  favoritedIds: number[];
  isLoading: boolean;
}

const initialFavoritesState: FavoritesState = {
  items: [],
  favoritedIds: [],
  isLoading: false,
};

function favoritesReducer(state = initialFavoritesState, action: any): FavoritesState {
  switch (action.type) {
    case types.SET_FAVORITES:
      return {
        ...state,
        items: action.payload.items,
        favoritedIds: action.payload.favoritedIds,
      };
    case types.SET_FAVORITES_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Orders Reducer
interface OrdersState {
  items: any[];
  isLoading: boolean;
}

const initialOrdersState: OrdersState = {
  items: [],
  isLoading: false,
};

function ordersReducer(state = initialOrdersState, action: any): OrdersState {
  switch (action.type) {
    case types.SET_ORDERS:
      return {
        ...state,
        items: action.payload,
      };
    case types.SET_ORDERS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

export const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  favorites: favoritesReducer,
  orders: ordersReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
