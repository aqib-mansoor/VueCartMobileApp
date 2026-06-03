import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  TextInput,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Trash2, ShoppingBag, Plus, Minus, ArrowRight, Percent, Truck, Shield, Tag } from "lucide-react-native";
import { THEME } from "../constants/theme";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";
import { getProductImage } from "../components/home/ProductCard";
import { useToast } from "../components/Toast";
import { CartItemRow } from "../components/cart/CartItemRow";
import { useConfirm } from "../components/ConfirmDialog";

type CartItem = {
  cart_item_id: number;
  product_id: number;
  name: string;
  price: string | number;
  quantity: number;
  total_price: number;
};

type CartMeta = {
  total_items: number;
  grand_total: number;
};

export default function CartScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [meta, setMeta] = useState<CartMeta>({ total_items: 0, grand_total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [wipeAnim] = useState(new Animated.Value(1));

  useEffect(() => { fetchCartData(); }, []);

  const fetchCartData = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.CART);
      if (res.ok) {
        const data = await res.json();
        const records = data.records || data;
        const items = records.cart || records.data || data.cart || data.data || [];
        setCartItems(items);
        const meta = records.meta || data.meta;
        setMeta({
          total_items: meta?.total_items || items.reduce((a: number, i: CartItem) => a + i.quantity, 0),
          grand_total: Number(meta?.grand_total || items.reduce((a: number, i: CartItem) => a + i.quantity * Number(i.price), 0)),
        });
      }
    } catch (err) {
      showToast({ message: "Failed to load cart", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQty: number, currentQty: number) => {
    if (newQty < 1) { handleRemoveItem(itemId); return; }
    const orig = [...cartItems];
    const updated = cartItems.map(i => i.cart_item_id === itemId ? { ...i, quantity: newQty } : i);
    const diff = newQty - currentQty;
    const target = cartItems.find(i => i.cart_item_id === itemId);
    const price = target ? Number(target.price) : 0;
    setCartItems(updated);
    setMeta(p => ({ total_items: p.total_items + diff, grand_total: p.grand_total + diff * price }));
    try {
      const res = await apiClient.put(`${API_ENDPOINTS.CART}/${itemId}`, { quantity: newQty });
      if (!res.ok) { setCartItems(orig); fetchCartData(); showToast({ message: "Failed to update quantity", type: "error" }); }
    } catch { setCartItems(orig); fetchCartData(); }
  };

  const handleRemoveItem = async (itemId: number) => {
    const orig = [...cartItems];
    const t = cartItems.find(i => i.cart_item_id === itemId);
    setCartItems(cartItems.filter(i => i.cart_item_id !== itemId));
    setMeta(p => ({
      total_items: Math.max(0, p.total_items - (t?.quantity || 0)),
      grand_total: Math.max(0, p.grand_total - (t?.quantity || 0) * Number(t?.price || 0)),
    }));
    try {
      const res = await apiClient.delete(`${API_ENDPOINTS.CART}/${itemId}`);
      if (res.ok) {
        showToast({ message: "Item removed from cart", type: "success" });
      } else {
        setCartItems(orig); fetchCartData();
        showToast({ message: "Failed to remove item", type: "error" });
      }
    } catch { setCartItems(orig); fetchCartData(); }
  };

  const handleClearCart = () => {
    showConfirm({
      title: "Clear Cart",
      message: "Are you sure you want to remove all items from your cart?",
      confirmText: "Clear All",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        setIsClearing(true);
        try {
          const res = await apiClient.delete(API_ENDPOINTS.CART_CLEAR);
          if (res.ok) {
            Animated.timing(wipeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
              setCartItems([]); setMeta({ total_items: 0, grand_total: 0 }); wipeAnim.setValue(1); setIsClearing(false);
              showToast({ message: "Cart cleared successfully", type: "success" });
            });
          } else { setIsClearing(false); showToast({ message: "Failed to clear cart", type: "error" }); }
        } catch { setIsClearing(false); showToast({ message: "Network error", type: "error" }); }
      }
    });
  };

  const discount = meta.grand_total * 0.05;
  const finalTotal = meta.grand_total - discount;

  const renderSkeletons = () => (
    <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
      {[1, 2, 3].map(i => (
        <View key={i} style={s.skelCard}>
          <View style={s.skelImg} />
          <View style={s.skelInfo}>
            <View style={s.skelLine} />
            <View style={[s.skelLine, { width: "50%" }]} />
            <View style={[s.skelLine, { width: "30%", height: 18 }]} />
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={s.headerTitle}>Shopping Cart</Text>
          {meta.total_items > 0 && (
            <View style={s.headerBadge}><Text style={s.headerBadgeText}>{meta.total_items}</Text></View>
          )}
        </View>
        {cartItems.length > 0 ? (
          <TouchableOpacity onPress={handleClearCart} disabled={isClearing} activeOpacity={0.7}>
            {isClearing ? <ActivityIndicator size="small" color={THEME.colors.secondary} /> : <Text style={s.clearText}>Clear All</Text>}
          </TouchableOpacity>
        ) : <View style={{ width: 60 }} />}
      </View>

      {isLoading ? renderSkeletons() : cartItems.length === 0 ? (
        <View style={s.emptyState}>
          <View style={s.emptyIcon}><ShoppingBag size={52} color={THEME.colors.primary} /></View>
          <Text style={s.emptyTitle}>Your cart is empty</Text>
          <Text style={s.emptySub}>Looks like you haven't added anything to your cart yet</Text>
          <TouchableOpacity style={s.shopBtn} onPress={() => router.replace("/home" as any)} activeOpacity={0.9}>
            <Text style={s.shopBtnText}>Start Shopping</Text>
            <ArrowRight size={16} color="#FFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <Animated.View style={{ flex: 1, opacity: wipeAnim }}>
            <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>

              {/* Delivery Banner */}
              <View style={s.deliveryBanner}>
                <Truck size={16} color="#16A34A" />
                <Text style={s.deliveryBannerText}>Free delivery on orders above $25</Text>
              </View>

              {cartItems.map((item, idx) => (
                <CartItemRow
                  key={item.cart_item_id}
                  item={item}
                  index={idx}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              ))}

              {/* Coupon Code */}
              <View style={s.couponCard}>
                <Tag size={16} color={THEME.colors.primary} />
                <TextInput
                  style={s.couponInput}
                  placeholder="Enter coupon code"
                  placeholderTextColor={THEME.colors.textMuted}
                  value={promoCode}
                  onChangeText={setPromoCode}
                />
                <TouchableOpacity
                  style={s.couponApplyBtn}
                  onPress={() => showToast({ message: promoCode ? "Coupon applied!" : "Enter a coupon code", type: promoCode ? "success" : "warning" })}
                >
                  <Text style={s.couponApplyText}>Apply</Text>
                </TouchableOpacity>
              </View>

              {/* Price Breakdown */}
              <View style={s.priceBreakdown}>
                <Text style={s.breakdownTitle}>Price Details ({meta.total_items} Item{meta.total_items > 1 ? "s" : ""})</Text>
                <View style={s.breakdownLine}>
                  <Text style={s.breakdownLabel}>Total MRP</Text>
                  <Text style={s.breakdownVal}>${meta.grand_total.toFixed(2)}</Text>
                </View>
                <View style={s.breakdownLine}>
                  <Text style={s.breakdownLabel}>Discount on MRP</Text>
                  <Text style={[s.breakdownVal, { color: "#16A34A" }]}>-${discount.toFixed(2)}</Text>
                </View>
                <View style={s.breakdownLine}>
                  <Text style={s.breakdownLabel}>Delivery Fee</Text>
                  <Text style={[s.breakdownVal, { color: "#16A34A" }]}>FREE</Text>
                </View>
                <View style={s.breakdownLine}>
                  <Text style={s.breakdownLabel}>Platform Fee</Text>
                  <Text style={[s.breakdownVal, { color: "#16A34A" }]}>FREE</Text>
                </View>
                <View style={[s.breakdownLine, s.breakdownTotal]}>
                  <Text style={s.totalLabel}>Total Amount</Text>
                  <Text style={s.totalVal}>${finalTotal.toFixed(2)}</Text>
                </View>
              </View>

              {/* Trust Badges */}
              <View style={s.trustRow}>
                <View style={s.trustItem}>
                  <Shield size={16} color={THEME.colors.primary} />
                  <Text style={s.trustText}>100% Genuine</Text>
                </View>
                <View style={s.trustItem}>
                  <Truck size={16} color={THEME.colors.primary} />
                  <Text style={s.trustText}>Fast Delivery</Text>
                </View>
                <View style={s.trustItem}>
                  <Percent size={16} color={THEME.colors.primary} />
                  <Text style={s.trustText}>Best Price</Text>
                </View>
              </View>
            </ScrollView>
          </Animated.View>

          {/* Sticky Bottom CTA */}
          <View style={s.footerBar}>
            <View>
              <Text style={s.footerTotal}>${finalTotal.toFixed(2)}</Text>
              <Text style={s.footerSaved}>You save ${discount.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={s.checkoutBtn} onPress={() => router.push("/checkout" as any)} activeOpacity={0.9}>
              <Text style={s.checkoutText}>Place Order</Text>
              <ArrowRight size={16} color="#FFF" style={{ marginLeft: 6 }} />
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
  headerBadge: { backgroundColor: THEME.colors.primary, borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center", marginLeft: 6 },
  headerBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "800" },
  clearText: { color: THEME.colors.error, fontWeight: "700", fontSize: 13 },

  listContent: { padding: 12, gap: 10, paddingBottom: 16 },

  deliveryBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F0FDF4", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#BBF7D0" },
  deliveryBannerText: { fontSize: 12, color: "#16A34A", fontWeight: "700", flex: 1 },

  itemCard: { backgroundColor: "#FFF", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#E2E8F0" },
  itemRow: { flexDirection: "row", padding: 12, gap: 12 },
  productImg: { width: 100, height: 100, borderRadius: 12, backgroundColor: "#F1F5F9" },
  itemInfo: { flex: 1, justifyContent: "center" },
  itemName: { fontSize: 14, fontWeight: "700", color: THEME.colors.textPrimary, lineHeight: 20 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  salePrice: { fontSize: 16, fontWeight: "900", color: THEME.colors.textPrimary },
  origPrice: { fontSize: 12, color: THEME.colors.textMuted, textDecorationLine: "line-through" },
  discBadge: { backgroundColor: "#FEF2F2", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discText: { fontSize: 10, color: THEME.colors.error, fontWeight: "800" },
  deliveryRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  deliveryText: { fontSize: 11, color: "#16A34A", fontWeight: "600" },

  actionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderColor: "#F1F5F9", paddingHorizontal: 12, paddingVertical: 8 },
  removeBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },
  removeBtnText: { fontSize: 12, color: THEME.colors.textSecondary, fontWeight: "600" },
  qtyRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  qtyBtn: { padding: 8 },
  qtyNum: { fontSize: 14, fontWeight: "800", color: THEME.colors.textPrimary, paddingHorizontal: 12, minWidth: 20, textAlign: "center" },

  couponCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: "#E2E8F0", gap: 8 },
  couponInput: { flex: 1, fontSize: 13, color: THEME.colors.textPrimary, paddingVertical: 10 },
  couponApplyBtn: { backgroundColor: THEME.colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  couponApplyText: { color: "#FFF", fontSize: 12, fontWeight: "800" },

  priceBreakdown: { backgroundColor: "#FFF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#E2E8F0" },
  breakdownTitle: { fontSize: 14, fontWeight: "900", color: THEME.colors.textPrimary, marginBottom: 10 },
  breakdownLine: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  breakdownLabel: { fontSize: 13, color: THEME.colors.textSecondary },
  breakdownVal: { fontSize: 13, fontWeight: "700", color: THEME.colors.textPrimary },
  breakdownTotal: { borderTopWidth: 1.5, borderColor: "#E2E8F0", paddingTop: 10, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 15, fontWeight: "900", color: THEME.colors.textPrimary },
  totalVal: { fontSize: 16, fontWeight: "900", color: THEME.colors.primary },

  trustRow: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#FFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  trustItem: { alignItems: "center", gap: 4 },
  trustText: { fontSize: 10, color: THEME.colors.textSecondary, fontWeight: "700" },

  footerBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FFF", paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderColor: "#E2E8F0" },
  footerTotal: { fontSize: 18, fontWeight: "900", color: THEME.colors.textPrimary },
  footerSaved: { fontSize: 11, color: "#16A34A", fontWeight: "700" },
  checkoutBtn: { backgroundColor: THEME.colors.primary, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24, flexDirection: "row", alignItems: "center" },
  checkoutText: { color: "#FFF", fontSize: 15, fontWeight: "800" },

  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  emptyIcon: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#F3E8FF", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: "900", color: THEME.colors.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: 13, color: THEME.colors.textSecondary, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  shopBtn: { backgroundColor: THEME.colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, flexDirection: "row", alignItems: "center" },
  shopBtnText: { color: "#FFF", fontWeight: "800", fontSize: 15 },

  skelCard: { flexDirection: "row", backgroundColor: "#FFF", borderRadius: 16, padding: 12, gap: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  skelImg: { width: 80, height: 80, borderRadius: 12, backgroundColor: "#E2E8F0" },
  skelInfo: { flex: 1, gap: 8 },
  skelLine: { width: "80%", height: 12, backgroundColor: "#E2E8F0", borderRadius: 6 },
});
