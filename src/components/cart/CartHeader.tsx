import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { cartStyles as s } from "../../styles/cartStyles";

type CartHeaderProps = {
  onBack: () => void;
  totalItems: number;
  cartLength: number;
  onClear: () => void;
  isClearing: boolean;
};

export const CartHeader: React.FC<CartHeaderProps> = ({
  onBack,
  totalItems,
  cartLength,
  onClear,
  isClearing,
}) => {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
        <ChevronLeft size={24} color={THEME.colors.textPrimary} />
      </TouchableOpacity>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={s.headerTitle}>Shopping Cart</Text>
        {totalItems > 0 && (
          <View style={s.headerBadge}>
            <Text style={s.headerBadgeText}>{totalItems}</Text>
          </View>
        )}
      </View>
      {cartLength > 0 ? (
        <TouchableOpacity onPress={onClear} disabled={isClearing} activeOpacity={0.7}>
          {isClearing ? (
            <ActivityIndicator size="small" color={THEME.colors.secondary} />
          ) : (
            <Text style={s.clearText}>Clear All</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={{ width: 60 }} />
      )}
    </View>
  );
};
