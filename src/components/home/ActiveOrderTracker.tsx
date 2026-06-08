import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, DimensionValue, Animated } from "react-native";
import { ChevronRight, Clock, MapPin, Truck, ShoppingBag } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { formatOrderNumber } from "../../utils/orderUtils";

type ActiveOrderTrackerProps = {
  order: {
    id: number;
    status: string;
    created_at: string;
    shipping_address?: string;
  } | null;
  onPress: () => void;
};

export const ActiveOrderTracker: React.FC<ActiveOrderTrackerProps> = ({ order, onPress }) => {
  // Animation values - must be declared unconditionally at the top
  const slideAnim = useRef(new Animated.Value(120)).current; 
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!order) return;

    // Slide up + Fade in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse loop for status icon circle
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [order?.id, order?.status]);

  if (!order) return null;

  const status = order.status.toLowerCase();
  
  // Custom text/progress configs based on status
  let title = "Order Placed";
  let description = "Waiting for store confirmation...";
  let progressWidth: DimensionValue = "25%";
  let IconComponent = Clock;
  let iconColor = THEME.colors.primary;

  if (status === "processing") {
    title = "Preparing your order";
    description = "Chef is packing your items...";
    progressWidth = "50%";
    IconComponent = ShoppingBag;
    iconColor = "#F59E0B"; // amber
  } else if (status === "shipped") {
    title = "Order is on the way!";
    description = "Valet is delivering your order...";
    progressWidth = "75%";
    IconComponent = Truck;
    iconColor = "#10B981"; // emerald
  }

  return (
    <Animated.View
      style={[
        s.trackerCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
        <View style={s.contentRow}>
          <Animated.View
            style={[
              s.iconCircle,
              {
                backgroundColor: iconColor + "15",
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <IconComponent size={20} color={iconColor} />
          </Animated.View>
          <View style={s.infoColumn}>
            <View style={s.titleRow}>
              <Text style={s.trackerTitle}>{title}</Text>
              <Text style={s.orderNumText}>{formatOrderNumber(order.id)}</Text>
            </View>
            <Text style={s.trackerDesc}>{description}</Text>
          </View>
          <ChevronRight size={18} color={THEME.colors.textMuted} />
        </View>
        {/* Bottom Progress Line */}
        <View style={s.progressTrack}>
          <View style={[s.progressBar, { width: progressWidth, backgroundColor: iconColor }]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  trackerCard: {
    position: "absolute",
    bottom: 75,
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  infoColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  trackerTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: THEME.colors.textPrimary,
  },
  orderNumText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.colors.textSecondary,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trackerDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#F1F5F9",
    width: "100%",
  },
  progressBar: {
    height: "100%",
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
});
