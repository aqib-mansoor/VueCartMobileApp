import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { MapPin, XCircle, ChevronUp, ChevronDown, RotateCcw, Star } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { getProductImage } from "../home/ProductCard";
import { formatOrderNumber } from "../../utils/orderUtils";

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

type OrderCardProps = {
  order: Order;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCancelOrder: (orderId: number) => void;
  onBuyAgain: () => void;
  onRateProduct: (productId: number, productName: string) => void;
  statusConfig: Record<string, { bg: string; text: string; border: string; label: string; Icon: any }>;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isExpanded,
  onToggleExpand,
  onCancelOrder,
  onBuyAgain,
  onRateProduct,
  statusConfig,
}) => {
  const stKey = order.status.toLowerCase();
  const st = statusConfig[stKey] || statusConfig.pending;
  const isCompleted = stKey === "completed";
  const isPending = stKey === "pending";
  const orderNum = formatOrderNumber(order.id, order.created_at);

  return (
    <View style={s.orderCard}>
      {/* Order Header Row */}
      <TouchableOpacity 
        style={[s.orderHeader, isExpanded && s.orderHeaderExpanded]} 
        onPress={onToggleExpand} 
        activeOpacity={0.8}
      >
        <View style={{ flex: 1 }}>
          <Text style={s.orderId}>{orderNum}</Text>
          <Text style={s.orderDate}>{formatDate(order.created_at)} · {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? "s" : ""}</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
          <st.Icon size={12} color={st.text} style={{ marginRight: 2 }} />
          <Text style={[s.statusText, { color: st.text }]}>{st.label}</Text>
        </View>
        {isExpanded ? <ChevronUp size={16} color={THEME.colors.textMuted} style={{ marginLeft: 6 }} /> : <ChevronDown size={16} color={THEME.colors.textMuted} style={{ marginLeft: 6 }} />}
      </TouchableOpacity>

      {/* Collapsed Preview */}
      {!isExpanded && order.items?.length > 0 && (
        <View style={s.collapsedPreview}>
          <View style={s.collapsedProductRow}>
            <Image
              source={{ uri: getProductImage(order.items[0].product?.name || "") }}
              style={s.collapsedProductImg}
              defaultSource={require("../../../assets/images/icon.png")}
            />
            <View style={s.collapsedProductInfo}>
              <Text style={s.collapsedProductName} numberOfLines={1}>
                {order.items[0].product?.name || "Premium Product"}
              </Text>
              <Text style={s.collapsedProductMeta}>
                Qty: {order.items[0].quantity} · ${Number(order.items[0].price).toFixed(2)} each
              </Text>
              {order.items.length > 1 && (
                <Text style={s.collapsedMoreText}>
                  + {order.items.length - 1} other item{(order.items.length - 1) > 1 ? "s" : ""}
                </Text>
              )}
            </View>
          </View>
          <View style={s.collapsedRightCol}>
            <Text style={s.collapsedTotalLabel}>Total</Text>
            <Text style={s.collapsedTotal}>${Number(order.total_amount).toFixed(2)}</Text>
          </View>
        </View>
      )}

      {/* Expanded: Full Details */}
      {isExpanded && (
        <View style={s.expandedContent}>
          {/* Shipping Address Box */}
          <View style={s.addrBox}>
            <View style={s.addrHeader}>
              <MapPin size={13} color={THEME.colors.primary} />
              <Text style={s.addrTitle}>Delivery Address</Text>
            </View>
            <Text style={s.addrText}>{order.shipping_address}</Text>
          </View>

          {/* Progress Timeline */}
          {stKey !== "cancelled" ? (
            <View style={s.timelineContainer}>
              <View style={s.timelineTrackRow}>
                {[0, 1, 2, 3].map((stepIdx) => {
                  const steps = [
                    { label: "Ordered", reached: true },
                    { label: "Packed", reached: stKey === "processing" || stKey === "shipped" || stKey === "delivered" || stKey === "completed" },
                    { label: "Shipped", reached: stKey === "shipped" || stKey === "delivered" || stKey === "completed" },
                    { label: "Delivered", reached: stKey === "delivered" || stKey === "completed" }
                  ];
                  const step = steps[stepIdx];
                  const activeColor = THEME.colors.primary;
                  const isLast = stepIdx === 3;
                  const nextStepReached = !isLast && steps[stepIdx + 1].reached;

                  return (
                    <View key={stepIdx} style={[s.trackSegmentWrapper, isLast && { flex: 0 }]}>
                      <View style={[
                        s.timelineDotCircle, 
                        { 
                          backgroundColor: step.reached ? activeColor : "#FFF", 
                          borderColor: step.reached ? activeColor : "#CBD5E1" 
                        }
                      ]}>
                        {step.reached && <View style={s.timelineDotInner} />}
                      </View>
                      {!isLast && (
                        <View style={[
                          s.timelineLineSegment, 
                          { backgroundColor: nextStepReached ? activeColor : "#E2E8F0" }
                        ]} />
                      )}
                    </View>
                  );
                })}
              </View>
              <View style={s.timelineLabelsRow}>
                {["Ordered", "Packed", "Shipped", "Delivered"].map((lbl, sIdx) => {
                  const steps = [
                    { reached: true },
                    { reached: stKey === "processing" || stKey === "shipped" || stKey === "delivered" || stKey === "completed" },
                    { reached: stKey === "shipped" || stKey === "delivered" || stKey === "completed" },
                    { reached: stKey === "delivered" || stKey === "completed" }
                  ];
                  const reached = steps[sIdx].reached;
                  return (
                    <Text key={sIdx} style={[s.timelineLabelText, reached && s.timelineLabelTextActive]}>
                      {lbl}
                    </Text>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={s.cancelledBanner}>
              <XCircle size={15} color={THEME.colors.error} />
              <Text style={s.cancelledBannerText}>This order has been cancelled.</Text>
            </View>
          )}

          {/* Items List */}
          <Text style={s.itemsSectionTitle}>Order Items</Text>
          {order.items?.map((item, idx) => {
            const itemName = item.product?.name || "Premium Product";
            const itemImgUrl = getProductImage(itemName);
            return (
              <View key={idx} style={s.itemRow}>
                <Image
                  source={{ uri: itemImgUrl }}
                  style={s.itemImg}
                  defaultSource={require("../../../assets/images/icon.png")}
                />
                <View style={s.itemInfo}>
                  <Text style={s.itemName} numberOfLines={2}>{itemName}</Text>
                  <Text style={s.itemMeta}>
                    Qty: {item.quantity} · ${Number(item.price).toFixed(2)} each
                  </Text>
                  <Text style={s.itemSubtotal}>
                    Subtotal: ${(item.quantity * Number(item.price)).toFixed(2)}
                  </Text>
                </View>
                {isCompleted && (
                  <TouchableOpacity
                    style={s.reviewBtn}
                    onPress={() => onRateProduct(item.product_id, itemName)}
                    activeOpacity={0.8}
                  >
                    <Star size={13} color={THEME.colors.primary} fill={THEME.colors.primary} />
                    <Text style={s.reviewBtnText}>Rate</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {/* Order Footer summary info & Actions */}
          <View style={s.orderFooter}>
            <View>
              <Text style={s.footerTotalLabel}>Grand Total</Text>
              <Text style={s.footerTotalVal}>${Number(order.total_amount).toFixed(2)}</Text>
            </View>
            <View style={s.footerActions}>
              {isPending && (
                <TouchableOpacity
                  style={s.cancelBtn}
                  onPress={() => onCancelOrder(order.id)}
                  activeOpacity={0.8}
                >
                  <XCircle size={13} color={THEME.colors.error} />
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              )}
              {isCompleted && (
                <TouchableOpacity
                  style={s.buyAgainBtn}
                  onPress={onBuyAgain}
                  activeOpacity={0.8}
                >
                  <RotateCcw size={13} color="#FFF" />
                  <Text style={s.buyAgainText}>Buy Again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
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
});
