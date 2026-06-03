import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { THEME } from "../../constants/theme";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onPress: () => void;
  isLast?: boolean;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  subtitle,
  onPress,
  isLast = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.menuRow, !isLast && styles.menuRowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconContainer}>{icon}</View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={18} color={THEME.colors.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
});
