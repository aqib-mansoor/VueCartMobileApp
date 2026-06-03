import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
  Animated,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Package, Star, X, Send, ChevronRight, Search, XCircle, Truck, RotateCcw, ShoppingCart, Filter } from "lucide-react-native";
import { THEME } from "../constants/theme";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";
import { getProductImage } from "../components/ProductCard";

type OrderItem = { product_id: number; name: string; quantity: number; price: string | number; };
type Order = { id: number; total_amount: string | number; status: string; shipping_address: string; items: OrderItem[]; created_at: string; };

const TABS = ["All", "Pending", "Completed", "Cancelled"];

const STATUS_MAP: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  pending: { bg: "#FEF9C3", text: "#A16207", border: "#FBBF24", icon: Package },
  processing: { bg: "#DBEAFE", text: "#1D4ED8", border: "#60A5FA", icon: Package },
  completed: { bg: "#DCFCE7", text: "#15803D", border: "#4ADE80", icon: Package },
  cancelled: { bg: "#FEE2E2", text: "#DC2626", border: "#F87171", icon: XCircle },
};

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Review Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState<number | null>(null);
  const [reviewProductName, setReviewProductName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.ORDERS);
      if (res.ok) { const d = await res.json(); setOrders(d.orders || d.data || []); }
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleCancelOrder = (orderId: number) => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      { text: "Yes, Cancel", style: "destructive", onPress: async () => {
        try {
          const res = await apiClient.post(`${API_ENDPOINTS.ORDERS}/${orderId}/cancel`, {});
          if (res.ok) { setOrders(p => p.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o)); }
          else { Alert.alert("Error", "Failed to cancel."); }
        } catch { Alert.alert("Error", "Network error."); }
      }},
    ]);
  };

  const handleReviewSubmit = async () => {
    if (reviewRating === 0) { Alert.alert("Rating", "Please select a rating."); return; }
    setIsSubmittingReview(true);
    try {
      const res = await apiClient.post(`${API_ENDPOINTS.PRODUCTS}/${reviewProductId}/reviews`, { rating: reviewRating, comment: reviewComment });
      if (res.ok) { Alert.alert("Thank You!", "Review submitted successfully."); setShowReviewModal(false); setReviewRating(0); setReviewComment(""); }
      else { Alert.alert("Error", "Failed to submit review."); }
    } catch { Alert.alert("Error", "Network issue."); }
    finally { setIsSubmittingReview(false); }
  };

  const filtered = orders.filter(o => {
    const tabOk = activeTab === "All" || o.status.toLowerCase() === activeTab.toLowerCase();
    const searchOk = !searchQuery || o.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())) || String(o.id).includes(searchQuery);
    return tabOk && searchOk;
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><ChevronLeft size={24} color={THEME.colors.textPrimary} /></TouchableOpacity>
        <Text style={s.headerTitle}>My Orders</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Search Bar */}
      <View style={s.searchBar}>
        <Search size={16} color={THEME.colors.textMuted} />
        <TextInput
          style={s.searchInput}
          placeholder="Search orders by name or ID..."
          placeholderTextColor={THEME.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}><X size={16} color={THEME.colors.textMuted} /></TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={s.tabsRow}>
        {TABS.map(tab => {
          const active = tab === activeTab;
          const count = tab === "All" ? orders.length : orders.filter(o => o.status.toLowerCase() === tab.toLowerCase()).length;
          return (
            <TouchableOpacity key={tab} style={[s.tab, active && s.tabActive]} onPress={() => setActiveTab(tab)} activeOpacity={0.7}>
              <Text style={[s.tabText, active && s.tabTextActive]}>{tab}</Text>
              {count > 0 && <View style={[s.tabBadge, active && s.tabBadgeActive]}><Text style={[s.tabBadgeText, active && s.tabBadgeTextActive]}>{count}</Text></View>}
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={s.loadingCont}><ActivityIndicator size="large" color={THEME.colors.primary} /><Text style={s.loadingText}>Loading orders...</Text></View>
      ) : filtered.length === 0 ? (
        <View style={s.emptyCont}>
          <View style={s.emptyIcon}><Package size={48} color={THEME.colors.textMuted} /></View>
          <Text style={s.emptyTitle}>{searchQuery ? "No matching orders" : "No orders yet"}</Text>
          <Text style={s.emptySub}>{searchQuery ? "Try a different search term" : "Your orders will appear here after checkout"}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
          {filtered.map(order => {
            const st = STATUS_MAP[order.status.toLowerCase()] || STATUS_MAP.pending;
            const StatusIcon = st.icon;
            return (
              <View key={order.id} style={s.orderCard}>
                {/* Order Header */}
                <View style={s.orderHeader}>
                  <View>
                    <Text style={s.orderId}>Order #{order.id}</Text>
                    <Text style={s.orderDate}>{formatDate(order.created_at)}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
                    <StatusIcon size={12} color={st.text} />
                    <Text style={[s.statusText, { color: st.text }]}>{order.status}</Text>
                  </View>
                </View>

                {/* Items with Images */}
                {order.items.map((item, idx) => (
                  <View key={idx} style={s.orderItemRow}>
                    <Image source={{ uri: getProductImage(item.name) }} style={s.orderItemImg} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.orderItemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={s.orderItemMeta}>Qty: {item.quantity} · ${Number(item.price).toFixed(2)}</Text>
                    </View>
                    {order.status.toLowerCase() === "completed" && (
                      <TouchableOpacity
                        style={s.reviewMiniBtn}
                        onPress={() => { setReviewProductId(item.product_id); setReviewProductName(item.name); setShowReviewModal(true); }}
                      >
                        <Star size={12} color={THEME.colors.primary} /><Text style={s.reviewMiniBtnText}>Rate</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {/* Footer */}
                <View style={s.orderFooter}>
                  <Text style={s.orderTotal}>Total: <Text style={{ color: THEME.colors.primary }}>${Number(order.total_amount).toFixed(2)}</Text></Text>
                  <View style={s.orderActions}>
                    {order.status.toLowerCase() === "pending" && (
                      <TouchableOpacity style={s.cancelBtn} onPress={() => handleCancelOrder(order.id)}>
                        <Text style={s.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                    {order.status.toLowerCase() === "completed" && (
                      <TouchableOpacity style={s.buyAgainBtn} onPress={() => router.push("/home" as any)}>
                        <RotateCcw size={12} color={THEME.colors.primary} /><Text style={s.buyAgainText}>Buy Again</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Review Modal */}
      <Modal visible={showReviewModal} transparent animationType="slide" onRequestClose={() => setShowReviewModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Rate Product</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}><X size={20} color={THEME.colors.textSecondary} /></TouchableOpacity>
            </View>
            <Text style={s.modalProduct}>{reviewProductName}</Text>

            <Text style={s.ratingPrompt}>How was your experience?</Text>
            <View style={s.starsRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} onPress={() => setReviewRating(n)} activeOpacity={0.7}>
                  <Star size={36} color={n <= reviewRating ? "#FBBF24" : "#D1D5DB"} fill={n <= reviewRating ? "#FBBF24" : "transparent"} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.ratingLabel}>{["", "Terrible", "Bad", "Okay", "Good", "Excellent"][reviewRating] || "Tap a star"}</Text>

            <TextInput
              style={s.commentInput}
              placeholder="Write your review (optional)..."
              placeholderTextColor={THEME.colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={reviewComment}
              onChangeText={setReviewComment}
            />

            <TouchableOpacity style={s.submitReviewBtn} onPress={handleReviewSubmit} disabled={isSubmittingReview} activeOpacity={0.9}>
              {isSubmittingReview ? <ActivityIndicator size="small" color="#FFF" /> : <><Send size={16} color="#FFF" style={{ marginRight: 8 }} /><Text style={s.submitReviewText}>Submit Review</Text></>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFF", borderBottomWidth: 1, borderColor: "#E2E8F0" },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "900", color: THEME.colors.textPrimary },

  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", marginHorizontal: 12, marginTop: 10, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#E2E8F0", gap: 8 },
  searchInput: { flex: 1, fontSize: 13, color: THEME.colors.textPrimary, paddingVertical: 4 },

  tabsRow: { flexDirection: "row", backgroundColor: "#FFF", paddingHorizontal: 12, paddingVertical: 8, gap: 6, marginTop: 6, borderBottomWidth: 1, borderColor: "#E2E8F0" },
  tab: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 8, borderRadius: 10, backgroundColor: "#F1F5F9", gap: 4 },
  tabActive: { backgroundColor: THEME.colors.primary },
  tabText: { fontSize: 11, fontWeight: "800", color: THEME.colors.textSecondary },
  tabTextActive: { color: "#FFF" },
  tabBadge: { backgroundColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  tabBadgeActive: { backgroundColor: "rgba(255,255,255,0.3)" },
  tabBadgeText: { fontSize: 9, fontWeight: "800", color: THEME.colors.textSecondary },
  tabBadgeTextActive: { color: "#FFF" },

  loadingCont: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, color: THEME.colors.textSecondary, fontWeight: "600" },
  emptyCont: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: THEME.colors.textPrimary, marginBottom: 4 },
  emptySub: { fontSize: 13, color: THEME.colors.textSecondary, textAlign: "center", lineHeight: 20 },

  listContent: { padding: 12, gap: 10, paddingBottom: 24 },

  orderCard: { backgroundColor: "#FFF", borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", overflow: "hidden" },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottomWidth: 1, borderColor: "#F1F5F9" },
  orderId: { fontSize: 14, fontWeight: "900", color: THEME.colors.textPrimary },
  orderDate: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: "800", textTransform: "capitalize" },

  orderItemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderColor: "#F8FAFC" },
  orderItemImg: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#F1F5F9" },
  orderItemName: { fontSize: 13, fontWeight: "700", color: THEME.colors.textPrimary },
  orderItemMeta: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 2 },
  reviewMiniBtn: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#FAF5FF", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: "#E9D5FF" },
  reviewMiniBtnText: { fontSize: 11, color: THEME.colors.primary, fontWeight: "800" },

  orderFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14 },
  orderTotal: { fontSize: 14, fontWeight: "900", color: THEME.colors.textPrimary },
  orderActions: { flexDirection: "row", gap: 8 },
  cancelBtn: { borderWidth: 1, borderColor: THEME.colors.error, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  cancelBtnText: { fontSize: 12, fontWeight: "800", color: THEME.colors.error },
  buyAgainBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: THEME.colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  buyAgainText: { fontSize: 12, fontWeight: "800", color: THEME.colors.primary },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  modalHandle: { width: 36, height: 4, backgroundColor: "#D1D5DB", borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 16, fontWeight: "900", color: THEME.colors.textPrimary },
  modalProduct: { fontSize: 13, color: THEME.colors.textSecondary, marginTop: 4, marginBottom: 16 },
  ratingPrompt: { fontSize: 14, fontWeight: "700", color: THEME.colors.textPrimary, textAlign: "center", marginBottom: 10 },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 6 },
  ratingLabel: { textAlign: "center", fontSize: 12, color: THEME.colors.textSecondary, fontWeight: "700", marginBottom: 14 },
  commentInput: { backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 14, padding: 12, fontSize: 13, color: THEME.colors.textPrimary, minHeight: 80, marginBottom: 16 },
  submitReviewBtn: { backgroundColor: THEME.colors.primary, borderRadius: 14, paddingVertical: 14, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  submitReviewText: { color: "#FFF", fontSize: 14, fontWeight: "800" },
});
