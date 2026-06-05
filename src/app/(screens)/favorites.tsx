import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Heart, ShoppingBag } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { ProductCard } from "../../components/home/ProductCard";
import { ProductDetailModal } from "../../components/home/ProductDetailModal";
import { useToast } from "../../components/ui/Toast";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { fetchFavorites, toggleFavorite, addToCart } from "../../redux/action";
import { ROUTES } from "../../constants/routes";

type Product = {
  id: number;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  category_id: number;
  category?: { name: string };
};

export default function FavoritesScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const { authToken } = useAppSelector((state) => state.auth);
  const favorites = useAppSelector((state) => state.favorites.items);
  const isLoading = useAppSelector((state) => state.favorites.isLoading);
  const isAddingToCart = useAppSelector((state) => state.cart.isAddingToCartId);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (authToken) {
      dispatch(fetchFavorites(favorites.length === 0));
    }
  }, [authToken, dispatch, favorites.length]);

  const handleToggleFavorite = async (productId: number) => {
    try {
      const res = await dispatch(toggleFavorite(productId));
      if (res.action === "added") {
        showToast({ message: "Added to favorites! ❤️", type: "success" });
      } else {
        showToast({ message: "Removed from favorites", type: "info" });
      }
    } catch (err: any) {
      showToast({ message: err || "Failed to update favorites", type: "error" });
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await dispatch(addToCart(productId, 1));
      showToast({ message: "Added to cart! 🎉", type: "success" });
    } catch (err: any) {
      showToast({ message: err || "Failed to add to cart", type: "error" });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading && favorites.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Fetching favorites...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Heart size={44} color={THEME.colors.primary} fill={THEME.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySub}>
            Explore our collections and tap the heart icon to save your favorite products here.
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push(ROUTES.HOME as any)}
            activeOpacity={0.8}
          >
            <ShoppingBag size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.exploreButtonText}>Explore Collections</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gridContainer}>
            {favorites.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                isAddingToCart={isAddingToCart === product.id}
                isFavorited={true}
                onPress={setSelectedProduct}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </View>
        </ScrollView>
      )}

      {/* Detail Slide Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isFavorited={selectedProduct ? true : false}
        onToggleFavorite={handleToggleFavorite}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    backgroundColor: THEME.colors.primary,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 32,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: THEME.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
