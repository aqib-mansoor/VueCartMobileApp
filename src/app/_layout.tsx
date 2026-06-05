import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ToastProvider } from "../components/ui/Toast";
import { ConfirmProvider } from "../components/ui/ConfirmDialog";
import { Provider } from "react-redux";
import { store, useAppDispatch, useAppSelector } from "../redux/store";
import { loadAuth } from "../redux/action";
import { ROUTES } from "../constants/routes";

function RootLayoutNavigation() {
  const dispatch = useAppDispatch();
  const { authToken, isLoading } = useAppSelector((state) => state.auth);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    dispatch(loadAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "register";

    if (authToken) {
      // If logged in, redirect away from auth screens to catalog home
      if (inAuthGroup || !segments[0]) {
        router.replace(ROUTES.HOME as any);
      }
    } else {
      // If not logged in and trying to access protected screens, redirect to login
      const isProtected = ["home", "cart", "checkout", "orders", "profile"].includes(segments[0] || "");
      if (isProtected) {
        router.replace(ROUTES.LOGIN as any);
      }
    }
  }, [authToken, isLoading, segments, router]);

  return <Stack />;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <ConfirmProvider>
          <RootLayoutNavigation />
        </ConfirmProvider>
      </ToastProvider>
    </Provider>
  );
}
