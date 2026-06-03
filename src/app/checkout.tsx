import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Animated,
  Easing,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft, Plus, MapPin, Check, ArrowRight, Shield,
  Truck, CreditCard, Gift, PartyPopper, ShoppingBag, Clock, Star,
} from "lucide-react-native";
import { THEME } from "../constants/theme";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";
import { getProductImage } from "../components/ProductCard";
import { useToast } from "../components/Toast";
import { formatOrderNumber } from "../utils/orderUtils";

type Address = { id: number; street: string; city: string; state: string; zip: string; country: string; };
type CartItem = { cart_item_id: number; product_id: number; name: string; price: string | number; quantity: number; total_price: number; };

export default function CheckoutScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("USA");
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);

  // Success animations
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkRotate = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => { fetchCheckoutData(); }, []);

  useEffect(() => {
    if (orderSuccess) {
      // Sequence success animations
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
    }
  }, [orderSuccess]);

  const fetchCheckoutData = async () => {
    setIsLoading(true);
    try {
      const cartRes = await apiClient.get(API_ENDPOINTS.CART);
      if (cartRes.ok) {
        const d = await cartRes.json();
        const items = d.cart || d.data || [];
        setCartItems(items);
        setTotalAmount(Number(d.meta?.grand_total || items.reduce((a: number, i: CartItem) => a + i.quantity * Number(i.price), 0)));
      }
      const addrRes = await apiClient.get(API_ENDPOINTS.ADDRESSES);
      if (addrRes.ok) {
        const d = await addrRes.json();
        const list = d.addresses || d.data || [];
        setAddresses(list);
        if (list.length > 0) setSelectedAddressId(list[0].id);
      }
    } catch (err) {
      showToast({ message: "Failed to load checkout data", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!street.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      showToast({ message: "Please fill in all address fields", type: "warning" });
      return;
    }
    setIsSavingAddress(true);
    try {
      const res = await apiClient.post(API_ENDPOINTS.ADDRESSES, { street, city, state, zip, country });
      if (res.ok) {
        const d = await res.json();
        const n = d.address || d.data;
        if (n) { setAddresses(p => [...p, n]); setSelectedAddressId(n.id); }
        setStreet(""); setCity(""); setState(""); setZip(""); setCountry("USA");
        setShowNewAddressForm(false);
        showToast({ message: "Address saved successfully!", type: "success" });
      }
    } catch {
      showToast({ message: "Failed to save address", type: "error" });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast({ message: "Please select a delivery address", type: "warning" });
      return;
    }
    const a = addresses.find(x => x.id === selectedAddressId);
    if (!a) return;
    setIsPlacingOrder(true);
    try {
      const res = await apiClient.post(API_ENDPOINTS.ORDERS, {
        shipping_address: `${a.street}, ${a.city}, ${a.state} ${a.zip}, ${a.country}`,
      });
      if (res.ok) {
        const d = await res.json();
        setPlacedOrderId(d.order?.id || d.data?.id);
        setOrderSuccess(true);
      } else {
        const e = await res.json().catch(() => ({}));
        showToast({ message: e.message || "Failed to place order", type: "error" });
      }
    } catch {
      showToast({ message: "Network error — please try again", type: "error" });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const discount = totalAmount * 0.05;
  const finalTotal = totalAmount - discount;
  const deliveryDate = new Date(Date.now() + 4 * 86400000).toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric",
  });

  // ─── SUCCESS SCREEN ─────────────────────────────────────────
  if (orderSuccess) {
    const rotation = checkRotate.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    return (
      <SafeAreaView style={s.successContainer}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
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
                  defaultSource={require("../../assets/images/icon.png")}
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
            <TouchableOpacity style={s.successPrimaryBtn} onPress={() => router.replace("/orders" as any)} activeOpacity={0.9}>
              <Truck size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={s.successPrimaryText}>Track Your Order</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.successSecondaryBtn} onPress={() => router.replace("/home" as any)} activeOpacity={0.7}>
              <ShoppingBag size={16} color={THEME.colors.primary} style={{ marginRight: 6 }} />
              <Text style={s.successSecondaryText}>Continue Shopping</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── CHECKOUT SCREEN ─────────────────────────────────────────
  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Checkout</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Steps */}
      <View style={s.stepsBar}>
        {[{ num: "1", label: "Cart", done: true }, { num: "2", label: "Address", active: true }, { num: "3", label: "Payment" }].map((step, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <View style={[s.stepConn, step.done && s.stepConnDone, (step as any).active && s.stepConnDone]} />}
            <View style={s.stepCol}>
              <View style={[s.stepCircle, step.done && s.stepDone, (step as any).active && s.stepActive]}>
                {step.done ? <Check size={14} color="#FFF" strokeWidth={3} /> : <Text style={[s.stepNum, (step as any).active && s.stepNumActive]}>{step.num}</Text>}
              </View>
              <Text style={[s.stepLabel, step.done && s.stepLabelDone, (step as any).active && s.stepLabelActive]}>{step.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      {isLoading ? (
        <View style={s.loadingCont}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={s.loadingText}>Loading checkout...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

            {/* Delivery Address */}
            <View style={s.card}>
              <View style={s.cardHeader}>
                <View style={s.cardTitleRow}>
                  <MapPin size={16} color={THEME.colors.primary} />
                  <Text style={s.cardTitle}>Delivery Address</Text>
                </View>
                {!showNewAddressForm && (
                  <TouchableOpacity style={s.addBtn} onPress={() => setShowNewAddressForm(true)}>
                    <Plus size={14} color={THEME.colors.primary} />
                    <Text style={s.addBtnText}>Add New</Text>
                  </TouchableOpacity>
                )}
              </View>

              {showNewAddressForm ? (
                <View style={s.formBox}>
                  <TextInput style={s.input} placeholder="Street Address" placeholderTextColor={THEME.colors.textMuted} value={street} onChangeText={setStreet} />
                  <View style={s.inputRow}>
                    <TextInput style={[s.input, { flex: 1, marginRight: 8 }]} placeholder="City" placeholderTextColor={THEME.colors.textMuted} value={city} onChangeText={setCity} />
                    <TextInput style={[s.input, { flex: 1 }]} placeholder="State" placeholderTextColor={THEME.colors.textMuted} value={state} onChangeText={setState} />
                  </View>
                  <View style={s.inputRow}>
                    <TextInput style={[s.input, { flex: 1, marginRight: 8 }]} placeholder="ZIP Code" placeholderTextColor={THEME.colors.textMuted} value={zip} onChangeText={setZip} />
                    <TextInput style={[s.input, { flex: 1 }]} placeholder="Country" placeholderTextColor={THEME.colors.textMuted} value={country} onChangeText={setCountry} />
                  </View>
                  <View style={s.formBtns}>
                    <TouchableOpacity onPress={() => setShowNewAddressForm(false)}>
                      <Text style={s.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.saveBtn} onPress={handleSaveAddress} disabled={isSavingAddress}>
                      {isSavingAddress ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={s.saveBtnText}>Save Address</Text>}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : addresses.length === 0 ? (
                <View style={s.emptyAddr}>
                  <MapPin size={28} color={THEME.colors.textMuted} />
                  <Text style={s.emptyAddrText}>No saved addresses yet</Text>
                  <Text style={s.emptyAddrHint}>Tap "Add New" to create one</Text>
                </View>
              ) : (
                addresses.map(addr => {
                  const sel = addr.id === selectedAddressId;
                  return (
                    <TouchableOpacity key={addr.id} style={[s.addrCard, sel && s.addrCardSel]} onPress={() => setSelectedAddressId(addr.id)} activeOpacity={0.8}>
                      <View style={[s.radio, sel && s.radioSel]}>
                        {sel && <View style={s.radioDot} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.addrStreet}>{addr.street}</Text>
                        <Text style={s.addrSub}>{addr.city}, {addr.state} {addr.zip}, {addr.country}</Text>
                      </View>
                      {sel && (
                        <View style={s.deliverBadge}>
                          <Check size={10} color="#FFF" />
                          <Text style={s.deliverBadgeText}>Selected</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {/* Order Items with Big Images */}
            <View style={s.card}>
              <View style={s.cardTitleRow}>
                <ShoppingBag size={16} color={THEME.colors.primary} />
                <Text style={s.cardTitle}>Order Summary ({cartItems.length} items)</Text>
              </View>
              {cartItems.map((item, idx) => (
                <View key={item.cart_item_id} style={[s.orderItemRow, idx === cartItems.length - 1 && { borderBottomWidth: 0 }]}>
                  <Image
                    source={{ uri: getProductImage(item.name) }}
                    style={s.orderItemImg}
                    defaultSource={require("../../assets/images/icon.png")}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={s.orderItemName} numberOfLines={2}>{item.name}</Text>
                    <View style={s.orderItemMetaRow}>
                      <Text style={s.orderItemQty}>Qty: {item.quantity}</Text>
                      <View style={s.deliveryChip}>
                        <Truck size={10} color="#16A34A" />
                        <Text style={s.deliveryChipText}>Free</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={s.orderItemPrice}>${(Number(item.price) * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
            </View>

            {/* Payment Method */}
            <View style={s.card}>
              <View style={s.cardTitleRow}>
                <CreditCard size={16} color={THEME.colors.primary} />
                <Text style={s.cardTitle}>Payment Method</Text>
              </View>
              <TouchableOpacity style={s.paymentCard} activeOpacity={0.8}>
                <View style={[s.radio, s.radioSel]}><View style={s.radioDot} /></View>
                <View style={s.paymentIcon}><CreditCard size={20} color={THEME.colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.paymentName}>Cash on Delivery</Text>
                  <Text style={s.paymentDesc}>Pay when you receive your order</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Price Breakdown */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Price Details</Text>
              <View style={s.priceLine}><Text style={s.priceLabel}>Subtotal</Text><Text style={s.priceVal}>${totalAmount.toFixed(2)}</Text></View>
              <View style={s.priceLine}><Text style={s.priceLabel}>Discount (5%)</Text><Text style={[s.priceVal, { color: "#16A34A" }]}>-${discount.toFixed(2)}</Text></View>
              <View style={s.priceLine}><Text style={s.priceLabel}>Delivery</Text><Text style={[s.priceVal, { color: "#16A34A" }]}>FREE</Text></View>
              <View style={[s.priceLine, s.priceTotalLine]}>
                <Text style={s.priceTotalLabel}>Total</Text>
                <Text style={s.priceTotalVal}>${finalTotal.toFixed(2)}</Text>
              </View>
            </View>

            {/* Trust Bar */}
            <View style={s.trustRow}>
              <Shield size={14} color="#16A34A" />
              <Text style={s.trustText}>Safe & Secure Payments · Easy Returns · 100% Authentic</Text>
            </View>
          </ScrollView>

          {/* Sticky Bottom */}
          <View style={s.footerBar}>
            <View>
              <Text style={s.footerTotal}>${finalTotal.toFixed(2)}</Text>
              <Text style={s.footerSaved}>You save ${discount.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[s.placeBtn, (!selectedAddressId || isPlacingOrder) && s.placeBtnOff]}
              onPress={handlePlaceOrder}
              disabled={!selectedAddressId || isPlacingOrder}
              activeOpacity={0.9}
            >
              {isPlacingOrder ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Text style={s.placeBtnText}>Place Order</Text>
                  <ArrowRight size={16} color="#FFF" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFF", borderBottomWidth: 1, borderColor: "#E2E8F0" },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "900", color: THEME.colors.textPrimary },

  // Steps
  stepsBar: { flexDirection: "row", alignItems: "flex-start", justifyContent: "center", backgroundColor: "#FFF", paddingVertical: 14, paddingHorizontal: 32, borderBottomWidth: 1, borderColor: "#E2E8F0" },
  stepCol: { alignItems: "center" },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#E2E8F0", justifyContent: "center", alignItems: "center" },
  stepDone: { backgroundColor: "#16A34A" },
  stepActive: { backgroundColor: THEME.colors.primary },
  stepNum: { fontSize: 12, fontWeight: "800", color: THEME.colors.textSecondary },
  stepNumActive: { color: "#FFF" },
  stepLabel: { fontSize: 10, fontWeight: "700", color: THEME.colors.textMuted, marginTop: 4 },
  stepLabelDone: { color: "#16A34A" },
  stepLabelActive: { color: THEME.colors.primary },
  stepConn: { flex: 1, height: 2, backgroundColor: "#E2E8F0", marginTop: 13, marginHorizontal: 4 },
  stepConnDone: { backgroundColor: "#16A34A" },

  loadingCont: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, color: THEME.colors.textSecondary, fontWeight: "600" },
  scrollContent: { padding: 12, gap: 10, paddingBottom: 16 },

  // Cards
  card: { backgroundColor: "#FFF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#E2E8F0" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: "900", color: THEME.colors.textPrimary },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addBtnText: { color: THEME.colors.primary, fontWeight: "800", fontSize: 13 },

  // Address Form
  formBox: { backgroundColor: "#F8FAFC", borderRadius: 12, padding: 12, gap: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  input: { backgroundColor: "#FFF", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: THEME.colors.textPrimary },
  inputRow: { flexDirection: "row" },
  formBtns: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 4 },
  cancelText: { color: THEME.colors.textSecondary, fontWeight: "700", fontSize: 13, paddingVertical: 8 },
  saveBtn: { backgroundColor: THEME.colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  saveBtnText: { color: "#FFF", fontWeight: "800", fontSize: 13 },
  emptyAddr: { alignItems: "center", paddingVertical: 20, gap: 4 },
  emptyAddrText: { fontSize: 13, fontWeight: "700", color: THEME.colors.textSecondary },
  emptyAddrHint: { fontSize: 11, color: THEME.colors.textMuted },

  // Address Cards
  addrCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: "#E2E8F0", marginBottom: 8, gap: 10 },
  addrCardSel: { borderColor: THEME.colors.primary, backgroundColor: "#FAF5FF" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#CBD5E1", justifyContent: "center", alignItems: "center" },
  radioSel: { borderColor: THEME.colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: THEME.colors.primary },
  addrStreet: { fontSize: 13, fontWeight: "800", color: THEME.colors.textPrimary },
  addrSub: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 2 },
  deliverBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: THEME.colors.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  deliverBadgeText: { color: "#FFF", fontSize: 9, fontWeight: "800" },

  // Order Items
  orderItemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: "#F1F5F9" },
  orderItemImg: { width: 64, height: 64, borderRadius: 10, backgroundColor: "#F1F5F9" },
  orderItemName: { fontSize: 13, fontWeight: "700", color: THEME.colors.textPrimary, lineHeight: 18 },
  orderItemMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  orderItemQty: { fontSize: 11, color: THEME.colors.textSecondary, fontWeight: "600" },
  deliveryChip: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#F0FDF4", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  deliveryChipText: { fontSize: 9, color: "#16A34A", fontWeight: "800" },
  orderItemPrice: { fontSize: 14, fontWeight: "900", color: THEME.colors.textPrimary },

  // Payment
  paymentCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FAF5FF", borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: THEME.colors.primary },
  paymentIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#F3E8FF", justifyContent: "center", alignItems: "center" },
  paymentName: { fontSize: 13, fontWeight: "800", color: THEME.colors.textPrimary },
  paymentDesc: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 1 },

  // Price Breakdown
  priceLine: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  priceLabel: { fontSize: 13, color: THEME.colors.textSecondary },
  priceVal: { fontSize: 13, fontWeight: "700", color: THEME.colors.textPrimary },
  priceTotalLine: { borderTopWidth: 1.5, borderColor: "#E2E8F0", paddingTop: 10, marginTop: 4, marginBottom: 0 },
  priceTotalLabel: { fontSize: 15, fontWeight: "900", color: THEME.colors.textPrimary },
  priceTotalVal: { fontSize: 16, fontWeight: "900", color: THEME.colors.primary },

  // Trust
  trustRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F0FDF4", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#BBF7D0" },
  trustText: { fontSize: 11, color: "#16A34A", fontWeight: "600", flex: 1 },

  // Footer
  footerBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FFF", paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderColor: "#E2E8F0" },
  footerTotal: { fontSize: 18, fontWeight: "900", color: THEME.colors.textPrimary },
  footerSaved: { fontSize: 11, color: "#16A34A", fontWeight: "700", marginTop: 1 },
  placeBtn: { backgroundColor: THEME.colors.primary, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 22, flexDirection: "row", alignItems: "center" },
  placeBtnOff: { backgroundColor: "#CBD5E1" },
  placeBtnText: { color: "#FFF", fontSize: 15, fontWeight: "800" },

  // ─── SUCCESS ───
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
