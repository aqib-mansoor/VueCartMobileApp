import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
} from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, Percent, Truck, Shield, Tag } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { CartItemRow } from "../../components/cart/CartItemRow";
import { CartHeader } from "../../components/cart/CartHeader";
import { CartEmptyState } from "../../components/cart/CartEmptyState";
import { useCartData } from "../../hooks/useCartData";
import { cartStyles as s } from "../../styles/cartStyles";
import { ROUTES } from "../../constants/routes";

export default function CartScreen() {
  const {
    router,
    cartItems,
    meta,
    isLoading,
    isClearing,
    promoCode,
    wipeAnim,
    discount,
    finalTotal,
    setPromoCode,
    updateQuantity,
    handleRemoveItem,
    handleClearCart,
    showToast,
  } = useCartData();

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
      <CartHeader
        onBack={() => router.back()}
        totalItems={meta.total_items}
        cartLength={cartItems.length}
        onClear={handleClearCart}
        isClearing={isClearing}
      />

      {isLoading && cartItems.length === 0 ? (
        renderSkeletons()
      ) : cartItems.length === 0 ? (
        <CartEmptyState onStartShopping={() => router.replace(ROUTES.HOME as any)} />
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
                  onPress={() =>
                    showToast({
                      message: promoCode ? "Coupon applied!" : "Enter a coupon code",
                      type: promoCode ? "success" : "warning",
                    })
                  }
                >
                  <Text style={s.couponApplyText}>Apply</Text>
                </TouchableOpacity>
              </View>

              {/* Price Breakdown */}
              <View style={s.priceBreakdown}>
                <Text style={s.breakdownTitle}>
                  Price Details ({meta.total_items} Item{meta.total_items > 1 ? "s" : ""})
                </Text>
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
            <TouchableOpacity
              style={s.checkoutBtn}
              onPress={() => router.push(ROUTES.CHECKOUT as any)}
              activeOpacity={0.9}
            >
              <Text style={s.checkoutText}>Place Order</Text>
              <ArrowRight size={16} color="#FFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
