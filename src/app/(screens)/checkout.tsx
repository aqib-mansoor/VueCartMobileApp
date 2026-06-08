import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, Shield, Truck, CreditCard, ShoppingBag } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { getProductImage } from "../../components/home/ProductCard";
import { OrderSuccessOverlay } from "../../components/checkout/OrderSuccessOverlay";
import { CheckoutHeader } from "../../components/checkout/CheckoutHeader";
import { CheckoutSteps } from "../../components/checkout/CheckoutSteps";
import { CheckoutAddressSection } from "../../components/checkout/CheckoutAddressSection";
import { useCheckoutData } from "../../hooks/useCheckoutData";
import { checkoutStyles as s } from "../../styles/checkoutStyles";
import { ROUTES } from "../../constants/routes";

export default function CheckoutScreen() {
  const {
    router,
    addresses,
    selectedAddressId,
    showNewAddressForm,
    street,
    city,
    state,
    zip,
    country,
    isLoading,
    isPlacingOrder,
    isSavingAddress,
    orderSuccess,
    placedOrderId,
    cartItems,
    totalAmount,
    discount,
    finalTotal,
    deliveryDate,

    setSelectedAddressId,
    setShowNewAddressForm,
    setStreet,
    setCity,
    setState,
    setZip,
    setCountry,
    handleSaveAddress,
    handlePlaceOrder,
  } = useCheckoutData();

  if (orderSuccess) {
    return (
      <OrderSuccessOverlay
        placedOrderId={placedOrderId}
        cartItems={cartItems}
        finalTotal={finalTotal}
        deliveryDate={deliveryDate}
        onTrackOrder={() => router.replace(ROUTES.ORDERS as any)}
        onContinueShopping={() => router.replace(ROUTES.HOME as any)}
      />
    );
  }

  const renderSkeletons = () => (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Address Card Skeleton */}
      <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", gap: 10 }}>
        <View style={{ width: 120, height: 16, backgroundColor: "#E5E7EB", borderRadius: 4 }} />
        <View style={{ width: "90%", height: 12, backgroundColor: "#E5E7EB", borderRadius: 4 }} />
        <View style={{ width: "60%", height: 12, backgroundColor: "#E5E7EB", borderRadius: 4 }} />
      </View>
      {/* Order Items Skeleton */}
      <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", gap: 12 }}>
        <View style={{ width: 100, height: 16, backgroundColor: "#E5E7EB", borderRadius: 4 }} />
        {[1, 2].map((x) => (
          <View key={x} style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <View style={{ width: 40, height: 40, backgroundColor: "#E5E7EB", borderRadius: 8 }} />
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ width: "60%", height: 12, backgroundColor: "#E5E7EB", borderRadius: 4 }} />
              <View style={{ width: "30%", height: 10, backgroundColor: "#E5E7EB", borderRadius: 4 }} />
            </View>
          </View>
        ))}
      </View>
      {/* Payment Details Skeleton */}
      <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", gap: 10 }}>
        <View style={{ width: 140, height: 16, backgroundColor: "#E5E7EB", borderRadius: 4 }} />
        <View style={{ width: "80%", height: 12, backgroundColor: "#E5E7EB", borderRadius: 4 }} />
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Header */}
      <CheckoutHeader onBack={() => router.back()} />

      {/* Steps */}
      <CheckoutSteps />

      {isLoading ? (
        renderSkeletons()
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Delivery Address */}
            <CheckoutAddressSection
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
              showNewAddressForm={showNewAddressForm}
              setShowNewAddressForm={setShowNewAddressForm}
              street={street}
              setStreet={setStreet}
              city={city}
              setCity={setCity}
              state={state}
              setState={setState}
              zip={zip}
              setZip={setZip}
              country={country}
              setCountry={setCountry}
              isSavingAddress={isSavingAddress}
              onSaveAddress={handleSaveAddress}
            />

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
                    defaultSource={require("../../../assets/images/icon.png")}
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
