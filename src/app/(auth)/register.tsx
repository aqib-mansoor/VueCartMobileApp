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
import { apiClient } from "../../utils/api";
import { THEME } from "../../constants/theme";
import { IMAGES } from "../../constants/images";
import { API_ENDPOINTS } from "../../constants/endpoints";
import { LinearGradient } from "expo-linear-gradient";
import { User, Mail, ShieldCheck, Lock, Sparkles, CheckCircle2, Eye, EyeOff } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch } from "../../redux/store";
import { login as loginAction } from "../../redux/action";
import { ROUTES } from "../../constants/routes";

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Input Focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [ageFocused, setAgeFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Validation error states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateEmail = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleRegister = async () => {
    setGlobalError(null);
    const newErrors: { [key: string]: string } = {};

    // Validate Name
    if (!name) {
      newErrors.name = "Name is required";
    }

    // Validate Email
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Validate Age
    const parsedAge = parseInt(age, 10);
    if (!age) {
      newErrors.age = "Age is required";
    } else if (isNaN(parsedAge) || parsedAge < 18 || parsedAge > 100) {
      newErrors.age = "Age must be an integer between 18 and 100";
    }

    // Validate Password
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Validate Confirm Password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await apiClient.post(API_ENDPOINTS.REGISTER, {
        name,
        email,
        age: parsedAge,
        password,
      });
      const data = await response.json();

      if (response.ok) {
        await dispatch(loginAction(data.access_token, data.user));
        setPassword("");
        setConfirmPassword("");
        router.replace(ROUTES.HOME as any);
      } else {
        if (response.status === 422) {
          if (data.errors) {
            setErrors(data.errors);
          } else {
            setGlobalError(data.message || "Validation failed.");
          }
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Register a new profile to unlock exclusive member privileges</Text>

          {globalError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{globalError}</Text>
            </View>
          )}

          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View
              style={[
                styles.inputWrapper,
                nameFocused && styles.inputWrapperFocused,
                errors.name && styles.inputWrapperError,
              ]}
            >
              <User
                size={20}
                color={
                  errors.name
                    ? THEME.colors.error
                    : nameFocused
                    ? THEME.colors.primary
                    : THEME.colors.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={THEME.colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

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

          {/* Age Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <View
              style={[
                styles.inputWrapper,
                ageFocused && styles.inputWrapperFocused,
                errors.age && styles.inputWrapperError,
              ]}
            >
              <ShieldCheck
                size={20}
                color={
                  errors.age
                    ? THEME.colors.error
                    : ageFocused
                    ? THEME.colors.primary
                    : THEME.colors.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="25"
                placeholderTextColor={THEME.colors.textMuted}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                onFocus={() => setAgeFocused(true)}
                onBlur={() => setAgeFocused(false)}
              />
            </View>
            {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
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

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View
              style={[
                styles.inputWrapper,
                confirmPasswordFocused && styles.inputWrapperFocused,
                errors.confirmPassword && styles.inputWrapperError,
              ]}
            >
              <Lock
                size={20}
                color={
                  errors.confirmPassword
                    ? THEME.colors.error
                    : confirmPasswordFocused
                    ? THEME.colors.primary
                    : THEME.colors.textMuted
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={THEME.colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={THEME.colors.textMuted} />
                ) : (
                  <Eye size={20} color={THEME.colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          {/* Register CTA Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? (
              <ActivityIndicator color={THEME.colors.textLight} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Tata Neu inspired Loyalty benefits card */}
          <View style={styles.plusContainer}>
            <View style={styles.plusHeader}>
              <Sparkles size={16} color={THEME.colors.secondary} />
              <Text style={styles.plusTitle}>Instant CartVue Plus Membership</Text>
            </View>
            <View style={styles.benefitRow}>
              <CheckCircle2 size={14} color={THEME.colors.success} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Earn & Redeem rewards across all catalogs</Text>
            </View>
            <View style={styles.benefitRow}>
              <CheckCircle2 size={14} color={THEME.colors.success} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Exclusive member offers & early sale access</Text>
            </View>
          </View>

          {/* Footer Navigation */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push(ROUTES.LOGIN as any)}>
              <Text style={styles.footerLink}>Log In</Text>
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
    marginBottom: THEME.spacing.lg,
    marginTop: THEME.spacing.sm,
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
