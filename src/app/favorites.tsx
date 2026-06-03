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
import { THEME } from "../constants/theme";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";
import { ProductCard } from "../components/home/ProductCard";
import { ProductDetailModal } from "../components/home/ProductDetailModal";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";

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
  const { showToast } = useToast();
  const { authToken } = useAuth();

  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (authToken) {
      fetchFavorites();
    } else {
      setIsLoading(false);
    }
  }, [authToken]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.FAVORITES);
      if (res.ok) {
        const data = await res.json();
        const favList = data.records || data.favorites || data.data || [];
        // Map to extract nested product properties
        const products = favList.map((fav: any) => fav.product).filter(Boolean);
        setFavorites(products);
      }
    } catch (err) {
      console.error("Error fetching favorites list:", err);
      showToast({ message: "Failed to load favorites", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (productId: number) => {
    // Pessimistically remove item from UI list
    setFavorites(prev => prev.filter(p => p.id !== productId));
    try {
      const res = await apiClient.delete(`${API_ENDPOINTS.FAVORITES}/${productId}`);
      if (res.ok) {
        showToast({ message: "Removed from favorites", type: "info" });
      } else {
        showToast({ message: "Failed to remove from favorites", type: "error" });
        fetchFavorites();
      }
    } catch {
      showToast({ message: "Network error", type: "error" });
      fetchFavorites();
    }
  };

  const handleAddToCart = async (productId: number) => {
    setIsAddingToCart(productId);
    try {
      const res = await apiClient.post(API_ENDPOINTS.CART, { product_id: productId, quantity: 1 });
      if (res.ok) {
        showToast({ message: "Added to cart! 🎉", type: "success" });
      } else {
        const data = await res.json();
        showToast({ message: data.message || "Failed to add to cart", type: "error" });
      }
    } catch (err) {
      showToast({ message: "Network connection error", type: "error" });
    } finally {
      setIsAddingToCart(null);
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

      {isLoading ? (
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
            onPress={() => router.push("/home" as any)}
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
