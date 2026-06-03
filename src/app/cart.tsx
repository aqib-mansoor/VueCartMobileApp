import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Trash2, ShoppingBag, Plus, Minus, ArrowRight, Percent } from "lucide-react-native";
import { THEME } from "../constants/theme";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";
import { getProductImage } from "../components/ProductCard";

const { width } = Dimensions.get("window");

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
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [meta, setMeta] = useState<CartMeta>({ total_items: 0, grand_total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  
  // Wipe animation opacity
  const [wipeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.CART);
      if (res.ok) {
        const data = await res.json();
        const items = data.cart || data.data || [];
        setCartItems(items);
        setMeta({
          total_items: data.meta?.total_items || items.reduce((acc: number, item: CartItem) => acc + item.quantity, 0),
          grand_total: Number(data.meta?.grand_total || items.reduce((acc: number, item: CartItem) => acc + item.quantity * Number(item.price), 0)),
        });
      } else {
        console.error("Failed to fetch cart data:", res.status);
      }
    } catch (err) {
      console.error("Error fetching cart data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Optimistic quantity updates
  const updateQuantity = async (itemId: number, newQty: number, currentQty: number) => {
    if (newQty < 1) {
      handleRemoveItem(itemId);
      return;
    }

    // Prepare optimistic update state
    const originalItems = [...cartItems];
    const updatedItems = cartItems.map((item) => {
      if (item.cart_item_id === itemId) {
        return { ...item, quantity: newQty };
      }
      return item;
    });

    // Recompute total optimistically
    const diffQty = newQty - currentQty;
    const itemTarget = cartItems.find((item) => item.cart_item_id === itemId);
    const price = itemTarget ? Number(itemTarget.price) : 0;
    
    setCartItems(updatedItems);
    setMeta((prev) => ({
      total_items: prev.total_items + diffQty,
      grand_total: prev.grand_total + (diffQty * price),
    }));

    try {
      const res = await apiClient.put(`${API_ENDPOINTS.CART}/${itemId}`, { quantity: newQty });
      if (!res.ok) {
        // Rollback on failure
        setCartItems(originalItems);
        fetchCartData();
        Alert.alert("Error", "Could not update item quantity on the server.");
      }
    } catch (err) {
      // Rollback on failure
      setCartItems(originalItems);
      fetchCartData();
      Alert.alert("Error", "Network connection issues.");
    }
  };

  // Handle line item deletion
  const handleRemoveItem = (itemId: number) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const originalItems = [...cartItems];
            const targetItem = cartItems.find((item) => item.cart_item_id === itemId);
            const qty = targetItem ? targetItem.quantity : 0;
            const price = targetItem ? Number(targetItem.price) : 0;

            // Optimistic deletion
            setCartItems(cartItems.filter((item) => item.cart_item_id !== itemId));
            setMeta((prev) => ({
              total_items: Math.max(0, prev.total_items - qty),
              grand_total: Math.max(0, prev.grand_total - (qty * price)),
            }));

            try {
              const res = await apiClient.delete(`${API_ENDPOINTS.CART}/${itemId}`);
              if (!res.ok) {
                setCartItems(originalItems);
                fetchCartData();
                Alert.alert("Error", "Failed to delete item from cart.");
              }
            } catch (err) {
              setCartItems(originalItems);
              fetchCartData();
              Alert.alert("Error", "Network failure.");
            }
          },
        },
      ]
    );
  };

  // Clear entire cart with fade-out wipe animation
  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all products from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            setIsClearing(true);
            try {
              const res = await apiClient.delete(API_ENDPOINTS.CART_CLEAR);
              if (res.ok) {
                // Smooth fade-wipe animation
                Animated.timing(wipeAnim, {
                  toValue: 0,
                  duration: 400,
                  useNativeDriver: true,
                }).start(() => {
                  setCartItems([]);
                  setMeta({ total_items: 0, grand_total: 0 });
                  wipeAnim.setValue(1);
                  setIsClearing(false);
                });
              } else {
                Alert.alert("Error", "Could not clear cart.");
                setIsClearing(false);
              }
            } catch (err) {
              Alert.alert("Error", "Connection error.");
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const renderSkeletons = () => (
    <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonItemCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonInfo}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: "40%" }]} />
            <View style={[styles.skeletonLine, { width: "60%", height: 16 }]} />
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <ChevronLeft size={24} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        {cartItems.length > 0 ? (
          <TouchableOpacity onPress={handleClearCart} disabled={isClearing} activeOpacity={0.7}>
            {isClearing ? (
              <ActivityIndicator size="small" color={THEME.colors.secondary} />
            ) : (
              <Text style={styles.clearText}>Clear All</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {isLoading ? (
        renderSkeletons()
      ) : cartItems.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <ShoppingBag size={56} color={THEME.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty!</Text>
          <Text style={styles.emptySubtitle}>Let's add some items to make you happy.</Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => router.replace("/home" as any)}
            activeOpacity={0.9}
          >
            <Text style={styles.shopNowButtonText}>Shop Now</Text>
            <ArrowRight size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      ) : (
        /* Cart Items List */
        <View style={{ flex: 1 }}>
          <Animated.View style={{ flex: 1, opacity: wipeAnim }}>
            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
              
              {/* Promo Banner inside Cart */}
              <View style={styles.cartPromoCard}>
                <Percent size={18} color="#D97706" />
                <Text style={styles.cartPromoText}>
                  Add items worth $15 more to get free express shipping!
                </Text>
              </View>

              {cartItems.map((item) => {
                const imageUrl = getProductImage(item.name);
                const discountPercent = 15 + ((item.product_id * 5) % 25);
                const salePrice = Number(item.price);
                const originalPrice = salePrice / (1 - discountPercent / 100);

                return (
                  <View key={item.cart_item_id} style={styles.itemCard}>
                    <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="cover" />
                    
                    <View style={styles.itemDetails}>
                      <View style={styles.detailsHeader}>
                        <Text style={styles.productName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveItem(item.cart_item_id)}
                          style={styles.deleteButton}
                          activeOpacity={0.6}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.categoryName} numberOfLines={1}>
                        Premium Store
                      </Text>

                      {/* Pricing block */}
                      <View style={styles.pricingRow}>
                        <View style={styles.priceCol}>
                          <Text style={styles.salePrice}>${salePrice.toFixed(2)}</Text>
                          <Text style={styles.originalPrice}>${originalPrice.toFixed(2)}</Text>
                        </View>

                        {/* Quantity Inline Selector */}
                        <View style={styles.qtyContainer}>
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.cart_item_id, item.quantity - 1, item.quantity)}
                            style={styles.qtyBtn}
                            activeOpacity={0.7}
                          >
                            <Minus size={12} color={THEME.colors.textPrimary} />
                          </TouchableOpacity>
                          <Text style={styles.qtyText}>{item.quantity}</Text>
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.cart_item_id, item.quantity + 1, item.quantity)}
                            style={styles.qtyBtn}
                            activeOpacity={0.7}
                          >
                            <Plus size={12} color={THEME.colors.textPrimary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Sticky Price Summary Footer Panel */}
          <View style={styles.footerPanel}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Items ({meta.total_items})</Text>
              <Text style={styles.summaryValue}>${(meta.grand_total * 0.95).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Charges</Text>
              <Text style={[styles.summaryValue, { color: "#16A34A", fontWeight: "700" }]}>FREE</Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 8, borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 8 }]}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>${meta.grand_total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => router.push("/checkout" as any)}
              activeOpacity={0.9}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
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
    backgroundColor: "#F5F3FF", // Light purple theme background
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
  clearText: {
    color: THEME.colors.secondary, // Brand Orange
    fontWeight: "700",
    fontSize: 13,
  },
  listContent: {
    padding: THEME.spacing.md,
    gap: THEME.spacing.md,
    paddingBottom: 24,
  },
  cartPromoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7", // Amber promo container
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  cartPromoText: {
    fontSize: 11,
    color: "#D97706",
    fontWeight: "600",
    flex: 1,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: THEME.spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
    gap: THEME.spacing.md,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  categoryName: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: -4,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 6,
  },
  priceCol: {
    flexDirection: "column",
  },
  salePrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#EF4444",
  },
  originalPrice: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    textDecorationLine: "line-through",
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    padding: 6,
  },
  qtyText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
    paddingHorizontal: 8,
    textAlign: "center",
    minWidth: 20,
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
    color: THEME.colors.primary, // Brand core purple
  },
  checkoutButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  checkoutText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ECE9FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  shopNowButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  skeletonItemCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  skeletonImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
  },
  skeletonInfo: {
    flex: 1,
    gap: 8,
  },
  skeletonLine: {
    width: "80%",
    height: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
  },
});
