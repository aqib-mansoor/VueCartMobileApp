import React from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { MapPin, Plus, Check } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { checkoutStyles as s } from "../../styles/checkoutStyles";

type Address = {
  id: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type CheckoutAddressSectionProps = {
  addresses: Address[];
  selectedAddressId: number | null;
  setSelectedAddressId: (id: number) => void;
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

export const CheckoutAddressSection: React.FC<CheckoutAddressSectionProps> = ({
  addresses,
  selectedAddressId,
  setSelectedAddressId,
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
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.cardTitleRow}>
          <MapPin size={16} color={THEME.colors.primary} />
          <Text style={s.cardTitle}>Delivery Address</Text>
        </View>
        {!showNewAddressForm && (
          <TouchableOpacity style={s.addBtn} onPress={() => setShowNewAddressForm(true)}>
            <Plus size={14} color={THEME.colors.primary} />
            <Text style={s.addBtnText}>Add New</Text>
          </TouchableOpacity>
        )}
      </View>

      {showNewAddressForm ? (
        <View style={s.formBox}>
          <TextInput
            style={s.input}
            placeholder="Street Address"
            placeholderTextColor={THEME.colors.textMuted}
            value={street}
            onChangeText={setStreet}
          />
          <View style={s.inputRow}>
            <TextInput
              style={[s.input, { flex: 1, marginRight: 8 }]}
              placeholder="City"
              placeholderTextColor={THEME.colors.textMuted}
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="State"
              placeholderTextColor={THEME.colors.textMuted}
              value={state}
              onChangeText={setState}
            />
          </View>
          <View style={s.inputRow}>
            <TextInput
              style={[s.input, { flex: 1, marginRight: 8 }]}
              placeholder="ZIP Code"
              placeholderTextColor={THEME.colors.textMuted}
              value={zip}
              onChangeText={setZip}
            />
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Country"
              placeholderTextColor={THEME.colors.textMuted}
              value={country}
              onChangeText={setCountry}
            />
          </View>
          <View style={s.formBtns}>
            <TouchableOpacity onPress={() => setShowNewAddressForm(false)}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.saveBtn} onPress={onSaveAddress} disabled={isSavingAddress}>
              {isSavingAddress ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={s.saveBtnText}>Save Address</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : addresses.length === 0 ? (
        <View style={s.emptyAddr}>
          <MapPin size={28} color={THEME.colors.textMuted} />
          <Text style={s.emptyAddrText}>No saved addresses yet</Text>
          <Text style={s.emptyAddrHint}>Tap "Add New" to create one</Text>
        </View>
      ) : (
        addresses.map((addr) => {
          const sel = addr.id === selectedAddressId;
          return (
            <TouchableOpacity
              key={addr.id}
              style={[s.addrCard, sel && s.addrCardSel]}
              onPress={() => setSelectedAddressId(addr.id)}
              activeOpacity={0.8}
            >
              <View style={[s.radio, sel && s.radioSel]}>
                {sel && <View style={s.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.addrStreet}>{addr.street}</Text>
                <Text style={s.addrSub}>
                  {addr.city}, {addr.state} {addr.zip}, {addr.country}
                </Text>
              </View>
              {sel && (
                <View style={s.deliverBadge}>
                  <Check size={10} color="#FFF" />
                  <Text style={s.deliverBadgeText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
};
