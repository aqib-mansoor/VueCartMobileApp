import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";

type Category = {
  id: number;
  name: string;
  description?: string;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  category_id: number;
  category?: { name: string };
};

export const useHomeData = () => {
  const { user, authToken, logout } = useAuth();
  const router = useRouter();

  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Pagination & Loading States
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState<number | null>(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Global Cart Count
  const [cartCount, setCartCount] = useState(0);

  // Selected Product Detail Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Initial Data Loading
  useEffect(() => {
    fetchCategories();
    fetchProducts(1, true);
    if (authToken) {
      fetchCartCount();
    }
  }, [authToken]);

  // Debounced Search trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSearchResults(searchQuery);
      } else {
        setIsSearching(false);
        setPage(1);
        fetchProducts(1, true);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Fetch Categories
  const fetchCategories = async () => {
    setIsCategoriesLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.CATEGORIES);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  // Fetch Products (Paginated)
  const fetchProducts = async (pageNum: number, resetList = false) => {
    if (isProductsLoading) return;
    setIsProductsLoading(true);
    try {
      const endpoint = selectedCategoryId
        ? `${API_ENDPOINTS.CATEGORIES}/${selectedCategoryId}`
        : `${API_ENDPOINTS.PRODUCTS}?page=${pageNum}`;

      const res = await apiClient.get(endpoint);
      if (res.ok) {
        const data = await res.json();

        if (selectedCategoryId) {
          setProducts(data.products || []);
          setLastPage(1);
          setPage(1);
        } else {
          const newProducts = data.data || [];
          if (resetList) {
            setProducts(newProducts);
          } else {
            setProducts((prev) => [...prev, ...newProducts]);
          }
          setPage(data.current_page);
          setLastPage(data.last_page);
        }
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsProductsLoading(false);
    }
  };

  // Fetch Search Results
  const fetchSearchResults = async (query: string) => {
    setIsProductsLoading(true);
    setIsSearching(true);
    try {
      const res = await apiClient.get(`${API_ENDPOINTS.SEARCH_PRODUCTS}?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || data || []);
        setPage(1);
        setLastPage(1);
      } else if (res.status === 400) {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error searching products:", err);
      setProducts([]);
    } finally {
      setIsProductsLoading(false);
    }
  };

  // Fetch Cart Items count
  const fetchCartCount = async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.CART);
      if (res.ok) {
        const data = await res.json();
        if (data.meta) {
          setCartCount(data.meta.total_items || 0);
        }
      }
    } catch (err) {
      console.error("Error fetching cart count:", err);
    }
  };

  // Handle Category Filter Selection
  const handleSelectCategory = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setSearchQuery("");
    setPage(1);
    setIsSearching(false);
    
    setIsProductsLoading(true);
    setTimeout(async () => {
      try {
        const endpoint = categoryId ? `${API_ENDPOINTS.CATEGORIES}/${categoryId}` : `${API_ENDPOINTS.PRODUCTS}?page=1`;
        const res = await apiClient.get(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (categoryId) {
            setProducts(data.products || []);
            setLastPage(1);
          } else {
            setProducts(data.data || []);
            setPage(data.current_page);
            setLastPage(data.last_page);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsProductsLoading(false);
      }
    }, 50);
  };

  // Handle Add to Cart
  const handleAddToCart = async (productId: number) => {
    if (!authToken) {
      Alert.alert(
        "Authentication Required",
        "Log in to your CartVue account to start adding items to your cart.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log In", onPress: () => router.push("/login" as any) },
        ]
      );
      return;
    }

    setIsAddingToCart(productId);
    try {
      const res = await apiClient.post(API_ENDPOINTS.CART, { product_id: productId, quantity: 1 });
      if (res.ok) {
        Alert.alert("Success 🎉", "Product added to your cart!");
        fetchCartCount();
      } else {
        const data = await res.json();
        Alert.alert("Error", data.message || "Failed to add product to cart.");
      }
    } catch (err) {
      Alert.alert("Error", "Could not connect to the server.");
    } finally {
      setIsAddingToCart(null);
    }
  };

  // Load More Products handler
  const handleLoadMore = () => {
    if (page < lastPage && !isProductsLoading && !selectedCategoryId && !isSearching) {
      fetchProducts(page + 1, false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login" as any);
  };

  return {
    user,
    authToken,
    products,
    categories,
    selectedCategoryId,
    page,
    lastPage,
    isProductsLoading,
    isCategoriesLoading,
    isAddingToCart,
    searchQuery,
    setSearchQuery,
    isSearching,
    cartCount,
    selectedProduct,
    setSelectedProduct,
    handleSelectCategory,
    handleAddToCart,
    handleLoadMore,
    handleLogout,
  };
};
