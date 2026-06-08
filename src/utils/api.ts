import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * CartVue Centralized API Network Client
 * 
 * Update BASE_URL below to redirect all endpoints to your production server instantly.
 */

import { Platform } from "react-native";

import { apiLogger } from "./apiLogger";

// Default Base URL read from environment variables or hardcoded local server
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.10.20.238:8000/api";
//const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.18.235:8000/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: any;
};

export const apiClient = {
  /**
   * Execute an API HTTP request with automatic headers and token injection.
   */
  request: async (endpoint: string, options: RequestOptions = {}) => {
    const method = options.method || "GET";
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

    const startTime = Date.now();
    apiLogger.logRequest(method, endpoint, headers, options.body);

    try {
      const response = await fetch(url, fetchOptions);

      // Handle 401 Unauthenticated globally
      if (response.status === 401) {
        try {
          await AsyncStorage.removeItem("authToken");
          await AsyncStorage.removeItem("user");
          const { store } = require("@/redux/store");
          store.dispatch({ type: "auth/CLEAR_AUTH" });
        } catch (e) {
          console.warn("Failed to clear auth on 401 response", e);
        }
      }

      // Use two separate clones: one for JSON attempt, one for text fallback.
      // The original `response` stream is NEVER read here so the caller can safely use it.
      let responseData: any = null;
      try {
        const jsonClone = response.clone();
        responseData = await jsonClone.json();
      } catch {
        try {
          const textClone = response.clone();
          responseData = await textClone.text();
        } catch {}
      }

      apiLogger.logResponse(method, endpoint, response.status, startTime, responseData);
      return response;
    } catch (error: any) {
      apiLogger.logResponse(method, endpoint, 0, startTime, { error: error.message || "Network Error" });
      throw error;
    }
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
