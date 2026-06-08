import React from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { MapPin, Plus, Save } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { profileStyles as s } from "../../styles/profileStyles";
import { Address } from "../../hooks/useProfileData";

type AddressPanelProps = {
  addresses: Address[];
  showNewAddressForm: boolean;
  setShowNewAddressForm: (show: boolean) => void;
  street: string;
  setStreet: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  state: string;
  setState: (val: string) => void;
  zip: string;
  setZip: (val: string) => void;
  country: string;
  setCountry: (val: string) => void;
  isSavingAddress: boolean;
  onSaveAddress: () => void;
};

export const AddressPanel: React.FC<AddressPanelProps> = ({
  addresses,
  showNewAddressForm,
  setShowNewAddressForm,
  street,
  setStreet,
  city,
  setCity,
  state,
  setState,
  zip,
  setZip,
  country,
  setCountry,
  isSavingAddress,
  onSaveAddress,
}) => {
  return (
    <View style={s.sectionCard}>
      <View style={s.sectionHeaderRow}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <MapPin size={18} color={THEME.colors.primary} />
          <Text style={s.sectionTitle}>Saved Addresses</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={s.sectionCount}>{addresses.length}</Text>
          <TouchableOpacity
            onPress={() => setShowNewAddressForm(!showNewAddressForm)}
            style={{ backgroundColor: THEME.colors.primary, borderRadius: 6, padding: 4 }}
          >
            <Plus size={14} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {showNewAddressForm && (
        <View style={[s.formCard, { marginHorizontal: 0, marginTop: 0, marginBottom: 12, elevation: 0, borderWidth: 1, borderColor: "#E2E8F0" }]}>
          <Text style={s.formSectionTitle}>Add New Address</Text>

          <View style={s.inputContainer}>
            <TextInput
              style={[s.input, { paddingHorizontal: 12 }]}
              placeholder="Street Address"
              placeholderTextColor={THEME.colors.textMuted}
              value={street}
              onChangeText={setStreet}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={[s.inputContainer, { flex: 1 }]}>
              <TextInput
                style={[s.input, { paddingHorizontal: 12 }]}
                placeholder="City"
                placeholderTextColor={THEME.colors.textMuted}
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={[s.inputContainer, { flex: 1 }]}>
              <TextInput
                style={[s.input, { paddingHorizontal: 12 }]}
                placeholder="State"
                placeholderTextColor={THEME.colors.textMuted}
                value={state}
                onChangeText={setState}
              />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={[s.inputContainer, { flex: 1 }]}>
              <TextInput
                style={[s.input, { paddingHorizontal: 12 }]}
                placeholder="ZIP Code"
                placeholderTextColor={THEME.colors.textMuted}
                value={zip}
                onChangeText={setZip}
              />
            </View>
            <View style={[s.inputContainer, { flex: 1 }]}>
              <TextInput
                style={[s.input, { paddingHorizontal: 12 }]}
                placeholder="Country"
                placeholderTextColor={THEME.colors.textMuted}
                value={country}
                onChangeText={setCountry}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[s.saveButton, { marginTop: 4 }]}
            onPress={onSaveAddress}
            disabled={isSavingAddress}
            activeOpacity={0.9}
          >
            {isSavingAddress ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Save size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={s.saveButtonText}>Save Address</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {addresses.length === 0 ? (
        <Text style={s.emptyBlockText}>
          No saved addresses. Add one here.
        </Text>
      ) : (
        <View style={s.addressList}>
          {addresses.map((addr) => (
            <View key={addr.id} style={s.addressCardItem}>
              <View style={s.addressDot} />
              <View style={{ flex: 1 }}>
                <Text style={s.addressStreet}>{addr.street}</Text>
                <Text style={s.addressSub}>
                  {addr.city}, {addr.state} {addr.zip}, {addr.country}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
