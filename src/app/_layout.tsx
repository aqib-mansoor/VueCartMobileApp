import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ToastProvider } from "../components/Toast";
import { ConfirmProvider } from "../components/ConfirmDialog";

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
      // If not logged in and trying to access protected screens, redirect to login
      const isProtected = ["home", "cart", "checkout", "orders", "profile"].includes(segments[0] || "");
      if (isProtected) {
        router.replace("/login" as any);
      }
    }
  }, [authToken, isLoading, segments, router]);

  return <Stack />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <RootLayoutNavigation />
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
