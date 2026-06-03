import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator, Dimensions } from "react-native";
import { Plus } from "lucide-react-native";
import { THEME } from "../constants/theme";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - THEME.spacing.lg * 3) / 2;

type Product = {
  id: number;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  category_id: number;
  category?: { name: string };
};

type ProductCardProps = {
  product: Product;
  index: number;
  isAddingToCart: boolean;
  onPress: (product: Product) => void;
  onAddToCart: (productId: number) => void;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  isAddingToCart,
  onPress,
  onAddToCart,
}) => {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isAsymmetric = index % 3 === 0;

  return (
    <TouchableOpacity
      style={[
        styles.productCard,
        { height: isAsymmetric ? 260 : 230 },
        isOutOfStock && styles.productCardDisabled,
      ]}
      onPress={() => onPress(product)}
      disabled={isOutOfStock}
      activeOpacity={0.9}
    >
      <View style={styles.productImageWrapper}>
        <Image
          source={{ uri: `https://picsum.photos/id/${(product.id * 7) % 100}/300/300` }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {/* Out of Stock Banner Overlay */}
        {isOutOfStock && (
          <View style={styles.outOfStockMask}>
            <Text style={styles.outOfStockLabel}>OUT OF STOCK</Text>
          </View>
        )}

        {/* Low Stock Warning Badge */}
        {isLowStock && (
          <View style={styles.lowStockBanner}>
            <Text style={styles.lowStockLabel}>Only {product.stock} left!</Text>
          </View>
        )}

        {/* Standard In Stock Badge */}
        {product.stock > 10 && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockLabel}>In Stock</Text>
          </View>
        )}
      </View>

      {/* Product Details Section */}
      <View style={styles.productDetails}>
        <Text style={styles.categoryName} numberOfLines={1}>
          {product.category?.name || "Premium Store"}
        </Text>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>${Number(product.price).toFixed(2)}</Text>
          
          {/* Add to Cart Inline CTA */}
          {!isOutOfStock && (
            <TouchableOpacity
              style={styles.inlineAddButton}
              onPress={() => onAddToCart(product.id)}
              disabled={isAddingToCart}
              activeOpacity={0.8}
            >
              {isAddingToCart ? (
                <ActivityIndicator size="small" color={THEME.colors.textLight} />
              ) : (
                <Plus size={16} color={THEME.colors.textLight} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: COLUMN_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: THEME.spacing.xs,
  },
  productCardDisabled: {
    opacity: 0.6,
  },
  productImageWrapper: {
    width: "100%",
    height: "60%",
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  outOfStockMask: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockLabel: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  lowStockBanner: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lowStockLabel: {
    color: "#D97706",
    fontSize: 10,
    fontWeight: "800",
  },
  inStockBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inStockLabel: {
    color: "#137333",
    fontSize: 10,
    fontWeight: "800",
  },
  productDetails: {
    padding: THEME.spacing.sm,
    justifyContent: "space-between",
    flex: 1,
  },
  categoryName: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  productName: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
    marginTop: 2,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.colors.primary,
  },
  inlineAddButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
  },
});
