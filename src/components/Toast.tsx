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

const TOAST_COLORS: Record<ToastType, { accent: string; iconBg: string }> = {
  success: { accent: "#10B981", iconBg: "rgba(16, 185, 129, 0.15)" },
  error: { accent: "#EF4444", iconBg: "rgba(239, 68, 68, 0.15)" },
  warning: { accent: "#F59E0B", iconBg: "rgba(245, 158, 11, 0.15)" },
  info: { accent: "#3B82F6", iconBg: "rgba(59, 130, 246, 0.15)" },
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
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(translateY, { toValue: -100, duration: 250, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.9, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [translateY, scale, opacity]);

  const showToast = useCallback((config: ToastConfig) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(config);

    translateY.setValue(-50);
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
                borderLeftColor: colors.accent,
                transform: [{ translateY }, { scale }],
                opacity,
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.iconBg }]}>
              <Icon size={16} color={colors.accent} strokeWidth={3} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.toastMessage} numberOfLines={2}>
                {toast.message}
              </Text>
            </View>
            <View style={styles.closeBtn}>
              <X size={14} color="#94A3B8" strokeWidth={2.5} />
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
    top: 56,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B", // Dark slate background
    borderLeftWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 12,
    elevation: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  toastMessage: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
  },
});
