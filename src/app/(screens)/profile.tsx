import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ClipboardList,
  FileText,
  HelpCircle,
  Info,
  Shield,
  ShoppingCart,
  Settings,
} from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuItem } from "../../components/profile/MenuItem";
import { InfoModal } from "../../components/profile/InfoModal";
import { EditProfileModal } from "../../components/profile/EditProfileModal";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { ProfileHero } from "../../components/profile/ProfileHero";
import { AddressPanel } from "../../components/profile/AddressPanel";
import { FavouritesPanel } from "../../components/profile/FavouritesPanel";
import { useProfileData } from "../../hooks/useProfileData";
import { profileStyles as styles } from "../../styles/profileStyles";
import { THEME } from "../../constants/theme";
import { ROUTES } from "../../constants/routes";

export default function ProfileScreen() {
  const {
    router,
    user,
    favorites,
    isLoading,
    activeModal,
    showEditModal,
    addresses,
    showNewAddressForm,
    street,
    city,
    state,
    zip,
    country,
    isSavingAddress,

    setActiveModal,
    setShowEditModal,
    setShowNewAddressForm,
    setStreet,
    setCity,
    setState,
    setZip,
    setCountry,

    handleSaveAddress,
    handleLogout,
  } = useProfileData();

  // Navigation menu items
  const menuItems = [
    {
      icon: <ClipboardList size={20} color={THEME.colors.primary} />,
      label: "Order History",
      subtitle: "View your past orders",
      onPress: () => router.push(ROUTES.ORDERS as any),
    },
    {
      icon: <ShoppingCart size={20} color={THEME.colors.secondary} />,
      label: "My Cart",
      subtitle: "View items in your cart",
      onPress: () => router.push(ROUTES.CART as any),
    },
    {
      icon: <Settings size={20} color="#64748B" />,
      label: "Edit Profile",
      subtitle: "Update name, email, password",
      onPress: () => setShowEditModal(true),
    },
  ];

  const renderSkeletons = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Hero Banner Skeleton */}
      <View style={[styles.heroBanner, { backgroundColor: "#E2E8F0" }]}>
        <View style={styles.heroGradient}>
          <View style={[styles.largeAvatar, { backgroundColor: "#CBD5E1", borderColor: "#CBD5E1" }]} />
          <View style={{ width: 120, height: 18, backgroundColor: "#CBD5E1", borderRadius: 4 }} />
          <View style={{ width: 180, height: 12, backgroundColor: "#CBD5E1", borderRadius: 4, marginTop: 8 }} />
        </View>
      </View>
      {/* Menu Card Skeletons */}
      <View style={[styles.menuCard, { padding: 16, gap: 16 }]}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#E5E7EB" }} />
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ width: "40%", height: 14, backgroundColor: "#E5E7EB", borderRadius: 4 }} />
              <View style={{ width: "60%", height: 10, backgroundColor: "#E5E7EB", borderRadius: 4 }} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      {/* Header */}
      <ProfileHeader onBack={() => router.back()} onLogout={handleLogout} />

      {isLoading ? (
        renderSkeletons()
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Profile Banner */}
          <ProfileHero user={user} />

          {/* Quick Navigation Menu */}
          <View style={styles.menuCard}>
            {menuItems.map((item, idx) => (
              <MenuItem
                key={idx}
                icon={item.icon}
                label={item.label}
                subtitle={item.subtitle}
                onPress={item.onPress}
                isLast={idx === menuItems.length - 1}
              />
            ))}
          </View>

          {/* Saved Addresses Panel */}
          <AddressPanel
            addresses={addresses}
            showNewAddressForm={showNewAddressForm}
            setShowNewAddressForm={setShowNewAddressForm}
            street={street}
            setStreet={setStreet}
            city={city}
            setCity={setCity}
            state={state}
            setState={setState}
            zip={zip}
            setZip={setZip}
            country={country}
            setCountry={setCountry}
            isSavingAddress={isSavingAddress}
            onSaveAddress={handleSaveAddress}
          />

          {/* Favourites Panel */}
          <FavouritesPanel favorites={favorites} router={router} />

          {/* Support & Legal Section */}
          <View style={styles.sectionCard}>
            <Text style={[styles.formSectionTitle, { marginBottom: 12 }]}>Support & Legal</Text>
            <MenuItem
              icon={<HelpCircle size={20} color={THEME.colors.primary} />}
              label="Help & Support"
              subtitle="FAQ and customer care details"
              onPress={() => setActiveModal("support")}
            />
            <MenuItem
              icon={<Shield size={20} color="#10B981" />}
              label="Privacy Policy"
              subtitle="Our commitment to your data"
              onPress={() => setActiveModal("privacy")}
            />
            <MenuItem
              icon={<FileText size={20} color="#F59E0B" />}
              label="Terms of Service"
              subtitle="User agreement and rules"
              onPress={() => setActiveModal("terms")}
            />
            <MenuItem
              icon={<Info size={20} color="#3B82F6" />}
              label="About Us"
              subtitle="App version and tech details"
              onPress={() => setActiveModal("about")}
              isLast
            />
          </View>

          {/* Logout at Bottom */}
          <TouchableOpacity
            style={styles.logoutCard}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutCardText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Reusable Info Modal */}
      <InfoModal
        type={activeModal}
        visible={activeModal !== null}
        onClose={() => setActiveModal(null)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </SafeAreaView>
  );
}
