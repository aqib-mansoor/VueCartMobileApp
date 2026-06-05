import AsyncStorage from "@react-native-async-storage/async-storage";
import * as types from "./action-types";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";
import { User, CartItem, CartMeta, Product } from "./reducer";

// Helper to calculate totals locally if meta is missing
const calculateLocalMeta = (items: CartItem[]): CartMeta => {
  const total_items = items.reduce((sum, item) => sum + item.quantity, 0);
  const grand_total = items.reduce((sum, item) => sum + item.quantity * Number(item.price), 0);
  return { total_items, grand_total };
};

// ─── AUTH ACTION CREATORS ──────────────────────────────────
export const setAuth = (token: string, user: User) => ({
  type: types.SET_AUTH,
  payload: { token, user },
});

export const clearAuth = () => ({
  type: types.CLEAR_AUTH,
});

export const setAuthLoading = (isLoading: boolean) => ({
  type: types.SET_AUTH_LOADING,
  payload: isLoading,
});

// Auth Thunks
export const loadAuth = () => async (dispatch: any) => {
  try {
    const storedToken = await AsyncStorage.getItem("authToken");
    const storedUser = await AsyncStorage.getItem("user");
    if (storedToken && storedUser) {
      dispatch(setAuth(storedToken, JSON.parse(storedUser)));
    }
  } catch (e) {
    console.error("Failed to load auth data", e);
  } finally {
    dispatch(setAuthLoading(false));
  }
};

export const login = (token: string, user: User) => async (dispatch: any) => {
  try {
    await AsyncStorage.setItem("authToken", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));
    dispatch(setAuth(token, user));
  } catch (e) {
    console.error("Failed to save auth data", e);
  }
};

export const logout = () => async (dispatch: any) => {
  try {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("user");
    dispatch(clearAuth());
  } catch (e) {
    console.error("Failed to clear auth data", e);
  }
};


// ─── CART ACTION CREATORS ──────────────────────────────────
export const setCart = (items: CartItem[], meta: CartMeta) => ({
  type: types.SET_CART,
  payload: { items, meta },
});

export const setCartLoading = (isLoading: boolean) => ({
  type: types.SET_CART_LOADING,
  payload: isLoading,
});

export const setAddingToCartId = (productId: number | null) => ({
  type: types.SET_ADDING_TO_CART_ID,
  payload: productId,
});

// Cart Thunks
export const fetchCart = () => async (dispatch: any) => {
  dispatch(setCartLoading(true));
  try {
    const res = await apiClient.get(API_ENDPOINTS.CART);
    if (!res.ok) throw new Error("Failed to fetch cart");
    const data = await res.json();
    const records = data.records || data;
    const items = records.cart || records.data || data.cart || data.data || [];
    const meta = records.meta || data.meta || calculateLocalMeta(items);
    dispatch(setCart(items, { total_items: meta.total_items, grand_total: Number(meta.grand_total) }));
  } catch (err) {
    console.error(err);
  } finally {
    dispatch(setCartLoading(false));
  }
};

export const addToCart = (productId: number, quantity: number) => async (dispatch: any) => {
  dispatch(setAddingToCartId(productId));
  try {
    const res = await apiClient.post(API_ENDPOINTS.CART, { product_id: productId, quantity });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add to cart");
    await dispatch(fetchCart());
    return data;
  } finally {
    dispatch(setAddingToCartId(null));
  }
};

export const updateCartQuantity = (itemId: number, quantity: number) => async (dispatch: any) => {
  try {
    const res = await apiClient.put(`${API_ENDPOINTS.CART}/${itemId}`, { quantity });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update quantity");
    await dispatch(fetchCart());
    return data;
  } catch (err) {
    throw err;
  }
};

export const removeFromCart = (itemId: number) => async (dispatch: any) => {
  try {
    const res = await apiClient.delete(`${API_ENDPOINTS.CART}/${itemId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to remove item");
    await dispatch(fetchCart());
    return data;
  } catch (err) {
    throw err;
  }
};

export const clearCart = () => async (dispatch: any) => {
  try {
    const res = await apiClient.delete(API_ENDPOINTS.CART_CLEAR);
    if (!res.ok) throw new Error("Failed to clear cart");
    await dispatch(fetchCart());
  } catch (err) {
    throw err;
  }
};


// ─── FAVORITES ACTION CREATORS ─────────────────────────────
export const setFavorites = (items: Product[], favoritedIds: number[]) => ({
  type: types.SET_FAVORITES,
  payload: { items, favoritedIds },
});

export const setFavoritesLoading = (isLoading: boolean) => ({
  type: types.SET_FAVORITES_LOADING,
  payload: isLoading,
});

// Favorites Thunks
export const fetchFavorites = () => async (dispatch: any) => {
  dispatch(setFavoritesLoading(true));
  try {
    const res = await apiClient.get(API_ENDPOINTS.FAVORITES);
    if (!res.ok) throw new Error("Failed to fetch favorites");
    const data = await res.json();
    const favList = data.records || data.favorites || data.data || [];
    const items = favList.map((fav: any) => fav.product).filter(Boolean);
    const favoritedIds = favList.map((fav: any) => Number(fav.product_id));
    dispatch(setFavorites(items, favoritedIds));
  } catch (err) {
    console.error(err);
  } finally {
    dispatch(setFavoritesLoading(false));
  }
};

export const toggleFavorite = (productId: number) => async (dispatch: any, getState: any) => {
  const { favorites } = getState();
  const isFav = favorites.favoritedIds.includes(productId);

  if (isFav) {
    const res = await apiClient.delete(`${API_ENDPOINTS.FAVORITES}/${productId}`);
    if (!res.ok) throw new Error("Failed to remove from favorites");
    await dispatch(fetchFavorites());
    return { productId, action: "removed" };
  } else {
    const res = await apiClient.post(API_ENDPOINTS.FAVORITES, { product_id: productId });
    if (!res.ok) throw new Error("Failed to add to favorites");
    await dispatch(fetchFavorites());
    return { productId, action: "added" };
  }
};
