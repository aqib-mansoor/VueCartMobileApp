import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { X, User, Mail, Calendar, Phone, Key, Save, Pencil, Check, Sparkles } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { THEME } from "../../constants/theme";
import { apiClient } from "../../utils/api";
import { API_ENDPOINTS } from "../../constants/endpoints";
import { useToast } from "../ui/Toast";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { login as loginAction } from "../../redux/action";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

type FieldConfig = {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  value: string;
  placeholder: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
  onChangeText: (text: string) => void;
};

export function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { authToken, user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);

  const inputRefs = useRef<Record<string, TextInput | null>>({});

  useEffect(() => {
    if (visible && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setAge(user.age ? String(user.age) : "");
      setPhone(user.phone || "");
      setPassword("");
      setEditingField(null);
    }
  }, [visible, user]);

  const startEditing = (fieldId: string) => {
    setEditingField(fieldId);
    setTimeout(() => {
      inputRefs.current[fieldId]?.focus();
    }, 100);
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      showToast({ message: "Name and email are required", type: "warning" });
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = { name, email, phone };
      if (age.trim()) payload.age = Number(age);
      if (password.trim()) payload.password = password;

      const res = await apiClient.put(API_ENDPOINTS.PROFILE, payload);
      if (res.ok) {
        const data = await res.json();
        const updatedUser = data.user || data.data || { name, email, age: Number(age), phone };

        if (authToken) {
          await dispatch(loginAction(authToken, {
            name: updatedUser.name || name,
            email: updatedUser.email || email,
            age: updatedUser.age || Number(age) || undefined,
            phone: updatedUser.phone || phone,
          }));
        }

        setPassword("");
        showToast({ message: "Profile updated successfully!", type: "success" });
        onClose();
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

  const fields: FieldConfig[] = [
    {
      id: "name",
      label: "Full Name",
      icon: <User size={18} color="#64748B" />,
      activeIcon: <User size={18} color={THEME.colors.primary} />,
      value: name,
      placeholder: "Enter your name",
      onChangeText: setName,
    },
    {
      id: "email",
      label: "Email Address",
      icon: <Mail size={18} color="#64748B" />,
      activeIcon: <Mail size={18} color={THEME.colors.primary} />,
      value: email,
      placeholder: "Enter email",
      keyboardType: "email-address",
      onChangeText: setEmail,
    },
    {
      id: "phone",
      label: "Phone",
      icon: <Phone size={18} color="#64748B" />,
      activeIcon: <Phone size={18} color={THEME.colors.primary} />,
      value: phone,
      placeholder: "Enter phone number",
      keyboardType: "phone-pad",
      onChangeText: setPhone,
    },
    {
      id: "age",
      label: "Age",
      icon: <Calendar size={18} color="#64748B" />,
      activeIcon: <Calendar size={18} color={THEME.colors.primary} />,
      value: age,
      placeholder: "Enter age",
      keyboardType: "numeric",
      onChangeText: setAge,
    },
    {
      id: "password",
      label: "New Password",
      icon: <Key size={18} color="#64748B" />,
      activeIcon: <Key size={18} color={THEME.colors.primary} />,
      value: password,
      placeholder: "Enter new password",
      secureTextEntry: true,
      onChangeText: setPassword,
    },
  ];

  const renderField = (field: FieldConfig) => {
    const isEditing = editingField === field.id;
    const displayValue = field.secureTextEntry
      ? (field.value ? "••••••••" : "Not set")
      : (field.value || "Not set");
    const hasValue = !!field.value;

    if (isEditing) {
      return (
        <View key={field.id} style={styles.fieldCard}>
          <View style={styles.fieldActiveHeader}>
            <View style={styles.fieldActiveIconWrap}>{field.activeIcon}</View>
            <Text style={styles.fieldActiveLabel}>{field.label}</Text>
          </View>
          <View style={styles.activeInputRow}>
            <TextInput
              ref={(ref) => { inputRefs.current[field.id] = ref; }}
              style={styles.activeInput}
              placeholder={field.placeholder}
              placeholderTextColor="#94A3B8"
              value={field.value}
              onChangeText={field.onChangeText}
              keyboardType={field.keyboardType || "default"}
              secureTextEntry={field.secureTextEntry}
              autoFocus
              selectionColor={THEME.colors.primary}
            />
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => setEditingField(null)}
              activeOpacity={0.7}
            >
              <Check size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={field.id}
        style={styles.fieldCard}
        onPress={() => startEditing(field.id)}
        activeOpacity={0.65}
      >
        <View style={styles.fieldRow}>
          <View style={styles.fieldIconWrap}>{field.icon}</View>
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <Text style={[styles.fieldValue, !hasValue && styles.fieldValueEmpty]} numberOfLines={1}>
              {displayValue}
            </Text>
          </View>
          <View style={styles.editIconWrap}>
            <Pencil size={13} color="#94A3B8" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayDismiss} onPress={onClose} activeOpacity={1} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            {/* Drag handle */}
            <View style={styles.dragHandleWrap}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header with avatar */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerAvatar}>
                  <Text style={styles.headerAvatarText}>
                    {user?.name ? user.name[0].toUpperCase() : "U"}
                  </Text>
                </View>
                <View>
                  <Text style={styles.headerName}>{user?.name || "User"}</Text>
                  <Text style={styles.headerSub}>Tap any field to edit</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Fields */}
            <ScrollView
              style={styles.scrollArea}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.fieldsWrap}
            >
              {fields.map(renderField)}
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footerWrap}>
              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Save size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  overlayDismiss: {
    flex: 1,
  },
  keyboardView: {
    width: "100%",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
  },

  /* ── Header ── */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
  headerName: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ── Fields ── */
  scrollArea: {
    flexShrink: 1,
    maxHeight: 380,
  },
  fieldsWrap: {
    paddingVertical: 14,
    gap: 10,
  },
  fieldCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    overflow: "hidden",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  fieldIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 12,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  fieldValueEmpty: {
    color: "#CBD5E1",
    fontWeight: "500",
    fontStyle: "italic",
  },
  editIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  /* ── Active Editing State ── */
  fieldActiveHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 8,
  },
  fieldActiveIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
  },
  fieldActiveLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.colors.primary,
  },
  activeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
  },
  activeInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: THEME.colors.textPrimary,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  confirmBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },

  /* ── Footer ── */
  footerWrap: {
    paddingTop: 6,
    paddingBottom: 4,
  },
  saveBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
