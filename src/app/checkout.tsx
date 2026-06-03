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
import { ChevronLeft, Plus, MapPin, Check, ShoppingBag, ArrowRight } from "lucide-react-native";
import { THEME } from "../constants/theme";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";

const { width } = Dimensions.get("window");

type Address = {
  id: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type CartItem = {
  cart_item_id: number;
  product_id: number;
  name: string;
  price: string | number;
  quantity: number;
  total_price: number;
};

export default function CheckoutScreen() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Form State for new address
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

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Cart
      const cartRes = await apiClient.get(API_ENDPOINTS.CART);
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        const items = cartData.cart || cartData.data || [];
        setCartItems(items);
        setTotalAmount(Number(cartData.meta?.grand_total || items.reduce((acc: number, item: CartItem) => acc + item.quantity * Number(item.price), 0)));
      }

      // 2. Fetch Saved Addresses
      const addressRes = await apiClient.get(API_ENDPOINTS.ADDRESSES);
      if (addressRes.ok) {
        const addressData = await addressRes.json();
        const list = addressData.addresses || addressData.data || [];
        setAddresses(list);
        if (list.length > 0) {
          setSelectedAddressId(list[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading checkout details:", err);
      Alert.alert("Error", "Failed to load checkout details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!street.trim() || !city.trim() || !state.trim() || !zip.trim() || !country.trim()) {
      Alert.alert("Validation", "Please fill in all fields.");
      return;
    }

    setIsSavingAddress(true);
    try {
      const res = await apiClient.post(API_ENDPOINTS.ADDRESSES, {
        street,
        city,
        state,
        zip,
        country,
      });

      if (res.ok) {
        const data = await res.json();
        const newAddr = data.address || data.data;
        if (newAddr) {
          setAddresses((prev) => [...prev, newAddr]);
          setSelectedAddressId(newAddr.id);
        }
        // Clear fields
        setStreet("");
        setCity("");
        setState("");
        setZip("");
        setCountry("USA");
        setShowNewAddressForm(false);
        Alert.alert("Success", "Address saved successfully.");
      } else {
        const errData = await res.json().catch(() => ({}));
        Alert.alert("Error", errData.message || "Failed to save address.");
      }
    } catch (err) {
      Alert.alert("Error", "Network connection failure.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert("Address Required", "Please select or add a shipping address.");
      return;
    }

    const activeAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!activeAddress) return;

    const fullAddress = `${activeAddress.street}, ${activeAddress.city}, ${activeAddress.state} ${activeAddress.zip}, ${activeAddress.country}`;

    setIsPlacingOrder(true);
    try {
      const res = await apiClient.post(API_ENDPOINTS.ORDERS, {
        shipping_address: fullAddress,
      });

      if (res.ok) {
        const data = await res.json();
        const orderId = data.order?.id || data.data?.id;
        setPlacedOrderId(orderId);
        setOrderSuccess(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        Alert.alert("Failed", errData.message || "Unable to place the order.");
      }
    } catch (err) {
      Alert.alert("Error", "Network or server connection issue.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.successCard}>
          <View style={styles.successIconOuter}>
            <View style={styles.successIconInner}>
              <Check size={48} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for your purchase. Your order {placedOrderId ? `#${placedOrderId}` : ""} has been placed successfully.
          </Text>
          <TouchableOpacity
            style={styles.ordersButton}
            onPress={() => router.replace("/orders" as any)}
            activeOpacity={0.9}
          >
            <Text style={styles.ordersButtonText}>View Order Details</Text>
            <ArrowRight size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeLinkButton}
            onPress={() => router.replace("/home" as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.homeLinkText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <ChevronLeft size={24} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Preparing your order...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Delivery Address Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Shipping Address</Text>
                {!showNewAddressForm && (
                  <TouchableOpacity
                    style={styles.addAddressBtn}
                    onPress={() => setShowNewAddressForm(true)}
                  >
                    <Plus size={16} color={THEME.colors.primary} />
                    <Text style={styles.addAddressText}>Add New</Text>
                  </TouchableOpacity>
                )}
              </View>

              {showNewAddressForm ? (
                <View style={styles.addressForm}>
                  <Text style={styles.formTitle}>New Delivery Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Street Address"
                    placeholderTextColor={THEME.colors.textMuted}
                    value={street}
                    onChangeText={setStreet}
                  />
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginRight: 8 }]}
                      placeholder="City"
                      placeholderTextColor={THEME.colors.textMuted}
                      value={city}
                      onChangeText={setCity}
                    />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="State"
                      placeholderTextColor={THEME.colors.textMuted}
                      value={state}
                      onChangeText={setState}
                    />
                  </View>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginRight: 8 }]}
                      placeholder="ZIP Code"
                      placeholderTextColor={THEME.colors.textMuted}
                      value={zip}
                      onChangeText={setZip}
                    />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Country"
                      placeholderTextColor={THEME.colors.textMuted}
                      value={country}
                      onChangeText={setCountry}
                    />
                  </View>
                  <View style={styles.formActions}>
                    <TouchableOpacity
                      style={styles.cancelFormBtn}
                      onPress={() => setShowNewAddressForm(false)}
                      disabled={isSavingAddress}
                    >
                      <Text style={styles.cancelFormText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveAddressBtn}
                      onPress={handleSaveAddress}
                      disabled={isSavingAddress}
                    >
                      {isSavingAddress ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.saveAddressText}>Save Address</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : addresses.length === 0 ? (
                <View style={styles.emptyAddressState}>
                  <MapPin size={32} color={THEME.colors.textMuted} style={{ marginBottom: 8 }} />
                  <Text style={styles.emptyAddressText}>No saved addresses found.</Text>
                  <TouchableOpacity
                    style={styles.addFirstAddressBtn}
                    onPress={() => setShowNewAddressForm(true)}
                  >
                    <Text style={styles.addFirstAddressBtnText}>Add Address</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.addressList}>
                  {addresses.map((address) => {
                    const isSelected = address.id === selectedAddressId;
                    return (
                      <TouchableOpacity
                        key={address.id}
                        style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                        onPress={() => setSelectedAddressId(address.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.addressSelectionCircle}>
                          {isSelected && <View style={styles.addressSelectionDot} />}
                        </View>
                        <View style={styles.addressDetails}>
                          <Text style={styles.addressStreet}>{address.street}</Text>
                          <Text style={styles.addressSub}>
                            {address.city}, {address.state} {address.zip}, {address.country}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Order Items Summary */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              <View style={styles.itemsList}>
                {cartItems.map((item) => (
                  <View key={item.cart_item_id} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Checkout Footer Panel */}
          <View style={styles.footerPanel}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Price</Text>
              <Text style={styles.summaryValue}>${totalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery charges</Text>
              <Text style={[styles.summaryValue, { color: "#10B981" }]}>FREE</Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 8, borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 8 }]}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>${totalAmount.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.placeOrderBtn,
                (!selectedAddressId || isPlacingOrder) && styles.placeOrderBtnDisabled,
              ]}
              onPress={handlePlaceOrder}
              disabled={!selectedAddressId || isPlacingOrder}
              activeOpacity={0.9}
            >
              {isPlacingOrder ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.placeOrderText}>Place Order Now</Text>
                  <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
  },
  scrollContent: {
    padding: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: THEME.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
  },
  addAddressBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addAddressText: {
    color: THEME.colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  addressList: {
    gap: THEME.spacing.sm,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: THEME.spacing.md,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  addressCardSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: "#F5F3FF",
  },
  addressSelectionCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: THEME.colors.textMuted,
    justifyContent: "center",
    alignItems: "center",
    marginRight: THEME.spacing.md,
  },
  addressSelectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.primary,
  },
  addressDetails: {
    flex: 1,
  },
  addressStreet: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  addressSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  addressForm: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: THEME.spacing.sm,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: THEME.colors.textPrimary,
  },
  inputRow: {
    flexDirection: "row",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: THEME.spacing.sm,
    marginTop: 8,
  },
  cancelFormBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelFormText: {
    color: THEME.colors.textSecondary,
    fontWeight: "600",
    fontSize: 13,
  },
  saveAddressBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  saveAddressText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyAddressState: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyAddressText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 12,
  },
  addFirstAddressBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addFirstAddressBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  itemsList: {
    gap: THEME.spacing.sm,
    marginTop: THEME.spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.textPrimary,
  },
  itemQty: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  footerPanel: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: THEME.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
    fontWeight: "600",
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: THEME.colors.primary,
  },
  placeOrderBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  placeOrderBtnDisabled: {
    backgroundColor: THEME.colors.textMuted,
  },
  placeOrderText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  successContainer: {
    flex: 1,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  successIconOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successIconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  ordersButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  ordersButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  homeLinkButton: {
    paddingVertical: 10,
  },
  homeLinkText: {
    color: THEME.colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
});
