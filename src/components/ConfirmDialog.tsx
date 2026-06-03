import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { StyleSheet, View, Text, Modal, TouchableOpacity, Animated, ActivityIndicator } from "react-native";
import { AlertCircle, HelpCircle, LogOut, Trash2, CheckCircle2, ShieldAlert } from "lucide-react-native";
import { THEME } from "../constants/theme";

interface ConfirmConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "default" | "danger" | "warning" | "success" | "info";
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmContextType {
  showConfirm: (config: ConfirmConfig) => void;
}

const ConfirmContext = createContext<ConfirmContextType>({ showConfirm: () => {} });

export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ConfirmConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const showConfirm = useCallback((newConfig: ConfirmConfig) => {
    setConfig(newConfig);
    setVisible(true);
    setLoading(false);

    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  const handleCancel = () => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 0.9, duration: 150, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      if (config?.onCancel) config.onCancel();
      setConfig(null);
    });
  };

  const handleConfirm = async () => {
    if (!config) return;
    setLoading(true);
    try {
      await config.onConfirm();
    } catch (e) {
      console.error(e);
    } finally {
      Animated.parallel([
        Animated.timing(scale, { toValue: 0.9, duration: 150, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start(() => {
        setVisible(false);
        setLoading(false);
        setConfig(null);
      });
    }
  };

  // Select icons based on action type
  const getIcon = () => {
    if (!config) return null;
    const size = 28;
    switch (config.type) {
      case "danger":
        if (config.title.toLowerCase().includes("logout") || config.title.toLowerCase().includes("sign out")) {
          return <LogOut size={size} color="#EF4444" />;
        }
        return <Trash2 size={size} color="#EF4444" />;
      case "warning":
        return <ShieldAlert size={size} color="#F59E0B" />;
      case "success":
        return <CheckCircle2 size={size} color="#10B981" />;
      case "info":
        return <AlertCircle size={size} color="#3B82F6" />;
      default:
        return <HelpCircle size={size} color={THEME.colors.primary} />;
    }
  };

  const getColors = () => {
    if (!config) return { iconBg: "#F1F5F9", buttonBg: THEME.colors.primary };
    switch (config.type) {
      case "danger":
        return { iconBg: "#FEF2F2", buttonBg: "#EF4444" };
      case "warning":
        return { iconBg: "#FFFBEB", buttonBg: "#F59E0B" };
      case "success":
        return { iconBg: "#F0FDF4", buttonBg: "#10B981" };
      case "info":
        return { iconBg: "#EFF6FF", buttonBg: "#3B82F6" };
      default:
        return { iconBg: "#F8FAFC", buttonBg: THEME.colors.primary };
    }
  };

  const colors = getColors();

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={handleCancel}
      >
        <View style={styles.overlay}>
          <Animated.View style={[styles.backdrop, { opacity }]} pointerEvents="none" />
          
          <Animated.View
            style={[
              styles.dialogContainer,
              {
                transform: [{ scale }],
                opacity,
              },
            ]}
          >
            {config && (
              <>
                <View style={[styles.iconWrapper, { backgroundColor: colors.iconBg }]}>
                  {getIcon()}
                </View>

                <Text style={styles.title}>{config.title}</Text>
                <Text style={styles.message}>{config.message}</Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelText}>{config.cancelText || "Cancel"}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.confirmButton, { backgroundColor: colors.buttonBg }]}
                    onPress={handleConfirm}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.confirmText}>{config.confirmText || "Confirm"}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </ConfirmContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  dialogContainer: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  confirmText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
