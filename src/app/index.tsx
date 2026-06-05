import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, Animated } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter } from "expo-router";
import { IMAGES } from "../constants/images";
import { ROUTES } from "../constants/routes";

export default function SplashScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(0.95));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Redirect to the auth screen after 3 seconds
    const timer = setTimeout(() => {
      router.replace(ROUTES.LOGIN as any);
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, router]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <Image
          source={IMAGES.logo}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 280,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
});
