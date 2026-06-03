import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";

function RootLayoutNavigation() {
  const { authToken, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "register";

    if (authToken) {
      // If logged in, redirect away from auth screens to catalog home
      if (inAuthGroup || !segments[0]) {
        router.replace("/home" as any);
      }
    } else {
      // If not logged in and trying to access home, redirect to login
      if (segments[0] === "home") {
        router.replace("/login" as any);
      }
    }
  }, [authToken, isLoading, segments, router]);

  return <Stack />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNavigation />
    </AuthProvider>
  );
}
