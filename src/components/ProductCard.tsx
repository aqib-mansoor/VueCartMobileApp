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

// Dynamic helper to match product names/categories to high-quality accurate images
export const getProductImage = (name: string, categoryName = "") => {
  const cleanName = name.toLowerCase().trim();
  const cleanCategory = categoryName.toLowerCase().trim();
  
  // 1. Direct matches for known product names from Laravel database
  if (cleanName.includes("protein supplement")) {
    return "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanName.includes("protein powder")) {
    return "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanName.includes("omega 3") || cleanName.includes("omega3")) {
    return "https://images.unsplash.com/photo-1611926653458-09294b3142bf?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanName.includes("multivitamin") || cleanName.includes("vitamin")) {
    return "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanName.includes("moisturizing cream") || cleanName.includes("moisturizer")) {
    return "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanName.includes("face wash") || cleanName.includes("cleanser")) {
    return "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanName.includes("air fryer")) {
    return "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanName.includes("kettle")) {
    return "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanName.includes("microwave") || cleanName.includes("oven")) {
    return "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanName.includes("polo") || cleanName.includes("t-shirt") || cleanName.includes("tshirt")) {
    return "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanName.includes("jean") || cleanName.includes("denim")) {
    return "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanName.includes("nike") || cleanName.includes("air max") || cleanName.includes("sneaker") || cleanName.includes("shoe")) {
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanName.includes("tab s10") || cleanName.includes("tablet") || cleanName.includes("ipad")) {
    return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanName.includes("dell") || cleanName.includes("xps") || cleanName.includes("laptop") || cleanName.includes("macbook")) {
    return "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanName.includes("iphone") || cleanName.includes("phone") || cleanName.includes("mobile") || cleanName.includes("samsung")) {
    return "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=400&auto=format&fit=crop";
  }

  // 2. Generic key term fallbacks
  if (cleanName.includes("headphone") || cleanName.includes("earphone") || cleanName.includes("audio")) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanName.includes("watch") || cleanName.includes("smartwatch") || cleanName.includes("wearable")) {
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanCategory.includes("electronic") || cleanName.includes("camera") || cleanName.includes("tv")) {
    return "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=400&auto=format&fit=crop";
  }
  if (cleanCategory.includes("apparel") || cleanCategory.includes("fashion") || cleanName.includes("jacket")) {
    return "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop";
  }
  
  // High-end general product fallback
  return "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400&auto=format&fit=crop";
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isAddingToCart,
  onPress,
  onAddToCart,
}) => {
  const isOutOfStock = product.stock === 0;
  const imageUrl = getProductImage(product.name, product.category?.name);

  // Dynamic but stable values simulated for a real e-commerce feel
  const rating = (4.0 + ((product.id * 7) % 10) * 0.1).toFixed(1);
  const soldCount = 50 + ((product.id * 23) % 900);
  const discountPercent = 15 + ((product.id * 5) % 25); // 15% - 40% OFF
  const salePrice = Number(product.price);
  const originalPrice = salePrice / (1 - discountPercent / 100);
  const hasFreeDelivery = product.id % 2 === 0;

  return (
    <TouchableOpacity
      style={[
        styles.productCard,
        isOutOfStock && styles.productCardDisabled,
      ]}
      onPress={() => onPress(product)}
      disabled={isOutOfStock}
      activeOpacity={0.9}
    >
      <View style={styles.productImageWrapper}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {/* Out of Stock Banner Overlay */}
        {isOutOfStock && (
          <View style={styles.outOfStockMask}>
            <Text style={styles.outOfStockLabel}>OUT OF STOCK</Text>
          </View>
        )}

        {/* Discount Tag on top left */}
        {!isOutOfStock && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}

        {/* Free Shipping Tag on top right */}
        {hasFreeDelivery && !isOutOfStock && (
          <View style={styles.shippingBadge}>
            <Text style={styles.shippingText}>Free Shipping</Text>
          </View>
        )}
      </View>

      {/* Product Details Section */}
      <View style={styles.productDetails}>
        <View style={styles.topInfo}>
          <Text style={styles.categoryName} numberOfLines={1}>
            {product.category?.name || "Premium Store"}
          </Text>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
        </View>

        {/* Rating and Sold count row (Daraz / Temu style) */}
        <View style={styles.ratingRow}>
          <Text style={styles.ratingText}>★ {rating}</Text>
          <Text style={styles.soldText}>({soldCount} sold)</Text>
        </View>
        
        {/* Price layout (Original price crossed, Sale price highlighted) */}
        <View style={styles.priceContainer}>
          <View style={styles.priceWrapper}>
            <Text style={styles.salePrice}>${salePrice.toFixed(2)}</Text>
            <Text style={styles.originalPrice}>${originalPrice.toFixed(2)}</Text>
          </View>
          
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
                <Plus size={15} color={THEME.colors.textLight} />
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
    height: 235, // Dense vertical size
    backgroundColor: "#FFFFFF",
    borderRadius: 12, // Standard retail-app rounded border
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: THEME.spacing.xs,
  },
  productCardDisabled: {
    opacity: 0.6,
  },
  productImageWrapper: {
    width: "100%",
    height: 120, 
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
    fontSize: 10,
    letterSpacing: 0.5,
  },
  discountBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#EF4444", // Bold red discount tag like Temu
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  shippingBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#E6F4EA", // Soft green free shipping badge like Daraz
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#A3E635",
  },
  shippingText: {
    color: "#16A34A",
    fontSize: 8,
    fontWeight: "700",
  },
  productDetails: {
    padding: 8,
    justifyContent: "space-between",
    flex: 1,
  },
  topInfo: {
    gap: 1,
  },
  categoryName: {
    fontSize: 8,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  productName: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textPrimary,
    lineHeight: 14,
    height: 28, // Strict height for exactly two lines
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    color: "#F59E0B", // Bright gold stars
    fontSize: 10,
    fontWeight: "700",
  },
  soldText: {
    color: THEME.colors.textSecondary,
    fontSize: 9,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
  },
  priceWrapper: {
    flexDirection: "column",
  },
  salePrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#EF4444", // Highlighted promotional red/orange price
  },
  originalPrice: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    textDecorationLine: "line-through",
    marginTop: 0,
  },
  inlineAddButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 6,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});

