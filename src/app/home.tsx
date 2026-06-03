import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { THEME } from "../constants/theme";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login" as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Catalog", headerLeft: () => null }} />
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>CartVue Catalog</Text>
        <Text style={styles.welcomeText}>
          Welcome, {user?.name || user?.email || "Guest"}!
        </Text>
        <Text style={styles.subtitle}>You have successfully authenticated.</Text>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: THEME.spacing.xxl,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: THEME.colors.cardBackground,
    padding: THEME.spacing.xxxl,
    borderRadius: THEME.borderRadius.xl,
    alignItems: "center",
    shadowColor: THEME.colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    marginBottom: THEME.spacing.xxxl,
  },
  logoutButton: {
    backgroundColor: THEME.colors.error,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: THEME.borderRadius.md,
    width: "100%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: THEME.colors.textLight,
    fontSize: 15,
    fontWeight: "600",
  },
});
