import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Heart, ArrowRight } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { ROUTES } from "../../constants/routes";
import { profileStyles as s } from "../../styles/profileStyles";
import { getProductImage } from "../home/ProductCard";

type FavItem = {
  id: number;
  name: string;
  price: string | number;
  category?: {
    name: string;
  };
};

type FavouritesPanelProps = {
  favorites: FavItem[];
  router: any;
};

export const FavouritesPanel: React.FC<FavouritesPanelProps> = ({ favorites, router }) => {
  return (
    <View style={s.sectionCard}>
      <View style={s.sectionHeaderRow}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Heart size={18} color="#EF4444" fill="#EF4444" />
          <Text style={s.sectionTitle}>My Favourites</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={s.sectionCount}>{favorites.length}</Text>
          {favorites.length > 0 && (
            <TouchableOpacity onPress={() => router.push(ROUTES.FAVORITES as any)}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: THEME.colors.primary }}>See More</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {favorites.length === 0 ? (
        <Text style={s.emptyBlockText}>
          No favorites yet. Add some to your wishlist!
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.favScrollRow}
        >
          {favorites.map((fav) => (
            <View key={fav.id} style={s.favItemCard}>
              <Image
                source={{ uri: getProductImage(fav.name, fav.category?.name) }}
                style={s.favImage}
              />
              <Text style={s.favName} numberOfLines={1}>
                {fav.name}
              </Text>
              <Text style={s.favPrice}>${Number(fav.price).toFixed(2)}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={[s.favItemCard, { justifyContent: "center", alignItems: "center", minHeight: 120 }]}
            onPress={() => router.push(ROUTES.FAVORITES as any)}
          >
            <ArrowRight size={24} color={THEME.colors.primary} />
            <Text style={{ fontSize: 11, fontWeight: "800", color: THEME.colors.primary, marginTop: 4 }}>See More</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};
