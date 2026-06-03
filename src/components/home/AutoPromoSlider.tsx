import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, FlatList, Dimensions, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, ShoppingBag, Truck } from "lucide-react-native";
import { THEME } from "../../constants/theme";

const { width } = Dimensions.get("window");
const CAROUSEL_WIDTH = width - THEME.spacing.lg * 2;

type PromoItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  tag: string;
  icon: React.ReactNode;
};

const PROMO_DATA: PromoItem[] = [
  {
    id: "1",
    title: "Earn 5% NeuCoins",
    subtitle: "Cashback rewards across all luxury catalogs",
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop",
    tag: "LOYALTY PASS",
    icon: <Sparkles size={14} color="#FFFFFF" />,
  },
  {
    id: "2",
    title: "Super Saver Tech",
    subtitle: "Up to 40% discount on premium electronics & devices",
    imageUrl: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=600&auto=format&fit=crop",
    tag: "TECH SPOTLIGHT",
    icon: <ShoppingBag size={14} color="#FFFFFF" />,
  },
  {
    id: "3",
    title: "Zero Delivery Fees",
    subtitle: "Free express delivery on standard catalog orders above $50",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop",
    tag: "EXPRESS DISPATCH",
    icon: <Truck size={14} color="#FFFFFF" />,
  },
];

export const AutoPromoSlider: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<PromoItem>>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= PROMO_DATA.length) {
        nextIndex = 0;
      }
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const renderItem = ({ item }: { item: PromoItem }) => (
    <View style={styles.cardContainer}>
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(15, 23, 42, 0.2)", "rgba(15, 23, 42, 0.8)"]}
          style={styles.gradientOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.badgeRow}>
            <View style={styles.tagBadge}>
              {item.icon}
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={PROMO_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const contentOffset = e.nativeEvent.contentOffset.x;
          const index = Math.round(contentOffset / CAROUSEL_WIDTH);
          setActiveIndex(index);
        }}
        snapToInterval={CAROUSEL_WIDTH + THEME.spacing.lg}
        decelerationRate="fast"
      />
      {/* Slide Indicators */}
      <View style={styles.indicatorRow}>
        {PROMO_DATA.map((_, i) => (
          <View
            key={i}
            style={[
              styles.indicatorDot,
              activeIndex === i && styles.indicatorDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.lg,
    alignItems: "center",
  },
  cardContainer: {
    width: CAROUSEL_WIDTH,
    marginRight: THEME.spacing.lg,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  imageBackground: {
    width: "100%",
    height: 120,
    justifyContent: "flex-end",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: THEME.spacing.md,
    justifyContent: "space-between",
  },
  badgeRow: {
    flexDirection: "row",
  },
  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.secondary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  textContainer: {
    gap: 2,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 11,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  indicatorRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: THEME.spacing.md,
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(124, 58, 237, 0.2)",
  },
  indicatorDotActive: {
    width: 18,
    backgroundColor: "#7C3AED",
  },
});
