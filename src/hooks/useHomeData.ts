import { useState, useEffect, useMemo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";
import { ROUTES } from "../constants/routes";
import { useToast } from "../components/ui/Toast";
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
  const favoritedProductIds = useMemo(() => new Set<number>(favoritedIdsArray), [favoritedIdsArray]);
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
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  // Review Modal States for Delivered Items
  const [reviewPromptItem, setReviewPromptItem] = useState<{ orderItemId: number; productId: number; productName: string } | null>(null);
  const [dismissedReviewItemIds, setDismissedReviewItemIds] = useState<number[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { openProductId } = useLocalSearchParams<{ openProductId?: string }>();

  // Background polling for active and recently delivered orders
  useEffect(() => {
    if (!authToken) {
      setActiveOrder(null);
      setReviewPromptItem(null);
      return;
    }
    const checkActiveOrders = async () => {
      try {
        const res = await apiClient.get(`${API_ENDPOINTS.ORDERS}?nocache=${Date.now()}`);
        if (res.ok) {
          const d = await res.json();
          const list = d.records || d.data || d || [];
          if (Array.isArray(list)) {
            // 1. Check for active orders
            const active = list.find((o: any) =>
              ["pending", "processing", "shipped"].includes(o.status?.toLowerCase())
            );
            setActiveOrder(active || null);

            // 2. Check for delivered orders that have unreviewed items not yet dismissed
            const deliveredOrders = list.filter((o: any) =>
              ["delivered", "completed"].includes(o.status?.toLowerCase())
            );
            
            let promptItemFound = null;
            for (const order of deliveredOrders) {
              if (order.items && Array.isArray(order.items)) {
                const unreviewedItem = order.items.find((item: any) =>
                  !item.is_reviewed && !dismissedReviewItemIds.includes(item.id)
                );
                if (unreviewedItem) {
                  promptItemFound = {
                    orderItemId: unreviewedItem.id,
                    productId: unreviewedItem.product_id,
                    productName: unreviewedItem.product?.name || unreviewedItem.name || "Product",
                  };
                  break;
                }
              }
            }
            setReviewPromptItem(promptItemFound);
          }
        }
      } catch (err) {
        console.warn("Failed to check active orders:", err);
      }
    };
    checkActiveOrders();
    const interval = setInterval(checkActiveOrders, 7000);
    return () => clearInterval(interval);
  }, [authToken, dismissedReviewItemIds]);

  const handleDismissReviewPrompt = () => {
    if (reviewPromptItem) {
      setDismissedReviewItemIds(prev => [...prev, reviewPromptItem.orderItemId]);
      setReviewPromptItem(null);
    }
  };

  const handleSubmitReviewPrompt = async () => {
    if (!reviewPromptItem) return;
    if (reviewRating === 0) {
      showToast({ message: "Please select a star rating", type: "warning" });
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await apiClient.post(`${API_ENDPOINTS.PRODUCTS}/${reviewPromptItem.productId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
        order_item_id: reviewPromptItem.orderItemId,
        is_anonymous: isAnonymous,
      });
      if (res.ok) {
        showToast({ message: "Review submitted! Thank you 🌟", type: "success" });
        setDismissedReviewItemIds(p => [...p, reviewPromptItem.orderItemId]);
        setReviewPromptItem(null);
        setReviewRating(0);
        setReviewComment("");
        setIsAnonymous(false);
      } else {
        showToast({ message: "Failed to submit review", type: "error" });
      }
    } catch {
      showToast({ message: "Network error — try again", type: "error" });
    } finally {
      setIsSubmittingReview(false);
    }
  };

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

  // Handle Add to Cart — optimistic: show toast immediately, API syncs in background
  const handleAddToCart = (productId: number) => {
    if (!authToken) {
      showToast({ message: "Please log in to add items to cart", type: "warning" });
      setTimeout(() => router.push(ROUTES.LOGIN as any), 1200);
      return;
    }

    // Show success toast immediately — optimistic update already bumped cart count
    showToast({ message: "Added to cart! 🎉", type: "success" });

    dispatch(addToCart(productId, 1)).catch((err: any) => {
      // If the actual API call fails, show an error toast
      showToast({ message: err?.message || "Failed to add to cart", type: "error" });
    });
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
    activeOrder,
    reviewPromptItem,
    reviewRating,
    reviewComment,
    isAnonymous,
    isSubmittingReview,
    setReviewRating,
    setComment: setReviewComment,
    setIsAnonymous,
    handleDismissReviewPrompt,
    handleSubmitReviewPrompt,
    handleSelectCategory,
    handleAddToCart,
    handleToggleFavorite,
    handleLoadMore,
    handleLogout,
    fetchProducts,
  };
};
