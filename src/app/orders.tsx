import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Calendar, ShieldAlert, Star, X } from "lucide-react-native";
import { THEME } from "../constants/theme";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";

type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  price: string | number;
  product: {
    id: number;
    name: string;
    price: string | number;
  };
};

type Order = {
  id: number;
  total_amount: string | number;
  shipping_address: string;
  status: "pending" | "completed" | "cancelled";
  payment_status: string;
  created_at: string;
  items?: OrderItem[];
};

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState<number | null>(null);
  const [reviewProductName, setReviewProductName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.ORDERS);
      if (res.ok) {
        const data = await res.json();
        // The API returns orders directly or wrapped in orders key
        const list = data.orders || data.data || [];
        
        // Fetch detailed items for each order if they aren't loaded
        const detailedOrders = await Promise.all(
          list.map(async (ord: Order) => {
            try {
              const detailRes = await apiClient.get(`${API_ENDPOINTS.ORDERS}/${ord.id}`);
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                return detailData.order || detailData.data || ord;
              }
            } catch (e) {
              console.error(`Error fetching order detail for ${ord.id}`, e);
            }
            return ord;
          })
        );

        setOrders(detailedOrders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await apiClient.put(`${API_ENDPOINTS.ORDERS}/${orderId}/cancel`, {});
              if (res.ok) {
                Alert.alert("Success", "Order cancelled successfully.");
                fetchOrders();
              } else {
                const data = await res.json().catch(() => ({}));
                Alert.alert("Failed", data.message || "Failed to cancel order.");
              }
            } catch (err) {
              Alert.alert("Error", "Network error.");
            }
          },
        },
      ]
    );
  };

  const openReviewModal = (productId: number, productName: string) => {
    setReviewProductId(productId);
    setReviewProductName(productName);
    setRating(5);
    setComment("");
    setShowReviewModal(true);
  };

  const submitProductReview = async () => {
    if (!reviewProductId) return;

    setIsSubmittingReview(true);
    try {
      const res = await apiClient.post(`${API_ENDPOINTS.PRODUCTS}/${reviewProductId}/reviews`, {
        rating,
        comment,
      });

      if (res.ok) {
        Alert.alert("Success", "Review added successfully!");
        setShowReviewModal(false);
      } else {
        const data = await res.json().catch(() => ({}));
        Alert.alert("Review Error", data.message || "You have already left a review or something went wrong.");
      }
    } catch (err) {
      Alert.alert("Error", "Network connection issues.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      default:
        return "#D97706";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <ChevronLeft size={24} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No orders found</Text>
          <Text style={styles.emptySubtitle}>You haven't placed any orders yet.</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace("/home" as any)}>
            <Text style={styles.shopBtnText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {orders.map((order) => {
            const dateStr = new Date(order.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderIdText}>Order #{order.id}</Text>
                    <View style={styles.dateRow}>
                      <Calendar size={12} color={THEME.colors.textSecondary} />
                      <Text style={styles.dateText}>{dateStr}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(order.status)}15` },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Items */}
                <View style={styles.itemsContainer}>
                  {order.items?.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={styles.itemDetail}>
                        <Text style={styles.itemNameText} numberOfLines={1}>
                          {item.product?.name || "Product"}
                        </Text>
                        <Text style={styles.itemMetaText}>
                          Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                        </Text>
                      </View>
                      
                      {order.status === "completed" && (
                        <TouchableOpacity
                          style={styles.reviewBtn}
                          onPress={() => openReviewModal(item.product_id, item.product?.name || "Product")}
                        >
                          <Star size={12} color={THEME.colors.primary} fill={THEME.colors.primary} />
                          <Text style={styles.reviewBtnText}>Write Review</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>

                {/* Footer of Card */}
                <View style={styles.orderFooter}>
                  <Text style={styles.totalLabel}>Total: <Text style={styles.totalValue}>${Number(order.total_amount).toFixed(2)}</Text></Text>
                  
                  {order.status === "pending" && (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => handleCancelOrder(order.id)}
                    >
                      <Text style={styles.cancelBtnText}>Cancel Order</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate Product</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <X size={20} color={THEME.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalProductName}>{reviewProductName}</Text>

            {/* Stars Selector */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Star
                    size={36}
                    color={star <= rating ? "#F59E0B" : THEME.colors.textMuted}
                    fill={star <= rating ? "#F59E0B" : "transparent"}
                    style={{ marginHorizontal: 6 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Tell us about your experience..."
              placeholderTextColor={THEME.colors.textMuted}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />

            <TouchableOpacity
              style={styles.submitReviewBtn}
              onPress={submitProductReview}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitReviewText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginBottom: 20,
  },
  shopBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  shopBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  scrollContent: {
    padding: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: THEME.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
    paddingBottom: 10,
  },
  orderIdText: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  itemsContainer: {
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  itemDetail: {
    flex: 1,
    marginRight: 12,
  },
  itemNameText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  itemMetaText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  reviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  reviewBtnText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontWeight: "700",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
  },
  cancelBtn: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelBtnText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: THEME.spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
  },
  modalProductName: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
  },
  commentInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    textAlignVertical: "top",
  },
  submitReviewBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  submitReviewText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
