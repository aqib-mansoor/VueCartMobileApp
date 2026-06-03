import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * CartVue Centralized API Network Client
 * 
 * Update BASE_URL below to redirect all endpoints to your production server instantly.
 */

import { Platform } from "react-native";

// Default Base URL read from environment variables or hardcoded local server
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android" ? "http://10.0.2.2:8000/api" : "http://localhost:8000/api");

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: any;
};

export const apiClient = {
  /**
   * Execute an API HTTP request with automatic headers and token injection.
   */
  request: async (endpoint: string, options: RequestOptions = {}) => {
    // Format full request path
    const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

    const headers = new Headers(options.headers || {});
    
    // Automatically set content types
    headers.set("Accept", "application/json");
    headers.set("Content-Type", "application/json");

    // Fetch saved access token from AsyncStorage to attach Authorization headers
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (e) {
      console.warn("Could not read auth token from AsyncStorage", e);
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    return fetch(url, fetchOptions);
  },

  get: (endpoint: string, options?: RequestOptions) => {
    return apiClient.request(endpoint, { ...options, method: "GET" });
  },

  post: (endpoint: string, body: any, options?: RequestOptions) => {
    return apiClient.request(endpoint, { ...options, method: "POST", body });
  },

  put: (endpoint: string, body: any, options?: RequestOptions) => {
    return apiClient.request(endpoint, { ...options, method: "PUT", body });
  },

  delete: (endpoint: string, options?: RequestOptions) => {
    return apiClient.request(endpoint, { ...options, method: "DELETE" });
  },
};
