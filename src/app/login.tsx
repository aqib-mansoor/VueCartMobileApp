import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../utils/api";
import { THEME } from "../constants/theme";
import { IMAGES } from "../constants/images";
import { API_ENDPOINTS } from "../constants/endpoints";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, Lock, Sparkles, CheckCircle2, Eye, EyeOff } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Input Focus states
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Validation error states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateEmail = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleLogin = async () => {
    setGlobalError(null);
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, { email, password });
      const data = await response.json();

      if (response.ok) {
        await login(data.access_token, data.user);
        setPassword("");
        router.replace("/home" as any);
      } else {
        if (response.status === 422) {
          if (data.errors) {
            setErrors(data.errors);
          } else {
            setGlobalError(data.message || "Validation failed.");
          }
        } else if (response.status === 401) {
          setGlobalError("Invalid credentials. Please try again.");
        } else {
          setGlobalError(data.message || "An unexpected error occurred.");
        }
      }
    } catch (err) {
      console.error(err);
      setGlobalError("Failed to connect to the authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Top Header Section with White Background & Logo */}
        <LinearGradient
          colors={["#b4aae9ff", "#cecbdcff"]}
          style={styles.headerBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.brandContainer}>
            <Image
              source={IMAGES.logo}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue your premium experience</Text>

          {globalError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{globalError}</Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View
              style={[
                styles.inputWrapper,
                emailFocused && styles.inputWrapperFocused,
                errors.email && styles.inputWrapperError,
              ]}
            >
              <Mail
                size={20}
                color={
                  errors.email
                    ? THEME.colors.error
                    : emailFocused
                    ? THEME.colors.primary
                    : THEME.colors.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="johndoe@example.com"
                placeholderTextColor={THEME.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                passwordFocused && styles.inputWrapperFocused,
                errors.password && styles.inputWrapperError,
              ]}
            >
              <Lock
                size={20}
                color={
                  errors.password
                    ? THEME.colors.error
                    : passwordFocused
                    ? THEME.colors.primary
                    : THEME.colors.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={THEME.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={20} color={THEME.colors.textMuted} />
                ) : (
                  <Eye size={20} color={THEME.colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Forgot Password Placeholder / Helper */}
          <TouchableOpacity style={styles.forgotPasswordContainer} activeOpacity={0.7}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login CTA Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? (
              <ActivityIndicator color={THEME.colors.textLight} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Log In</Text>
            )}
          </TouchableOpacity>


          {/* Tata Neu inspired Plus Membership / NeuPass Banner */}
          <View style={styles.plusContainer}>
            <View style={styles.plusHeader}>
              <Sparkles size={16} color={THEME.colors.secondary} />
              <Text style={styles.plusTitle}>CartVue Plus Benefits</Text>
            </View>
            <View style={styles.benefitRow}>
              <CheckCircle2 size={14} color={THEME.colors.success} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Get 5% NeuCoins equivalent cashback on orders</Text>
            </View>
            <View style={styles.benefitRow}>
              <CheckCircle2 size={14} color={THEME.colors.success} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Free Express Delivery on top brands</Text>
            </View>
          </View>

          {/* Footer Navigation */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{"Don't have an account? "}</Text>
            <TouchableOpacity onPress={() => router.push("/register" as any)}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerBackground: {
    paddingTop: Platform.OS === "ios" ? 70 : 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  brandContainer: {
    alignItems: "center",
  },
  brandLogo: {
    width: 220,
    height: 220,
  },
  card: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 24,
    marginHorizontal: THEME.spacing.lg,
    marginTop: -20,
    marginBottom: THEME.spacing.xxxl,
    padding: THEME.spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    marginBottom: THEME.spacing.xl,
  },
  errorBanner: {
    backgroundColor: THEME.colors.errorBg,
    borderWidth: 1,
    borderColor: THEME.colors.errorBorder,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  errorBannerText: {
    color: THEME.colors.error,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: THEME.spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    backgroundColor: THEME.colors.inputBg,
    paddingHorizontal: THEME.spacing.md,
  },
  inputWrapperFocused: {
    borderColor: THEME.colors.primary,
    backgroundColor: "#FFFFFF",
  },
  inputWrapperError: {
    borderColor: THEME.colors.error,
  },
  inputIcon: {
    marginRight: THEME.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 15,
    color: THEME.colors.textPrimary,
  },
  errorText: {
    color: THEME.colors.error,
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: THEME.spacing.lg,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: THEME.colors.primary,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: THEME.spacing.xl,
  },
  submitButtonText: {
    color: THEME.colors.textLight,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  plusContainer: {
    backgroundColor: "#FAF5FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    borderRadius: 16,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  plusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: THEME.spacing.sm,
  },
  plusTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5B21B6",
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  benefitIcon: {
    marginRight: 6,
  },
  benefitText: {
    fontSize: 11,
    color: "#6B21A8",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: THEME.spacing.md,
  },
  footerText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
});
