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

    // Cache check for GET requests using Redux store
    if (method === "GET") {
      try {
        const { store } = require("@/redux/store");
        const cache = store.getState().cache.cache;
        const cached = cache[url];
        // Cache lifetime is 10 seconds to keep data fresh but avoid excessive network request calls
        if (cached && Date.now() - cached.timestamp < 10000) {
          const data = cached.data;
          const cachedResponse = new Response(JSON.stringify(data), {
            status: 200,
            headers: new Headers({ "Content-Type": "application/json" }),
          });
          cachedResponse.json = async () => data;
          cachedResponse.text = async () => JSON.stringify(data);

          apiLogger.logResponse(method, endpoint, 200, startTime, data);
          return cachedResponse;
        }
      } catch (e) {
        // Redux store not loaded yet, proceed to fetch
      }
    }

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

      // Pre-read response stream to avoid React Native clone/stream bugs
      let responseData: any = null;
      let rawText = "";
      try {
        rawText = await response.text();
        try {
          responseData = JSON.parse(rawText);
        } catch {
          responseData = rawText;
        }
      } catch (err) {
        console.warn("Failed to read response body", err);
      }

      // Override methods so callers can safely read body multiple times
      response.json = async () => {
        if (typeof responseData === "object" && responseData !== null) {
          return responseData;
        }
        return JSON.parse(rawText);
      };
      response.text = async () => rawText;

      // Save GET response data to Redux cache
      if (method === "GET" && response.ok && responseData) {
        try {
          const { store } = require("@/redux/store");
          store.dispatch({
            type: "cache/SET_API_CACHE",
            payload: { url, data: responseData, timestamp: Date.now() },
          });
        } catch (e) {
          console.warn("Failed to write to Redux cache", e);
        }
      }

      // Invalidate all GET cache on data mutation (POST, PUT, DELETE)
      if (method !== "GET" && response.ok) {
        try {
          const { store } = require("@/redux/store");
          store.dispatch({ type: "cache/CLEAR_API_CACHE" });
        } catch (e) {
          console.warn("Failed to clear Redux cache", e);
        }
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
