import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text, ScrollView, Image, Animated, Easing, TouchableOpacity } from "react-native";
import { Check, ShoppingBag, Truck, Gift, CheckCircle } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { THEME } from "../../constants/theme";
import { IMAGES } from "../../constants/images";
import { getProductImage } from "../home/ProductCard";
import { formatOrderNumber } from "../../utils/orderUtils";

type CartItem = {
  cart_item_id: number;
  product_id: number;
  name: string;
  price: string | number;
  quantity: number;
  total_price: number;
};

type OrderSuccessOverlayProps = {
  placedOrderId: number | null;
  cartItems: CartItem[];
  finalTotal: number;
  deliveryDate: string;
  onTrackOrder: () => void;
  onContinueShopping: () => void;
};

export const OrderSuccessOverlay: React.FC<OrderSuccessOverlayProps> = ({
  placedOrderId,
  cartItems,
  finalTotal,
  deliveryDate,
  onTrackOrder,
  onContinueShopping,
}) => {
  // Local Success animations
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkRotate = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(checkScale, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }),
        Animated.timing(checkRotate, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(confettiAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.exp), useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const rotation = checkRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={s.successContainer}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.successScroll} showsVerticalScrollIndicator={false}>

        {/* Animated Check with Rings */}
        <View style={s.successRings}>
          <Animated.View style={[s.ringOuter, { opacity: confettiAnim }]} />
          <Animated.View style={[s.ringMiddle, { opacity: confettiAnim }]} />
          <Animated.View
            style={[
              s.successCheckCircle,
              { transform: [{ scale: checkScale }, { rotate: rotation }] },
            ]}
          >
            <Check size={48} color="#FFF" strokeWidth={3} />
          </Animated.View>
        </View>

        <Animated.View style={{ alignItems: "center", opacity: confettiAnim }}>
          <Text style={s.successEmoji}>🎉</Text>
          <Text style={s.successTitle}>Order Placed Successfully!</Text>
          <View style={s.orderIdPill}>
            <Text style={s.orderIdPillText}>{formatOrderNumber(placedOrderId)}</Text>
          </View>
          <Text style={s.successSub}>
            Thank you for your purchase! Your order is being processed and you'll receive an email confirmation shortly.
          </Text>
        </Animated.View>

        {/* Status Timeline */}
        <Animated.View style={[s.timelineCard, { transform: [{ translateY: cardSlide }], opacity: cardOpacity }]}>
          <Text style={s.timelineTitle}>Order Timeline</Text>
          {[
            { label: "Order Confirmed", sub: "Just now", done: true, icon: Check },
            { label: "Being Packed", sub: "Estimated in 2 hours", done: false, icon: ShoppingBag },
            { label: "Shipped", sub: "Estimated tomorrow", done: false, icon: Truck },
            { label: "Delivered", sub: deliveryDate, done: false, icon: Gift },
          ].map((step, idx) => (
            <View key={idx} style={s.timelineRow}>
              <View style={s.timelineLeft}>
                <View style={[s.timelineDot, step.done && s.timelineDotDone]}>
                  {step.done ? <Check size={10} color="#FFF" strokeWidth={3} /> : <View style={s.timelineDotInner} />}
                </View>
                {idx < 3 && <View style={[s.timelineLine, step.done && s.timelineLineDone]} />}
              </View>
              <View style={s.timelineContent}>
                <Text style={[s.timelineLabel, step.done && s.timelineLabelDone]}>{step.label}</Text>
                <Text style={s.timelineSub}>{step.sub}</Text>
              </View>
              <step.icon size={16} color={step.done ? "#16A34A" : "#CBD5E1"} />
            </View>
          ))}
        </Animated.View>

        {/* Items Ordered */}
        <Animated.View style={[s.successItemsCard, { transform: [{ translateY: cardSlide }], opacity: cardOpacity }]}>
          <Text style={s.successItemsTitle}>Items Ordered ({cartItems.length})</Text>
          {cartItems.map(item => (
            <View key={item.cart_item_id} style={s.successItemRow}>
              <Image
                source={{ uri: getProductImage(item.name) }}
                style={s.successItemImg}
                defaultSource={IMAGES.placeholder}
              />
              <View style={{ flex: 1 }}>
                <Text style={s.successItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={s.successItemMeta}>Qty: {item.quantity} · ${Number(item.price).toFixed(2)}</Text>
              </View>
              <Text style={s.successItemPrice}>${(Number(item.price) * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={s.successTotalRow}>
            <Text style={s.successTotalLabel}>Total Paid</Text>
            <Text style={s.successTotalVal}>${finalTotal.toFixed(2)}</Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[{ width: "100%" }, { transform: [{ translateY: cardSlide }], opacity: cardOpacity }]}>
          <TouchableOpacity style={s.successPrimaryBtn} onPress={onTrackOrder} activeOpacity={0.9}>
            <Truck size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={s.successPrimaryText}>Track Your Order</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.successSecondaryBtn} onPress={onContinueShopping} activeOpacity={0.7}>
            <ShoppingBag size={16} color={THEME.colors.primary} style={{ marginRight: 6 }} />
            <Text style={s.successSecondaryText}>Continue Shopping</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  successContainer: { flex: 1, backgroundColor: "#F1F5F9" },
  successScroll: { padding: 20, alignItems: "center", paddingTop: 36 },

  successRings: { alignItems: "center", justifyContent: "center", width: 140, height: 140, marginBottom: 16 },
  ringOuter: { position: "absolute", width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: "#BBF7D0" },
  ringMiddle: { position: "absolute", width: 115, height: 115, borderRadius: 57.5, borderWidth: 2, borderColor: "#86EFAC" },
  successCheckCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#16A34A", justifyContent: "center", alignItems: "center", shadowColor: "#16A34A", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 12 },

  successEmoji: { fontSize: 28, marginBottom: 4 },
  successTitle: { fontSize: 22, fontWeight: "900", color: THEME.colors.textPrimary, textAlign: "center" },
  orderIdPill: { backgroundColor: "#F3E8FF", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginTop: 8 },
  orderIdPillText: { fontSize: 12, fontWeight: "800", color: THEME.colors.primary },
  successSub: { fontSize: 13, color: THEME.colors.textSecondary, textAlign: "center", lineHeight: 20, marginTop: 10, marginBottom: 20, paddingHorizontal: 16 },

  // Timeline
  timelineCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, width: "100%", borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 12 },
  timelineTitle: { fontSize: 14, fontWeight: "900", color: THEME.colors.textPrimary, marginBottom: 14 },
  timelineRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 2 },
  timelineLeft: { alignItems: "center", marginRight: 12, width: 20 },
  timelineDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#CBD5E1", backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" },
  timelineDotDone: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
  timelineDotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#CBD5E1" },
  timelineLine: { width: 2, height: 28, backgroundColor: "#E2E8F0" },
  timelineLineDone: { backgroundColor: "#16A34A" },
  timelineContent: { flex: 1, paddingBottom: 14 },
  timelineLabel: { fontSize: 13, fontWeight: "800", color: THEME.colors.textPrimary },
  timelineLabelDone: { color: "#16A34A" },
  timelineSub: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 1 },

  // Success Items
  successItemsCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 14, width: "100%", borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 16 },
  successItemsTitle: { fontSize: 14, fontWeight: "900", color: THEME.colors.textPrimary, marginBottom: 10 },
  successItemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderColor: "#F1F5F9" },
  successItemImg: { width: 52, height: 52, borderRadius: 10, backgroundColor: "#F1F5F9" },
  successItemName: { fontSize: 13, fontWeight: "700", color: THEME.colors.textPrimary },
  successItemMeta: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 2 },
  successItemPrice: { fontSize: 13, fontWeight: "900", color: THEME.colors.textPrimary },
  successTotalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, marginTop: 4 },
  successTotalLabel: { fontSize: 14, fontWeight: "900", color: THEME.colors.textPrimary },
  successTotalVal: { fontSize: 16, fontWeight: "900", color: THEME.colors.primary },

  // Success Buttons
  successPrimaryBtn: { backgroundColor: THEME.colors.primary, borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "center", marginBottom: 10 },
  successPrimaryText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  successSecondaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, backgroundColor: "#FFF", borderRadius: 14, borderWidth: 1.5, borderColor: THEME.colors.primary, width: "100%" },
  successSecondaryText: { color: THEME.colors.primary, fontWeight: "800", fontSize: 14 },
});
