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
import { ChevronLeft, User, Mail, Calendar, Save, Key, ClipboardList, MapPin, Heart } from "lucide-react-native";
import { THEME } from "../constants/theme";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";
import { useAuth } from "../context/AuthContext";
import { getProductImage } from "../components/ProductCard";

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
  const { authToken, login } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");

  // Addresses & Favourites
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Mock favourites matching backend products
  const mockFavourites = [
    { id: 1, name: "Wireless Headphones", price: 99.99, category: "Electronics" },
    { id: 2, name: "Protein Powder", price: 49.99, category: "Fitness" },
  ];

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Profile
      const res = await apiClient.get(API_ENDPOINTS.PROFILE);
      if (res.ok) {
        const data = await res.json();
        const profile = data.user || data.data || {};
        setName(profile.name || "");
        setEmail(profile.email || "");
        setAge(profile.age ? String(profile.age) : "");
      }

      // 2. Fetch Saved Addresses
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
      Alert.alert("Validation", "Name and email are required fields.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name,
        email,
      };
      if (age.trim()) {
        payload.age = Number(age);
      }
      if (password.trim()) {
        payload.password = password;
      }

      const res = await apiClient.put(API_ENDPOINTS.PROFILE, payload);
      if (res.ok) {
        const data = await res.json();
        const updatedUser = data.user || data.data || { name, email, age: Number(age) };
        
        // Sync context and AsyncStorage
        if (authToken) {
          await login(authToken, {
            name: updatedUser.name || name,
            email: updatedUser.email || email,
            age: updatedUser.age || Number(age) || undefined,
          });
        }
        
        setPassword("");
        Alert.alert("Success", "Profile updated successfully!");
      } else {
        const data = await res.json().catch(() => ({}));
        Alert.alert("Error", data.message || "Failed to update profile.");
      }
    } catch (err) {
      Alert.alert("Error", "Network connectivity issue.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <ChevronLeft size={24} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Fetching profile details...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Avatar Area */}
          <View style={styles.avatarCard}>
            <View style={styles.largeAvatar}>
              <Text style={styles.largeAvatarText}>
                {name ? name[0].toUpperCase() : "U"}
              </Text>
            </View>
            <Text style={styles.profileName}>{name || "User Name"}</Text>
            <Text style={styles.profileEmail}>{email || "user@example.com"}</Text>
            
            {/* Quick Navigation Panel */}
            <View style={styles.quickNavRow}>
              <TouchableOpacity
                style={styles.quickNavBtn}
                onPress={() => router.push("/orders" as any)}
                activeOpacity={0.7}
              >
                <ClipboardList size={20} color={THEME.colors.primary} />
                <Text style={styles.quickNavLabel}>Orders</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickNavBtn}
                onPress={() => router.push("/checkout" as any)}
                activeOpacity={0.7}
              >
                <MapPin size={20} color={THEME.colors.primary} />
                <Text style={styles.quickNavLabel}>Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>Account Details</Text>
            
            {/* Name Input */}
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

            {/* Email Input */}
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

            {/* Age Input */}
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

            <Text style={[styles.formSectionTitle, { marginTop: 12 }]}>Change Password (Optional)</Text>

            {/* Password Input */}
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

            {/* Save Button */}
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

          {/* Saved Addresses Panel */}
          <View style={styles.detailsBlockCard}>
            <Text style={styles.blockTitle}>Saved Addresses</Text>
            {addresses.length === 0 ? (
              <Text style={styles.emptyBlockText}>No saved addresses found. Add one during checkout.</Text>
            ) : (
              <View style={styles.addressList}>
                {addresses.map((addr) => (
                  <View key={addr.id} style={styles.addressCardItem}>
                    <MapPin size={16} color={THEME.colors.textSecondary} style={{ marginTop: 2 }} />
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
          <View style={styles.detailsBlockCard}>
            <View style={styles.blockHeaderRow}>
              <Heart size={18} color="#EF4444" fill="#EF4444" />
              <Text style={[styles.blockTitle, { marginLeft: 6 }]}>My Favourites</Text>
            </View>
            <View style={styles.favGrid}>
              {mockFavourites.map((fav) => (
                <View key={fav.id} style={styles.favItemCard}>
                  <Image source={{ uri: getProductImage(fav.name, fav.category) }} style={styles.favImage} />
                  <View style={styles.favInfo}>
                    <Text style={styles.favName} numberOfLines={1}>{fav.name}</Text>
                    <Text style={styles.favPrice}>${fav.price}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
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
    padding: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  avatarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E9D5FF",
  },
  largeAvatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
  },
  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
  },
  profileEmail: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  quickNavRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    justifyContent: "center",
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
    paddingTop: 16,
  },
  quickNavBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  quickNavLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: THEME.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
    gap: THEME.spacing.md,
  },
  formSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
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
    borderRadius: 12,
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
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  detailsBlockCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: THEME.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
  },
  blockTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
    marginBottom: 12,
  },
  blockHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyBlockText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontStyle: "italic",
  },
  addressList: {
    gap: 12,
  },
  addressCardItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  addressStreet: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  addressSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  favGrid: {
    flexDirection: "row",
    gap: 12,
  },
  favItemCard: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    gap: 8,
  },
  favImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
  },
  favInfo: {
    flex: 1,
  },
  favName: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  favPrice: {
    fontSize: 11,
    fontWeight: "800",
    color: "#EF4444",
    marginTop: 2,
  },
});
