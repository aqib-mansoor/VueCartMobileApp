import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Heart, ShoppingBag } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { favoritesStyles as s } from "../../styles/favoritesStyles";

type FavoritesEmptyStateProps = {
  onExplore: () => void;
};

export const FavoritesEmptyState: React.FC<FavoritesEmptyStateProps> = ({ onExplore }) => {
  return (
    <View style={s.emptyContainer}>
      <View style={s.emptyIconCircle}>
        <Heart size={44} color={THEME.colors.primary} fill={THEME.colors.primary} />
      </View>
      <Text style={s.emptyTitle}>No Favorites Yet</Text>
      <Text style={s.emptySub}>
        Explore our collections and tap the heart icon to save your favorite products here.
      </Text>
      <TouchableOpacity
        style={s.exploreButton}
        onPress={onExplore}
        activeOpacity={0.8}
      >
        <ShoppingBag size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={s.exploreButtonText}>Explore Collections</Text>
      </TouchableOpacity>
    </View>
  );
};
