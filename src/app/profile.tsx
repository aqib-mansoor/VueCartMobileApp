import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Calendar,
  Save,
  Key,
  ClipboardList,
  MapPin,
  Heart,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react-native";
import { THEME } from "../constants/theme";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";
import { useAuth } from "../context/AuthContext";
import { getProductImage } from "../components/ProductCard";
import { useToast } from "../components/Toast";

type Address = {
  id: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { authToken, login, logout } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Mock favourites
  const mockFavourites = [
    { id: 1, name: "Wireless Headphones", price: 99.99, category: "Electronics" },
    { id: 2, name: "Protein Powder", price: 49.99, category: "Fitness" },
    { id: 3, name: "Nike Air Max", price: 129.99, category: "Fashion" },
  ];

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.PROFILE);
      if (res.ok) {
        const data = await res.json();
        const profile = data.user || data.data || {};
        setName(profile.name || "");
        setEmail(profile.email || "");
        setAge(profile.age ? String(profile.age) : "");
      }

      const addressRes = await apiClient.get(API_ENDPOINTS.ADDRESSES);
      if (addressRes.ok) {
        const addressData = await addressRes.json();
        setAddresses(addressData.addresses || addressData.data || []);
      }
    } catch (err) {
      console.error("Error fetching profile screen details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      showToast({ message: "Name and email are required", type: "warning" });
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = { name, email };
      if (age.trim()) payload.age = Number(age);
      if (password.trim()) payload.password = password;

      const res = await apiClient.put(API_ENDPOINTS.PROFILE, payload);
      if (res.ok) {
        const data = await res.json();
        const updatedUser = data.user || data.data || { name, email, age: Number(age) };

        if (authToken) {
          await login(authToken, {
            name: updatedUser.name || name,
            email: updatedUser.email || email,
            age: updatedUser.age || Number(age) || undefined,
          });
        }

        setPassword("");
        setShowEditForm(false);
        showToast({ message: "Profile updated successfully!", type: "success" });
      } else {
        const data = await res.json().catch(() => ({}));
        showToast({ message: data.message || "Failed to update profile", type: "error" });
      }
    } catch (err) {
      showToast({ message: "Network connectivity issue", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login" as any);
        },
      },
    ]);
  };

  // Navigation menu items
  const menuItems = [
    {
      icon: <ClipboardList size={20} color={THEME.colors.primary} />,
      label: "Order History",
      subtitle: "View your past orders",
      onPress: () => router.push("/orders" as any),
    },
    {
      icon: <ShoppingCart size={20} color={THEME.colors.secondary} />,
      label: "My Cart",
      subtitle: "View items in your cart",
      onPress: () => router.push("/cart" as any),
    },
    {
      icon: <Settings size={20} color="#64748B" />,
      label: "Edit Profile",
      subtitle: "Update name, email, password",
      onPress: () => setShowEditForm(!showEditForm),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
          <LogOut size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Fetching profile details...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Profile Banner */}
          <View style={styles.heroBanner}>
            <View style={styles.heroGradient}>
              <View style={styles.largeAvatar}>
                <Text style={styles.largeAvatarText}>
                  {name ? name[0].toUpperCase() : "U"}
                </Text>
              </View>
              <Text style={styles.profileName}>{name || "User Name"}</Text>
              <Text style={styles.profileEmail}>{email || "user@example.com"}</Text>
              {age ? (
                <View style={styles.ageBadge}>
                  <Text style={styles.ageBadgeText}>Age: {age}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Quick Navigation Menu */}
          <View style={styles.menuCard}>
            {menuItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.menuRow,
                  idx < menuItems.length - 1 && styles.menuRowBorder,
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconContainer}>{item.icon}</View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={18} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Collapsible Edit Profile Form */}
          {showEditForm && (
            <View style={styles.formCard}>
              <Text style={styles.formSectionTitle}>Account Details</Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <User size={18} color={THEME.colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={THEME.colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Mail size={18} color={THEME.colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor={THEME.colors.textMuted}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Calendar size={18} color={THEME.colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Age"
                  placeholderTextColor={THEME.colors.textMuted}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </View>

              <Text style={[styles.formSectionTitle, { marginTop: 12 }]}>
                Change Password (Optional)
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Key size={18} color={THEME.colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor={THEME.colors.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={isSaving}
                activeOpacity={0.9}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Save size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.saveButtonText}>Save Profile Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Saved Addresses Panel */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <MapPin size={18} color={THEME.colors.primary} />
                <Text style={styles.sectionTitle}>Saved Addresses</Text>
              </View>
              <Text style={styles.sectionCount}>{addresses.length}</Text>
            </View>
            {addresses.length === 0 ? (
              <Text style={styles.emptyBlockText}>
                No saved addresses. Add one during checkout.
              </Text>
            ) : (
              <View style={styles.addressList}>
                {addresses.map((addr) => (
                  <View key={addr.id} style={styles.addressCardItem}>
                    <View style={styles.addressDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.addressStreet}>{addr.street}</Text>
                      <Text style={styles.addressSub}>
                        {addr.city}, {addr.state} {addr.zip}, {addr.country}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Favourites Panel */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Heart size={18} color="#EF4444" fill="#EF4444" />
                <Text style={styles.sectionTitle}>My Favourites</Text>
              </View>
              <Text style={styles.sectionCount}>{mockFavourites.length}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favScrollRow}
            >
              {mockFavourites.map((fav) => (
                <View key={fav.id} style={styles.favItemCard}>
                  <Image
                    source={{ uri: getProductImage(fav.name, fav.category) }}
                    style={styles.favImage}
                  />
                  <Text style={styles.favName} numberOfLines={1}>
                    {fav.name}
                  </Text>
                  <Text style={styles.favPrice}>${fav.price.toFixed(2)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Logout at Bottom */}
          <TouchableOpacity
            style={styles.logoutCard}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={18} color={THEME.colors.error} />
            <Text style={styles.logoutCardText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    backgroundColor: THEME.colors.primary,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  logoutBtn: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 32,
  },

  /* Hero Profile Banner */
  heroBanner: {
    backgroundColor: THEME.colors.primary,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroGradient: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  largeAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  largeAvatarText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  profileEmail: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
  },
  ageBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 8,
  },
  ageBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  /* Navigation Menu */
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: THEME.spacing.md,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
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

  /* Edit Form */
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.md,
    padding: THEME.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: THEME.spacing.md,
  },
  formSectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: THEME.colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 13,
    color: THEME.colors.textPrimary,
  },
  saveButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  /* Section Cards */
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.md,
    padding: THEME.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: THEME.colors.textPrimary,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.colors.textSecondary,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  emptyBlockText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontStyle: "italic",
  },
  addressList: {
    gap: 10,
  },
  addressCardItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  addressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
    marginTop: 5,
  },
  addressStreet: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
  },
  addressSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },

  /* Favourites */
  favScrollRow: {
    gap: 10,
    paddingRight: 4,
  },
  favItemCard: {
    width: 120,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  favImage: {
    width: "100%",
    height: 90,
    backgroundColor: "#E2E8F0",
  },
  favName: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  favPrice: {
    fontSize: 12,
    fontWeight: "900",
    color: THEME.colors.error,
    paddingHorizontal: 8,
    paddingBottom: 8,
    marginTop: 2,
  },

  /* Logout Card */
  logoutCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  logoutCardText: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.colors.error,
  },
});
