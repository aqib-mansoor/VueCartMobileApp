import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { StyleSheet, View, Text, Animated, TouchableOpacity, Dimensions } from "react-native";
import { Check, AlertTriangle, X, Info } from "lucide-react-native";

const { width } = Dimensions.get("window");

type ToastType = "success" | "error" | "warning" | "info";

type ToastConfig = {
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextType = {
  showToast: (config: ToastConfig) => void;
};

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const TOAST_COLORS: Record<ToastType, { accent: string; iconBg: string; bg: string; text: string }> = {
  success: { accent: "#10B981", iconBg: "#E6F4EA", bg: "#F0FDF4", text: "#15803D" },
  error: { accent: "#EF4444", iconBg: "#FCE8E6", bg: "#FEF2F2", text: "#B91C1C" },
  warning: { accent: "#F59E0B", iconBg: "#FEF3D6", bg: "#FFFBEB", text: "#B45309" },
  info: { accent: "#3B82F6", iconBg: "#E8F0FE", bg: "#EFF6FF", text: "#1D4ED8" },
};

const TOAST_ICONS: Record<ToastType, any> = {
  success: Check,
  error: X,
  warning: AlertTriangle,
  info: Info,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const translateY = useRef(new Animated.Value(100)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(translateY, { toValue: 100, duration: 250, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.9, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [translateY, scale, opacity]);

  const showToast = useCallback((config: ToastConfig) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(config);

    translateY.setValue(50);
    scale.setValue(0.9);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 70, friction: 10 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 70, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    timerRef.current = setTimeout(() => {
      dismissToast();
    }, config.duration || 3000);
  }, [dismissToast, translateY, scale, opacity]);

  const Icon = toast ? TOAST_ICONS[toast.type] : null;
  const colors = toast ? TOAST_COLORS[toast.type] : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && colors && Icon && (
        <TouchableOpacity
          style={styles.touchableWrapper}
          onPress={dismissToast}
          activeOpacity={0.9}
        >
          <Animated.View
            style={[
              styles.toastContainer,
              {
                backgroundColor: colors.bg,
                borderColor: colors.iconBg,
                transform: [{ translateY }, { scale }],
                opacity,
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.iconBg }]}>
              <Icon size={14} color={colors.accent} strokeWidth={3} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.toastMessage, { color: colors.text }]} numberOfLines={2}>
                {toast.message}
              </Text>
            </View>
            <View style={styles.closeBtn}>
              <X size={12} color={colors.accent} strokeWidth={2.5} />
            </View>
          </Animated.View>
        </TouchableOpacity>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  touchableWrapper: {
    position: "absolute",
    bottom: 90,
    right: 16,
    zIndex: 9999,
  },
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 10,
    maxWidth: width - 32,
    elevation: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flexShrink: 1,
  },
  toastMessage: {
    fontSize: 12.5,
    fontWeight: "700",
    lineHeight: 17,
  },
  closeBtn: {
    padding: 2,
  },
});
