/**
 * CartVue Design Theme Tokens Config
 * 
 * Modifying this file will update the UI styles, colors, and layout configurations
 * across the entire application instantly.
 */

export const COLORS = {
  // BRAND COLORS (extracted from the CartVue logo)
  primary: "#7C3AED",       // Primary Logo Purple (used for active buttons, accents, highlights)
  secondary: "#F97316",     // Secondary Logo Tag Orange (used for special badges, notifications, secondary accents)
  
  // TYPOGRAPHY / TEXT
  textPrimary: "#0F172A",   // Slate-900 (main headers, body copy)
  textSecondary: "#64748B", // Slate-500 (labels, descriptions, secondary text)
  textMuted: "#94A3B8",     // Slate-400 (disabled state text, placeholder helper)
  textLight: "#FFFFFF",     // White text for high contrast backgrounds
  
  // STATE COLORS
  error: "#EF4444",         // Red-500 (validation errors, warnings)
  errorBg: "#FEF2F2",       // Red-50 (error banner backgrounds)
  errorBorder: "#FCA5A5",   // Red-200 (error banner borders)
  success: "#10B981",       // Emerald-500 (success alerts)
  
  // BACKGROUNDS & CARDS
  background: "#F8FAFC",    // Slate-50 (Option A Modern Light Screen background)
  cardBackground: "#FFFFFF",// Plain white for forms, cards, list items
  inputBg: "#F8FAFC",       // Background for text inputs
  
  // BORDERS
  border: "#E2E8F0",        // Slate-200 (standard border style)
  borderFocus: "#7C3AED",   // Focus input highlight matching primary
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const THEME = {
  colors: COLORS,
  spacing: SPACING,
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
};
