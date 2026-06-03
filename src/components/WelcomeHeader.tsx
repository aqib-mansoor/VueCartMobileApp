import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { ShoppingCart, LogOut } from "lucide-react-native";
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
  return (
    <View style={styles.header}>
      <View style={styles.welcomeSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userName ? userName[0].toUpperCase() : "G"}
          </Text>
        </View>
        <View style={styles.greetingTextContainer}>
          <Text style={styles.greetingSub}>Good Day!</Text>
          <Text style={styles.greetingTitle}>
            {userName ? `Hello, ${userName}` : "Welcome to CartVue"}
          </Text>
        </View>
      </View>

      <View style={styles.headerActions}>
        {userName && (
          <TouchableOpacity style={styles.logoutIconButton} onPress={onLogout} activeOpacity={0.7}>
            <LogOut size={20} color={THEME.colors.textSecondary} />
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
    paddingTop: THEME.spacing.md,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  welcomeSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: THEME.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
  },
  greetingTextContainer: {
    justifyContent: "center",
  },
  greetingSub: {
    fontSize: 11,
    fontWeight: "500",
    color: THEME.colors.textSecondary,
    textTransform: "uppercase",
  },
  greetingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
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
