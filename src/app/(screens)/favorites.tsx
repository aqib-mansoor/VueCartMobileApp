import React from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { THEME } from "../../constants/theme";
import { ProductCard } from "../../components/home/ProductCard";
import { ProductDetailModal } from "../../components/home/ProductDetailModal";
import { FavoritesHeader } from "../../components/favorites/FavoritesHeader";
import { FavoritesEmptyState } from "../../components/favorites/FavoritesEmptyState";
import { useFavoritesData } from "../../hooks/useFavoritesData";
import { favoritesStyles as styles } from "../../styles/favoritesStyles";
import { ROUTES } from "../../constants/routes";

export default function FavoritesScreen() {
  const {
    router,
    favorites,
    isLoading,
    isAddingToCart,
    selectedProduct,
    setSelectedProduct,
    handleToggleFavorite,
    handleAddToCart,
  } = useFavoritesData();

  const renderSkeletons = () => (
    <ScrollView contentContainerStyle={[styles.scrollContent, { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }]}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={{
          width: (Dimensions.get("window").width - THEME.spacing.lg * 3) / 2,
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: THEME.spacing.sm,
          gap: THEME.spacing.sm,
          marginBottom: THEME.spacing.md,
          borderWidth: 1,
          borderColor: "#E2E8F0",
        }}>
          <View style={{ width: "100%", height: 130, backgroundColor: "#E5E7EB", borderRadius: 16 }} />
          <View style={{ width: "80%", height: 12, backgroundColor: "#E5E7EB", borderRadius: 6, marginTop: 4 }} />
          <View style={{ width: "60%", height: 12, backgroundColor: "#E5E7EB", borderRadius: 6 }} />
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      {/* Header */}
      <FavoritesHeader onBack={() => router.back()} />

      {isLoading && favorites.length === 0 ? (
        renderSkeletons()
      ) : favorites.length === 0 ? (
        <FavoritesEmptyState onExplore={() => router.push(ROUTES.HOME as any)} />
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
