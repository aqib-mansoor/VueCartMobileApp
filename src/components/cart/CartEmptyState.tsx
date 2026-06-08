import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ShoppingBag, ArrowRight } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { cartStyles as s } from "../../styles/cartStyles";

type CartEmptyStateProps = {
  onStartShopping: () => void;
};

export const CartEmptyState: React.FC<CartEmptyStateProps> = ({ onStartShopping }) => {
  return (
    <View style={s.emptyState}>
      <View style={s.emptyIcon}>
        <ShoppingBag size={52} color={THEME.colors.primary} />
      </View>
      <Text style={s.emptyTitle}>Your cart is empty</Text>
      <Text style={s.emptySub}>Looks like you haven't added anything to your cart yet</Text>
      <TouchableOpacity style={s.shopBtn} onPress={onStartShopping} activeOpacity={0.9}>
        <Text style={s.shopBtnText}>Start Shopping</Text>
        <ArrowRight size={16} color="#FFF" style={{ marginLeft: 6 }} />
      </TouchableOpacity>
    </View>
  );
};
