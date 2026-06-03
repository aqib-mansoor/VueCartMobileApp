import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { X, ShoppingCart, Sparkles } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { THEME } from "../constants/theme";
import { getProductImage } from "./ProductCard";

type Product = {
  id: number;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  category_id: number;
  category?: { name: string };
};

type ProductDetailModalProps = {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (productId: number) => void;
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const insets = useSafeAreaInsets();
  if (!product) return null;

  // Mirror the exact dynamic values from ProductCard
  const rating = (4.0 + ((product.id * 7) % 10) * 0.1).toFixed(1);
  const soldCount = 50 + ((product.id * 23) % 900);
  const discountPercent = 15 + ((product.id * 5) % 25);
  const salePrice = Number(product.price);
  const originalPrice = salePrice / (1 - discountPercent / 100);
  const hasFreeDelivery = product.id % 2 === 0;

  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalCategory}>{product.category?.name || "Premium Catalog"}</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton} activeOpacity={0.7}>
            <X size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Modal Body */}
        <ScrollView contentContainerStyle={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
          <Image
            source={{ uri: getProductImage(product.name, product.category?.name) }}
            style={styles.modalImage}
            resizeMode="cover"
          />

          {/* Pricing & Discount Badges Row (Temu/Daraz style) */}
          <View style={styles.modalPricingContainer}>
            <View style={styles.pricingLeft}>
              <Text style={styles.modalPrice}>${salePrice.toFixed(2)}</Text>
              <Text style={styles.modalOriginalPrice}>${originalPrice.toFixed(2)}</Text>
              <View style={styles.detailDiscountBadge}>
                <Text style={styles.detailDiscountText}>{discountPercent}% OFF</Text>
              </View>
            </View>

            {/* Stock Level Badge */}
            <View style={styles.modalStockWrapper}>
              {product.stock > 0 ? (
                <View style={[styles.modalBadge, { backgroundColor: "#E6F4EA" }]}>
                  <Text style={{ color: "#137333", fontSize: 10, fontWeight: "800" }}>In Stock</Text>
                </View>
              ) : (
                <View style={[styles.modalBadge, { backgroundColor: "#FEF2F2" }]}>
                  <Text style={{ color: "#EF4444", fontSize: 10, fontWeight: "800" }}>Sold Out</Text>
                </View>
              )}
            </View>
          </View>

          {/* Ratings & Sold Volume */}
          <View style={styles.modalRatingRow}>
            <View style={styles.starsGroup}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.ratingNumber}>{rating}</Text>
              <Text style={styles.reviewsCount}>({(product.id * 12) % 180 + 15} reviews)</Text>
            </View>
            <View style={styles.dividerDot} />
            <Text style={styles.detailSoldCount}>{soldCount}+ items sold</Text>
          </View>

          {/* Product Title */}
          <Text style={styles.modalTitle}>{product.name}</Text>

          {/* Delivery & Guarantees section (Flipkart style) */}
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryLine}>
              <Text style={styles.deliveryIcon}>🚚</Text>
              <View style={styles.deliveryDetailsCol}>
                <Text style={styles.deliveryTitle}>
                  {hasFreeDelivery ? "Free Delivery Guaranteed" : "Standard Delivery - $2.99"}
                </Text>
                <Text style={styles.deliverySubtitle}>Est. Delivery in 2 - 4 business days</Text>
              </View>
            </View>
            <View style={[styles.deliveryLine, { marginTop: 10 }]}>
              <Text style={styles.deliveryIcon}>🛡️</Text>
              <View style={styles.deliveryDetailsCol}>
                <Text style={styles.deliveryTitle}>15-Day Easy Returns & Refunds</Text>
                <Text style={styles.deliverySubtitle}>100% Genuine and authentic product quality</Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Product Specifications</Text>
            <Text style={styles.modalDescription}>{product.description || "High-quality item sourced from trusted distributors."}</Text>
          </View>

          {/* Promotional Loyalty Text (Tata Neu styling) */}
          <View style={styles.modalBenefitsCard}>
            <Sparkles size={16} color={THEME.colors.secondary} />
            <Text style={styles.modalBenefitsText}>Earn up to 5% NeuCoins on this purchase to spend on other orders!</Text>
          </View>
        </ScrollView>

        {/* Footer / Add to Cart CTA */}
        {product.stock > 0 && (
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalAddButton}
              onPress={() => {
                onAddToCart(product.id);
                onClose();
              }}
              activeOpacity={0.9}
            >
              <ShoppingCart size={18} color={THEME.colors.textLight} style={{ marginRight: 8 }} />
              <Text style={styles.modalAddButtonText}>Add to Shopping Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalCategory: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollBody: {
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  modalImage: {
    width: "100%",
    height: 240,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  modalPricingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: THEME.spacing.sm,
  },
  pricingLeft: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: "900",
    color: "#EF4444", // High-conversion promotional red
  },
  modalOriginalPrice: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textDecorationLine: "line-through",
  },
  detailDiscountBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  detailDiscountText: {
    color: "#EF4444",
    fontSize: 10,
    fontWeight: "800",
  },
  modalStockWrapper: {
    flexDirection: "row",
  },
  modalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  starsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  starIcon: {
    color: "#F59E0B",
    fontSize: 14,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  reviewsCount: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  dividerDot: {
    width: 3,
    height: 3,
    borderRadius: 99,
    backgroundColor: THEME.colors.textMuted,
  },
  detailSoldCount: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.colors.textPrimary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
    marginTop: 6,
  },
  deliveryCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    marginTop: THEME.spacing.sm,
  },
  deliveryLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  deliveryIcon: {
    fontSize: 16,
  },
  deliveryDetailsCol: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  deliverySubtitle: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  modalSection: {
    gap: 6,
    marginTop: THEME.spacing.sm,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  modalDescription: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  modalBenefitsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF5FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    borderRadius: 12,
    padding: THEME.spacing.md,
    gap: 8,
    marginTop: THEME.spacing.sm,
  },
  modalBenefitsText: {
    flex: 1,
    color: "#5B21B6",
    fontSize: 12,
    fontWeight: "600",
  },
  modalFooter: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  modalAddButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalAddButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
