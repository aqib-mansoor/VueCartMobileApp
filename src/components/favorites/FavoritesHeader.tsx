import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { favoritesStyles as s } from "../../styles/favoritesStyles";

type FavoritesHeaderProps = {
  onBack: () => void;
};

export const FavoritesHeader: React.FC<FavoritesHeaderProps> = ({ onBack }) => {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} style={s.backButton} activeOpacity={0.7}>
        <ChevronLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={s.headerTitle}>My Favorites</Text>
      <View style={{ width: 32 }} />
    </View>
  );
};
