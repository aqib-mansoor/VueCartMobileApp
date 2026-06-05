import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Package, Search, ShoppingBag, Clock, CheckCircle, RotateCcw, XCircle, X, Truck } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { apiClient } from "../../utils/api";
import { API_ENDPOINTS } from "../../constants/endpoints";
import { useToast } from "../../components/Toast";
import { formatOrderNumber } from "../../utils/orderUtils";
import { OrderCard } from "../../components/orders/OrderCard";
import { ReviewModal } from "../../components/orders/ReviewModal";
import { useConfirm } from "../../components/ConfirmDialog";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { fetchOrders } from "../../redux/action";
import { ROUTES } from "../../constants/routes";

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

const TABS = ["All", "Pending", "Completed", "Cancelled"];

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; label: string; Icon: any }> = {
  pending:    { bg: "#FEF9C3", text: "#A16207", border: "#FCD34D", label: "Pending",    Icon: Clock },
  processing: { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A", label: "Processing", Icon: Package },
  shipped:    { bg: "#E0F2FE", text: "#0369A1", border: "#7DD3FC", label: "Shipped",    Icon: Truck },
  delivered:  { bg: "#DCFCE7", text: "#15803D", border: "#86EFAC", label: "Delivered",  Icon: CheckCircle },
  completed:  { bg: "#DCFCE7", text: "#15803D", border: "#86EFAC", label: "Completed",  Icon: CheckCircle },
  cancelled:  { bg: "#FEE2E2", text: "#DC2626", border: "#FCA5A5", label: "Cancelled",  Icon: XCircle },
};

export default function OrdersScreen() {
  const router = useRouter();
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
  const [reviewProductName, setReviewProductName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    dispatch(fetchOrders(reduxOrders.length === 0));

    // Silently poll in the background every 5 seconds for admin updates
    const interval = setInterval(() => {
      dispatch(fetchOrders(false));
    }, 5000);

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

  const openReviewModal = (productId: number, productName: string) => {
    setReviewProductId(productId);
    setReviewProductName(productName);
    setReviewRating(0);
    setReviewComment("");
    setHoveredStar(0);
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
      });
      if (res.ok) {
        setShowReviewModal(false);
        showToast({ message: "Review submitted! Thank you 🌟", type: "success" });
        setReviewRating(0);
        setReviewComment("");
      } else {
        showToast({ message: "Failed to submit review", type: "error" });
      }
    } catch {
      showToast({ message: "Network error — try again", type: "error" });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filtered = orders.filter(o => {
    const tabOk = activeTab === "All" || o.status.toLowerCase() === activeTab.toLowerCase();
    const formattedNum = formatOrderNumber(o.id, o.created_at).toLowerCase();
    const searchOk =
      !searchQuery ||
      o.items?.some(i => i.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      String(o.id).includes(searchQuery) ||
      formattedNum.includes(searchQuery.toLowerCase());
    return tabOk && searchOk;
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const STAR_LABELS = ["", "Terrible", "Bad", "Okay", "Good", "Excellent!"];

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Orders</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Search */}
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Search size={15} color={THEME.colors.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by product name or order ID..."
            placeholderTextColor={THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={15} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={s.tabsContainer}>
        {TABS.map(tab => {
          const active = tab === activeTab;
          const count = tab === "All"
            ? orders.length
            : orders.filter(o => o.status.toLowerCase() === tab.toLowerCase()).length;
          return (
            <TouchableOpacity
              key={tab}
              style={[s.tabItem, active && s.tabItemActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <View style={s.tabTextWrapper}>
                <Text style={[s.tabItemText, active && s.tabItemTextActive]}>{tab}</Text>
                {count > 0 && (
                  <View style={[s.tabItemBadge, active && s.tabItemBadgeActive]}>
                    <Text style={[s.tabItemBadgeText, active && s.tabItemBadgeTextActive]}>{count}</Text>
                  </View>
                )}
              </View>
              {active && <View style={s.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {reduxLoading && orders.length === 0 ? (
        <View style={s.loadingCont}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={s.loadingText}>Loading your orders...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.emptyCont}>
          <View style={s.emptyIcon}><Package size={44} color={THEME.colors.textMuted} /></View>
          <Text style={s.emptyTitle}>{searchQuery ? "No matching orders" : "No orders yet"}</Text>
          <Text style={s.emptySub}>
            {searchQuery ? "Try different search terms" : "Your orders will show up here once you place one"}
          </Text>
          {!searchQuery && (
            <TouchableOpacity style={s.shopNowBtn} onPress={() => router.push(ROUTES.HOME as any)}>
              <ShoppingBag size={15} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={s.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
          {filtered.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              isExpanded={expandedOrders.has(order.id)}
              onToggleExpand={() => toggleExpand(order.id)}
              onCancelOrder={handleCancelOrder}
              onBuyAgain={() => router.push(ROUTES.HOME as any)}
              onRateProduct={openReviewModal}
              statusConfig={STATUS_CONFIG}
            />
          ))}
        </ScrollView>
      )}

      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        productName={reviewProductName}
        rating={reviewRating}
        setRating={setReviewRating}
        comment={reviewComment}
        setComment={setReviewComment}
        onSubmit={handleReviewSubmit}
        isSubmitting={isSubmittingReview}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FA" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#FFF", borderBottomWidth: 1, borderColor: "#EEF2F6" },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: THEME.colors.textPrimary },

  // Search
  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6, backgroundColor: "#FFF" },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  searchInput: { flex: 1, fontSize: 13, color: THEME.colors.textPrimary, fontWeight: "500" },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderColor: "#EEF2F6",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    position: "relative",
  },
  tabItemActive: {},
  tabTextWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textSecondary,
  },
  tabItemTextActive: {
    color: THEME.colors.primary,
    fontWeight: "900",
  },
  tabItemBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: "center",
  },
  tabItemBadgeActive: {
    backgroundColor: THEME.colors.primary + "15",
  },
  tabItemBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: THEME.colors.textSecondary,
  },
  tabItemBadgeTextActive: {
    color: THEME.colors.primary,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: 3,
    backgroundColor: THEME.colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  loadingCont: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, color: THEME.colors.textSecondary, fontWeight: "600" },

  emptyCont: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: THEME.colors.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: 13, color: THEME.colors.textSecondary, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  shopNowBtn: { flexDirection: "row", alignItems: "center", backgroundColor: THEME.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  shopNowText: { color: "#FFF", fontWeight: "800", fontSize: 14 },

  listContent: { padding: 14, gap: 14, paddingBottom: 36 },

  // Order Card
  orderCard: { 
    backgroundColor: "#FFF", 
    borderRadius: 18, 
    borderWidth: 1, 
    borderColor: "#E5E7EB", 
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  orderHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 16, 
    backgroundColor: "#FFF",
    gap: 8,
  },
  orderHeaderExpanded: {
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderColor: "#EEF2F6",
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  orderId: { fontSize: 14, fontWeight: "900", color: THEME.colors.textPrimary, letterSpacing: 0.2 },
  orderDate: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 3 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.2 },

  // Collapsed preview
  collapsedPreview: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderColor: "#F3F4F6" },
  collapsedProductRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
    gap: 12,
  },
  collapsedProductImg: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  collapsedProductInfo: {
    flex: 1,
    justifyContent: "center",
  },
  collapsedProductName: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  collapsedProductMeta: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    fontWeight: "500",
  },
  collapsedMoreText: {
    fontSize: 10,
    color: THEME.colors.primary,
    fontWeight: "700",
    marginTop: 2,
  },
  collapsedRightCol: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  collapsedTotalLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  collapsedTotal: { fontSize: 16, fontWeight: "900", color: THEME.colors.textPrimary },

  // Expanded Content Box
  expandedContent: {
    backgroundColor: "#FFF",
  },

  // Address Card
  addrBox: {
    padding: 16,
    backgroundColor: "#F8FAFC",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addrHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  addrTitle: { fontSize: 12, fontWeight: "800", color: THEME.colors.textPrimary },
  addrText: { fontSize: 11, color: THEME.colors.textSecondary, lineHeight: 16 },

  // Tracking Timeline Design
  timelineContainer: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#FAFDFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2F0E9",
  },
  timelineTrackRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  trackSegmentWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  timelineDotCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    zIndex: 2,
  },
  timelineDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFF",
  },
  timelineLineSegment: {
    height: 3,
    flex: 1,
    marginHorizontal: -2,
    zIndex: 1,
  },
  timelineLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timelineLabelText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: "600",
    width: 58,
    textAlign: "center",
  },
  timelineLabelTextActive: {
    color: THEME.colors.primary,
    fontWeight: "900",
  },
  cancelledBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    padding: 14,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  cancelledBannerText: {
    fontSize: 12,
    color: THEME.colors.error,
    fontWeight: "800",
  },

  // Item List Header
  itemsSectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: THEME.colors.textPrimary,
    marginTop: 18,
    marginHorizontal: 16,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Item Row Card design
  itemRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 12, 
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    backgroundColor: "#F9FAFB",
    gap: 12,
  },
  itemImg: { width: 68, height: 68, borderRadius: 10, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E5E7EB" },
  itemInfo: { flex: 1, justifyContent: "center" },
  itemName: { fontSize: 13, fontWeight: "800", color: THEME.colors.textPrimary, lineHeight: 18 },
  itemMeta: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 4, fontWeight: "500" },
  itemSubtotal: { fontSize: 12, fontWeight: "800", color: THEME.colors.primary, marginTop: 4 },

  // Review button per item
  reviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF5FF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E9D5FF",
    gap: 4,
  },
  reviewBtnText: { fontSize: 11, color: THEME.colors.primary, fontWeight: "800" },

  // Order footer
  orderFooter: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: 16, 
    marginTop: 12,
    borderTopWidth: 1, 
    borderColor: "#EEF2F6", 
    backgroundColor: "#FAFAFA",
  },
  footerTotalLabel: { fontSize: 11, color: THEME.colors.textSecondary, fontWeight: "700" },
  footerTotalVal: { fontSize: 18, fontWeight: "900", color: THEME.colors.textPrimary },
  footerActions: { flexDirection: "row", gap: 8 },
  cancelBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 4, 
    backgroundColor: "#FEF2F2",
    borderRadius: 10, 
    paddingHorizontal: 14, 
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  cancelBtnText: { fontSize: 12, fontWeight: "800", color: THEME.colors.error },
  buyAgainBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 5, 
    backgroundColor: THEME.colors.primary, 
    borderRadius: 10, 
    paddingHorizontal: 14, 
    paddingVertical: 8,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buyAgainText: { fontSize: 12, fontWeight: "800", color: "#FFF" },

  // Review Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#FFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 36 },
  modalHandle: { width: 40, height: 4, backgroundColor: "#D1D5DB", borderRadius: 2, alignSelf: "center", marginBottom: 18 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: THEME.colors.textPrimary },
  modalClose: { padding: 4 },

  reviewProductRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F8FAFC", borderRadius: 14, padding: 12, marginBottom: 18, borderWidth: 1, borderColor: "#E2E8F0" },
  reviewProductImg: { width: 56, height: 56, borderRadius: 10, backgroundColor: "#E2E8F0" },
  reviewProductName: { fontSize: 13, fontWeight: "800", color: THEME.colors.textPrimary, lineHeight: 18 },
  reviewProductHint: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 2 },

  ratingPrompt: { fontSize: 13, fontWeight: "800", color: THEME.colors.textPrimary, textAlign: "center", marginBottom: 12 },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 8 },
  starBtn: { padding: 4 },
  ratingLabel: { textAlign: "center", fontSize: 14, fontWeight: "800", color: "#FBBF24", marginBottom: 14 },

  commentInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    minHeight: 90,
    marginBottom: 16,
  },
  submitBtn: { backgroundColor: THEME.colors.primary, borderRadius: 14, paddingVertical: 14, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  submitBtnDisabled: { backgroundColor: "#CBD5E1" },
  submitBtnText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
});
