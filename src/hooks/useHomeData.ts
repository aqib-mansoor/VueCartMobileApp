import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";
import { ROUTES } from "../constants/routes";
import { useToast } from "../components/Toast";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { fetchCart, addToCart, fetchFavorites, toggleFavorite, logout as logoutAction } from "../redux/action";

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
  const router = useRouter();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();

  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Redux Selectors
  const { user, authToken } = useAppSelector((state) => state.auth);
  const favoritedIdsArray = useAppSelector((state) => state.favorites.favoritedIds);
  const favoritedProductIds = new Set<number>(favoritedIdsArray);
  const cartCount = useAppSelector((state) => state.cart.meta.total_items);
  const isAddingToCart = useAppSelector((state) => state.cart.isAddingToCartId);

  // Pagination & Loading States
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Selected Product Detail Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { openProductId } = useLocalSearchParams<{ openProductId?: string }>();

  useEffect(() => {
    if (openProductId) {
      const fetchAndSelectProduct = async () => {
        try {
          const res = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/${openProductId}`);
          if (res.ok) {
            const data = await res.json();
            const prod = data.records || data.product || data.data;
            if (prod) {
              setSelectedProduct(prod);
              router.setParams({ openProductId: undefined } as any);
            }
          }
        } catch (e) {
          console.warn("Failed to fetch product for buy again:", e);
        }
      };
      fetchAndSelectProduct();
    }
  }, [openProductId]);

  // Initial Data Loading
  useEffect(() => {
    fetchCategories();
    fetchProducts(1, true);
    if (authToken) {
      dispatch(fetchCart(false));
      dispatch(fetchFavorites(false));
    }
  }, [authToken, dispatch]);

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
        const categoryList = data.records || data || [];
        setCategories(categoryList);
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
        const records = data.records || data || {};

        if (selectedCategoryId) {
          setProducts(records.products || records.data || []);
          setLastPage(1);
          setPage(1);
        } else {
          const newProducts = records.data || [];
          if (resetList) {
            setProducts(newProducts);
          } else {
            setProducts((prev) => [...prev, ...newProducts]);
          }
          setPage(records.current_page || 1);
          setLastPage(records.last_page || 1);
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
        const records = data.records || data || [];
        setProducts(records.data || records || []);
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



  // Handle Category Filter Selection
  const handleSelectCategory = async (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setSearchQuery("");
    setProducts([]);
    setPage(1);
    setIsSearching(false);
    setIsProductsLoading(true);
    
    try {
      const endpoint = categoryId ? `${API_ENDPOINTS.CATEGORIES}/${categoryId}` : `${API_ENDPOINTS.PRODUCTS}?page=1`;
      const res = await apiClient.get(endpoint);
      if (res.ok) {
        const data = await res.json();
        const records = data.records || data || {};
        if (categoryId) {
          setProducts(records.products || records.data || []);
          setLastPage(1);
        } else {
          setProducts(records.data || []);
          setPage(records.current_page || 1);
          setLastPage(records.last_page || 1);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProductsLoading(false);
    }
  };

  // Handle Add to Cart
  const handleAddToCart = async (productId: number) => {
    if (!authToken) {
      showToast({ message: "Please log in to add items to cart", type: "warning" });
      setTimeout(() => router.push(ROUTES.LOGIN as any), 1200);
      return;
    }

    try {
      await dispatch(addToCart(productId, 1));
      showToast({ message: "Added to cart! 🎉", type: "success" });
    } catch (err: any) {
      showToast({ message: err || "Failed to add to cart", type: "error" });
    }
  };

  // Handle Favorite Toggle
  const handleToggleFavorite = async (productId: number) => {
    if (!authToken) {
      showToast({ message: "Please log in to manage favorites", type: "warning" });
      setTimeout(() => router.push(ROUTES.LOGIN as any), 1200);
      return;
    }

    try {
      const res = await dispatch(toggleFavorite(productId));
      if (res.action === "added") {
        showToast({ message: "Added to favorites! ❤️", type: "success" });
      } else {
        showToast({ message: "Removed from favorites", type: "info" });
      }
    } catch (err: any) {
      showToast({ message: err || "Failed to update favorites", type: "error" });
    }
  };

  // Load More Products handler
  const handleLoadMore = () => {
    if (page < lastPage && !isProductsLoading && !selectedCategoryId && !isSearching) {
      fetchProducts(page + 1, false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutAction());
    router.replace(ROUTES.LOGIN as any);
  };

  return {
    user,
    authToken,
    products,
    categories,
    selectedCategoryId,
    favoritedProductIds,
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
    handleToggleFavorite,
    handleLoadMore,
    handleLogout,
  };
};
