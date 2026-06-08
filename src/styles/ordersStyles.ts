import { StyleSheet } from "react-native";
import { THEME } from "../constants/theme";

export const ordersStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FA" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#FFF", borderBottomWidth: 1, borderColor: "#EEF2F6" },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: THEME.colors.textPrimary },

  // Search
  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6, backgroundColor: "#FFF" },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  searchInput: { flex: 1, fontSize: 13, color: THEME.colors.textPrimary, fontWeight: "500" },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderColor: "#EEF2F6",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    position: "relative",
  },
  tabItemActive: {},
  tabTextWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textSecondary,
  },
  tabItemTextActive: {
    color: THEME.colors.primary,
    fontWeight: "900",
  },
  tabItemBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: "center",
  },
  tabItemBadgeActive: {
    backgroundColor: THEME.colors.primary + "15",
  },
  tabItemBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: THEME.colors.textSecondary,
  },
  tabItemBadgeTextActive: {
    color: THEME.colors.primary,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: 3,
    backgroundColor: THEME.colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  // Empty state
  emptyCont: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: THEME.colors.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: 13, color: THEME.colors.textSecondary, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  shopNowBtn: { flexDirection: "row", alignItems: "center", backgroundColor: THEME.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  shopNowText: { color: "#FFF", fontWeight: "800", fontSize: 14 },

  listContent: { padding: 14, gap: 14, paddingBottom: 36 },
});
