import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { ShoppingCart, LogOut, Crown, ClipboardList, Heart } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { THEME } from "../../constants/theme";

type WelcomeHeaderProps = {
  userName: string | null | undefined;
  cartCount: number;
  onCartPress: () => void;
  onOrdersPress: () => void;
  onProfilePress: () => void;
  onFavoritesPress: () => void;
};

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  userName,
  cartCount,
  onCartPress,
  onOrdersPress,
  onProfilePress,
  onFavoritesPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["#5B21B6", "#7C3AED"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.headerGradient, { paddingTop: insets.top + THEME.spacing.sm }]}
    >
      <View style={styles.headerContent}>
        {/* Welcome Section */}
        <TouchableOpacity
          style={styles.welcomeSection}
          onPress={onProfilePress}
          activeOpacity={0.8}
        >
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userName ? userName[0].toUpperCase() : "G"}
              </Text>
            </View>
            {userName && <View style={styles.onlineDot} />}
          </View>

          <View style={styles.greetingTextContainer}>
            <View style={styles.loyaltyRow}>
              <Text style={styles.greetingSub}>Good Day!</Text>
              {userName && (
                <View style={styles.loyaltyBadge}>
                  <Crown size={8} color="#FFF" fill="#FFF" />
                  <Text style={styles.loyaltyBadgeText}>PLUS</Text>
                </View>
              )}
            </View>
            <Text style={styles.greetingTitle} numberOfLines={1}>
              {userName ? `Hello, ${userName}` : "Welcome to CartVue"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Actions Row */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.glassButton} onPress={onFavoritesPress} activeOpacity={0.7}>
            <Heart size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.glassButton} onPress={onOrdersPress} activeOpacity={0.7}>
            <ClipboardList size={17} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.glassButton, styles.cartBtn]} onPress={onCartPress} activeOpacity={0.7}>
            <ShoppingCart size={18} color="#FFFFFF" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    paddingBottom: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: THEME.spacing.sm,
    flex: 1,
    marginRight: THEME.spacing.md,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18,
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
    borderColor: "#7C3AED", // Matches gradient highlight background
  },
  greetingTextContainer: {
    justifyContent: "center",
    flex: 1,
  },
  loyaltyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  greetingSub: {
    fontSize: 10,
    fontWeight: "700",
    color: "#DDD6FE", // Light purple pastel text
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  loyaltyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F97316", // Vibrant orange accent
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    gap: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  loyaltyBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },
  greetingTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 1,
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  glassButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  cartBtn: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    right: -4,
    top: -4,
    backgroundColor: "#F97316", // Secondary logo orange for contrast pop
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#7C3AED",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
});
