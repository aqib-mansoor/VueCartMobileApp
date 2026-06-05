import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, SlidersHorizontal, ShoppingBag, RefreshCw, X } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { ROUTES } from "../../constants/routes";

// Import custom hook and styles
import { useHomeData } from "../../hooks/useHomeData";
import { styles } from "../../styles/homeStyles";

// Import custom modular components
import { WelcomeHeader } from "../../components/home/WelcomeHeader";
import { AutoPromoSlider } from "../../components/home/AutoPromoSlider";
import { ProductCard } from "../../components/home/ProductCard";
import { ProductDetailModal } from "../../components/home/ProductDetailModal";

type Category = {
  id: number;
  name: string;
  description?: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const {
    user,
    products,
    categories,
    selectedCategoryId,
    favoritedProductIds,
    page,
    lastPage,
    isProductsLoading,
    isCategoriesLoading,
    isAddingToCart,
    searchQuery,
    setSearchQuery,
    isSearching,
    cartCount,
    selectedProduct,
    setSelectedProduct,
    handleSelectCategory,
    handleAddToCart,
    handleToggleFavorite,
    handleLoadMore,
    handleLogout,
  } = useHomeData();

  // Render Category Item Pill
  const renderCategoryItem = ({ item }: { item: Category | null }) => {
    const isSelected = item === null ? selectedCategoryId === null : selectedCategoryId === item.id;
    const label = item === null ? "All Products" : item.name;

    return (
      <TouchableOpacity
        style={[styles.categoryPill, isSelected && styles.categoryPillSelected]}
        onPress={() => handleSelectCategory(item ? item.id : null)}
        activeOpacity={0.8}
      >
        <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Shimmer / Skeleton UI loading state
  const renderSkeletonGrid = () => (
    <View style={styles.gridContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={[styles.skeletonCard, { height: i % 2 === 0 ? 250 : 220 }]}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: "60%" }]} />
          <View style={[styles.skeletonLine, { width: "40%", height: 16 }]} />
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Sticky Custom Welcome Header Component */}
      <WelcomeHeader
        userName={user?.name}
        cartCount={cartCount}
        onCartPress={() => router.push(ROUTES.CART as any)}
        onOrdersPress={() => router.push(ROUTES.ORDERS as any)}
        onProfilePress={() => router.push(ROUTES.PROFILE as any)}
        onFavoritesPress={() => router.push(ROUTES.FAVORITES as any)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar & Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color={THEME.colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, brands, categories..."
              placeholderTextColor={THEME.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearSearchButton}>
                <X size={16} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
            <SlidersHorizontal size={20} color={THEME.colors.primary} />
          </TouchableOpacity>
        </View>


        {/* Automatic Sliding Promotions Carousel */}
        <AutoPromoSlider />

        {/* Categories Strip */}
        <View style={styles.categoriesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Categories</Text>
            {isCategoriesLoading && <ActivityIndicator size="small" color={THEME.colors.primary} />}
          </View>
          
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[null, ...categories]}
            renderItem={renderCategoryItem}
            keyExtractor={(item, index) => (item ? item.id.toString() : "all")}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Products Grid Section */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isSearching ? "Search Results" : selectedCategoryId ? "Category Spotlight" : "Explore Collections"}
            </Text>
            {isSearching && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Reset Search</Text>
              </TouchableOpacity>
            )}
          </View>

          {isProductsLoading && products.length === 0 ? (
            renderSkeletonGrid()
          ) : products.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <ShoppingBag size={48} color={THEME.colors.textMuted} />
              <Text style={styles.emptyStateTitle}>No Products Found</Text>
              <Text style={styles.emptyStateText}>
                We couldn't find any products matching your query. Adjust your filters or browse standard collections.
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => {
                  setSearchQuery("");
                  handleSelectCategory(null);
                }}
              >
                <Text style={styles.emptyStateButtonText}>Show All Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {products.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={idx}
                  isAddingToCart={isAddingToCart === product.id}
                  isFavorited={favoritedProductIds.has(product.id)}
                  onPress={setSelectedProduct}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </View>
          )}

          {/* Load More Pagination Trigger */}
          {page < lastPage && !isProductsLoading && !selectedCategoryId && !isSearching && (
            <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore} activeOpacity={0.8}>
              <RefreshCw size={16} color={THEME.colors.primary} style={styles.loadMoreIcon} />
              <Text style={styles.loadMoreText}>Explore More Collections</Text>
            </TouchableOpacity>
          )}

          {isProductsLoading && products.length > 0 && (
            <View style={styles.loadingMoreIndicator}>
              <ActivityIndicator size="small" color={THEME.colors.primary} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Slide-Up Product Detail Sheet Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isFavorited={selectedProduct ? favoritedProductIds.has(selectedProduct.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />
    </SafeAreaView>
  );
}
