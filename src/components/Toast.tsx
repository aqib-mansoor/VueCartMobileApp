import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { StyleSheet, View, Text, Animated, Dimensions } from "react-native";
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

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: "#F0FDF4", border: "#4ADE80", icon: "#16A34A" },
  error: { bg: "#FEF2F2", border: "#F87171", icon: "#DC2626" },
  warning: { bg: "#FFFBEB", border: "#FBBF24", icon: "#D97706" },
  info: { bg: "#EFF6FF", border: "#60A5FA", icon: "#2563EB" },
};

const TOAST_ICONS: Record<ToastType, any> = {
  success: Check,
  error: X,
  warning: AlertTriangle,
  info: Info,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((config: ToastConfig) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(config);

    translateY.setValue(-100);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();

    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => setToast(null));
    }, config.duration || 2500);
  }, []);

  const Icon = toast ? TOAST_ICONS[toast.type] : null;
  const colors = toast ? TOAST_COLORS[toast.type] : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && colors && Icon && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              backgroundColor: colors.bg,
              borderColor: colors.border,
              transform: [{ translateY }],
              opacity,
            },
          ]}
          pointerEvents="none"
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.border + "30" }]}>
            <Icon size={16} color={colors.icon} strokeWidth={3} />
          </View>
          <Text style={[styles.toastMessage, { color: colors.icon }]} numberOfLines={2}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 56,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
    zIndex: 9999,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  toastMessage: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
});
