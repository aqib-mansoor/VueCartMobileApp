import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { ShoppingCart, LogOut, Crown } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { THEME } from "../constants/theme";

type WelcomeHeaderProps = {
  userName: string | null | undefined;
  cartCount: number;
  onLogout: () => void;
  onCartPress: () => void;
};

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  userName,
  cartCount,
  onLogout,
  onCartPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + THEME.spacing.sm }]}>
      <View style={styles.welcomeSection}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName ? userName[0].toUpperCase() : "G"}
            </Text>
          </View>
          {userName && (
            <View style={styles.onlineDot} />
          )}
        </View>

        <View style={styles.greetingTextContainer}>
          <View style={styles.loyaltyRow}>
            <Text style={styles.greetingSub}>Good Day!</Text>
            {userName && (
              <View style={styles.loyaltyBadge}>
                <Crown size={8} color="#D97706" fill="#D97706" />
                <Text style={styles.loyaltyBadgeText}>PLUS</Text>
              </View>
            )}
          </View>
          <Text style={styles.greetingTitle}>
            {userName ? `Hello, ${userName}` : "Welcome to CartVue"}
          </Text>
        </View>
      </View>

      <View style={styles.headerActions}>
        {userName && (
          <TouchableOpacity style={styles.logoutIconButton} onPress={onLogout} activeOpacity={0.7}>
            <LogOut size={18} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.cartIconButton} onPress={onCartPress} activeOpacity={0.7}>
          <ShoppingCart size={22} color={THEME.colors.textPrimary} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: THEME.spacing.sm,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E9D5FF",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.colors.success,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  greetingTextContainer: {
    justifyContent: "center",
  },
  loyaltyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  greetingSub: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loyaltyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
    borderWidth: 0.5,
    borderColor: "#FCD34D",
  },
  loyaltyBadgeText: {
    color: "#B45309",
    fontSize: 8,
    fontWeight: "800",
  },
  greetingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: THEME.spacing.md,
  },
  logoutIconButton: {
    padding: 6,
  },
  cartIconButton: {
    padding: 6,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: THEME.colors.secondary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
});
