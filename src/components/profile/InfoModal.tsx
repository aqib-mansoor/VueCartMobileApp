import React from "react";
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Animated } from "react-native";
import { X, Shield, FileText, HelpCircle, Info } from "lucide-react-native";
import { THEME } from "../../constants/theme";

export type InfoModalType = "privacy" | "terms" | "support" | "about" | null;

interface InfoModalProps {
  type: InfoModalType;
  visible: boolean;
  onClose: () => void;
}

export function InfoModal({ type, visible, onClose }: InfoModalProps) {
  if (!type) return null;

  const getHeader = () => {
    switch (type) {
      case "privacy":
        return {
          title: "Privacy Policy",
          icon: <Shield size={24} color={THEME.colors.primary} />,
        };
      case "terms":
        return {
          title: "Terms of Service",
          icon: <FileText size={24} color={THEME.colors.primary} />,
        };
      case "support":
        return {
          title: "Help & Support",
          icon: <HelpCircle size={24} color={THEME.colors.primary} />,
        };
      case "about":
        return {
          title: "About Us",
          icon: <Info size={24} color={THEME.colors.primary} />,
        };
    }
  };

  const header = getHeader();

  const renderContent = () => {
    switch (type) {
      case "privacy":
        return (
          <View style={styles.textBlock}>
            <Text style={styles.subtitle}>1. Information We Collect</Text>
            <Text style={styles.paragraph}>
              We collect information you provide directly to us when you create an account, update your profile, place an order, or contact customer support. This may include your name, email address, shipping address, and order history.
            </Text>
            <Text style={styles.subtitle}>2. How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              We use your information to process transactions, manage accounts, improve our services, send promotional communications, and prevent fraudulent activities.
            </Text>
            <Text style={styles.subtitle}>3. Data Security & Storage</Text>
            <Text style={styles.paragraph}>
              Your security is our priority. We implement industry-standard encryption protocols to protect your personal details. We do not sell or lease your personal information to third parties.
            </Text>
            <Text style={styles.subtitle}>4. Cookies and Tracking</Text>
            <Text style={styles.paragraph}>
              We use session cookies and local data persistence mechanisms to keep you logged in and preserve your shopping cart state.
            </Text>
          </View>
        );
      case "terms":
        return (
          <View style={styles.textBlock}>
            <Text style={styles.subtitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing and using this e-commerce application, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the application.
            </Text>
            <Text style={styles.subtitle}>2. Account Registration</Text>
            <Text style={styles.paragraph}>
              You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account credentials.
            </Text>
            <Text style={styles.subtitle}>3. Purchases and Pricing</Text>
            <Text style={styles.paragraph}>
              All prices are listed in USD. We reserve the right to change prices, cancel orders, or refuse service at any time due to product availability, listing errors, or suspected fraud.
            </Text>
            <Text style={styles.subtitle}>4. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              We are not liable for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use this e-commerce platform.
            </Text>
          </View>
        );
      case "support":
        return (
          <View style={styles.textBlock}>
            <Text style={styles.subtitle}>Frequently Asked Questions</Text>
            <Text style={styles.faqQuestion}>Q: How long does shipping take?</Text>
            <Text style={styles.faqAnswer}>A: Standard shipping takes 3-5 business days. Express shipping is completed in 1-2 business days.</Text>
            
            <Text style={styles.faqQuestion}>Q: Can I return an item?</Text>
            <Text style={styles.faqAnswer}>A: Yes, we accept returns within 30 days of purchase. The items must be unused and in their original packaging.</Text>
            
            <Text style={styles.faqQuestion}>Q: How do I track my order?</Text>
            <Text style={styles.faqAnswer}>A: You can track your order status in real time on the Order History tab in your profile menu.</Text>

            <Text style={styles.subtitle}>Contact Customer Support</Text>
            <Text style={styles.paragraph}>
              Have more questions? Reach out to our dedicated support team. We generally respond to queries within 24 hours.
            </Text>
            <View style={styles.contactCard}>
              <Text style={styles.contactLabel}>Email:</Text>
              <Text style={styles.contactValue}>support@ecommerce.com</Text>
              <Text style={styles.contactLabel}>Phone:</Text>
              <Text style={styles.contactValue}>+1 (800) 555-0199</Text>
            </View>
          </View>
        );
      case "about":
        return (
          <View style={styles.textBlock}>
            <Text style={styles.subtitle}>Our Mission</Text>
            <Text style={styles.paragraph}>
              We strive to deliver the ultimate shopping experience by providing premium products, competitive pricing, and outstanding customer service.
            </Text>
            
            <Text style={styles.subtitle}>Application Details</Text>
            <View style={styles.contactCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>App Version:</Text>
                <Text style={styles.infoVal}>1.0.0 (Expo v56)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Build Target:</Text>
                <Text style={styles.infoVal}>Android & iOS Mobile App</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Tech Stack:</Text>
                <Text style={styles.infoVal}>React Native, TypeScript, Redux</Text>
              </View>
            </View>
            
            <Text style={styles.paragraph}>
              © 2026 E-commerce Inc. All rights reserved.
            </Text>
          </View>
        );
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              {header?.icon}
              <Text style={styles.title}>{header?.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {renderContent()}
          </ScrollView>

          {/* Action button */}
          <TouchableOpacity onPress={onClose} style={styles.doneButton} activeOpacity={0.8}>
            <Text style={styles.doneButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialogContainer: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    elevation: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 16,
    marginBottom: 16,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  closeButton: {
    padding: 4,
  },
  scroll: {
    flexShrink: 1,
  },
  textBlock: {
    paddingBottom: 16,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 12,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paragraph: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 8,
  },
  faqAnswer: {
    fontSize: 12.5,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 8,
    paddingLeft: 6,
  },
  contactCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginVertical: 10,
    gap: 4,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
  },
  contactValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoKey: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  infoVal: {
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "700",
  },
  doneButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
