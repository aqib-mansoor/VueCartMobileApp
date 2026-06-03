import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { X, ShoppingCart, Sparkles } from "lucide-react-native";
import { THEME } from "../constants/theme";

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
  if (!product) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
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
            source={{ uri: `https://picsum.photos/id/${(product.id * 7) % 100}/400/400` }}
            style={styles.modalImage}
            resizeMode="cover"
          />

          <View style={styles.modalMainInfo}>
            <Text style={styles.modalTitle}>{product.name}</Text>
            <Text style={styles.modalPrice}>${Number(product.price).toFixed(2)}</Text>
          </View>

          {/* Stock Info Banner */}
          <View style={styles.modalStockRow}>
            {product.stock > 10 ? (
              <View style={[styles.modalBadge, { backgroundColor: "#E6F4EA" }]}>
                <Text style={{ color: "#137333", fontSize: 12, fontWeight: "700" }}>In Stock (Unlimited)</Text>
              </View>
            ) : product.stock > 0 ? (
              <View style={[styles.modalBadge, { backgroundColor: "#FEF3C7" }]}>
                <Text style={{ color: "#D97706", fontSize: 12, fontWeight: "700" }}>Limited Stock: Only {product.stock} left!</Text>
              </View>
            ) : (
              <View style={[styles.modalBadge, { backgroundColor: "#FEF2F2" }]}>
                <Text style={{ color: "#EF4444", fontSize: 12, fontWeight: "700" }}>Out of Stock</Text>
              </View>
            )}
          </View>

          {/* Description Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Product Description</Text>
            <Text style={styles.modalDescription}>{product.description || "No description provided."}</Text>
          </View>

          {/* Promotional Loyalty Text (Tata Neu styling) */}
          <View style={styles.modalBenefitsCard}>
            <Sparkles size={16} color={THEME.colors.secondary} />
            <Text style={styles.modalBenefitsText}>Buy now and get 5% cashback coins directly to your wallet!</Text>
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
  modalMainInfo: {
    gap: 4,
    marginTop: THEME.spacing.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
  },
  modalPrice: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.colors.primary,
  },
  modalStockRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  modalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalSection: {
    gap: 6,
    marginTop: THEME.spacing.xs,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  modalDescription: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
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
    paddingTop: THEME.spacing.sm,
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
