import { useState, useEffect } from "react";
import { useToast } from "../components/ui/Toast";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { fetchOrders } from "../redux/action";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";
import { formatOrderNumber } from "../utils/orderUtils";

type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  price: string | number;
  product?: {
    id: number;
    name: string;
    price: string | number;
  };
};

type Order = {
  id: number;
  total_amount: string | number;
  status: string;
  shipping_address: string;
  items: OrderItem[];
  created_at: string;
};

const TABS = ["All", "Pending", "Completed", "Cancelled"] as const;

export const useOrdersData = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

  const reduxOrders = useAppSelector((state) => state.orders.items);
  const reduxLoading = useAppSelector((state) => state.orders.isLoading);

  const [orders, setOrders] = useState<Order[]>(reduxOrders);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState<number | null>(null);
  const [reviewOrderItemId, setReviewOrderItemId] = useState<number | null>(null);
  const [reviewProductName, setReviewProductName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    dispatch(fetchOrders(reduxOrders.length === 0));

    // Silently poll in the background every 30 seconds for admin status updates
    const interval = setInterval(() => {
      dispatch(fetchOrders(false));
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, reduxOrders.length]);

  useEffect(() => {
    setOrders(reduxOrders);
    if (reduxOrders.length > 0 && expandedOrders.size === 0) {
      setExpandedOrders(new Set([reduxOrders[0].id]));
    }
  }, [reduxOrders]);

  const toggleExpand = async (orderId: number) => {
    const isExpanding = !expandedOrders.has(orderId);
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });

    if (isExpanding) {
      try {
        const res = await apiClient.get(`${API_ENDPOINTS.ORDERS}/${orderId}`);
        if (res.ok) {
          const d = await res.json();
          const latestOrder = d.order || d.data;
          if (latestOrder) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...latestOrder } : o));
          }
        }
      } catch (err) {
        console.warn("Failed to refresh order details:", err);
      }
    }
  };

  const handleCancelOrder = (orderId: number) => {
    showConfirm({
      title: "Cancel Order",
      message: "Are you sure you want to cancel this order? This action cannot be undone.",
      confirmText: "Cancel Order",
      cancelText: "Keep Order",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await apiClient.post(`${API_ENDPOINTS.ORDERS}/${orderId}/cancel`, {});
          if (res.ok) {
            setOrders(p => p.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o));
            showToast({ message: "Order cancelled successfully", type: "success" });
          } else {
            showToast({ message: "Failed to cancel order", type: "error" });
          }
        } catch {
          showToast({ message: "Network error — try again", type: "error" });
        }
      }
    });
  };

  const openReviewModal = (productId: number, productName: string, orderItemId: number) => {
    setReviewProductId(productId);
    setReviewOrderItemId(orderItemId);
    setReviewProductName(productName);
    setReviewRating(0);
    setReviewComment("");
    setIsAnonymous(false);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async () => {
    if (reviewRating === 0) {
      showToast({ message: "Please select a star rating", type: "warning" });
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await apiClient.post(`${API_ENDPOINTS.PRODUCTS}/${reviewProductId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
        order_item_id: reviewOrderItemId,
        is_anonymous: isAnonymous,
      });
      if (res.ok) {
        setShowReviewModal(false);
        showToast({ message: "Review submitted! Thank you 🌟", type: "success" });
        setReviewRating(0);
        setReviewComment("");
        setIsAnonymous(false);
        setReviewOrderItemId(null);
        // Instantly refresh orders list to show the new Rated state
        dispatch(fetchOrders(false));
      } else {
        showToast({ message: "Failed to submit review", type: "error" });
      }
    } catch {
      showToast({ message: "Network error — try again", type: "error" });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const matchTab = (status: string, tab: string) => {
    const s = status.toLowerCase();
    const t = tab.toLowerCase();
    if (t === "all") return true;
    if (t === "completed") return s === "completed" || s === "delivered";
    if (t === "pending") return s === "pending" || s === "processing" || s === "shipped";
    return s === t;
  };

  const filtered = orders.filter(o => {
    const tabOk = matchTab(o.status, activeTab);
    const formattedNum = formatOrderNumber(o.id, o.created_at).toLowerCase();
    const searchOk =
      !searchQuery ||
      o.items?.some(i => i.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      String(o.id).includes(searchQuery) ||
      formattedNum.includes(searchQuery.toLowerCase());
    return tabOk && searchOk;
  });

  return {
    // Data
    orders,
    filtered,
    reduxLoading,
    activeTab,
    searchQuery,
    expandedOrders,
    TABS,

    // Review modal state
    showReviewModal,
    reviewProductName,
    reviewRating,
    reviewComment,
    isAnonymous,
    isSubmittingReview,

    // Setters
    setActiveTab,
    setSearchQuery,
    setReviewRating,
    setReviewComment,
    setIsAnonymous,
    setShowReviewModal,

    // Handlers
    toggleExpand,
    handleCancelOrder,
    openReviewModal,
    handleReviewSubmit,
    matchTab,
  };
};
