import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { checkoutStyles as s } from "../../styles/checkoutStyles";

type CheckoutHeaderProps = {
  onBack: () => void;
};

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({ onBack }) => {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
        <ChevronLeft size={24} color={THEME.colors.textPrimary} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>Checkout</Text>
      <View style={{ width: 32 }} />
    </View>
  );
};
