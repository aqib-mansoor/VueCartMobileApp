import { StyleSheet } from "react-native";
import { THEME } from "../constants/theme";

export const cartStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFF", borderBottomWidth: 1, borderColor: "#E2E8F0" },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "900", color: THEME.colors.textPrimary },
  headerBadge: { backgroundColor: THEME.colors.primary, borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center", marginLeft: 6 },
  headerBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "800" },
  clearText: { color: THEME.colors.error, fontWeight: "700", fontSize: 13 },

  listContent: { padding: 12, gap: 10, paddingBottom: 16 },

  deliveryBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F0FDF4", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#BBF7D0" },
  deliveryBannerText: { fontSize: 12, color: "#16A34A", fontWeight: "700", flex: 1 },

  itemCard: { backgroundColor: "#FFF", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#E2E8F0" },
  itemRow: { flexDirection: "row", padding: 12, gap: 12 },
  productImg: { width: 100, height: 100, borderRadius: 12, backgroundColor: "#F1F5F9" },
  itemInfo: { flex: 1, justifyContent: "center" },
  itemName: { fontSize: 14, fontWeight: "700", color: THEME.colors.textPrimary, lineHeight: 20 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  salePrice: { fontSize: 16, fontWeight: "900", color: THEME.colors.textPrimary },
  origPrice: { fontSize: 12, color: THEME.colors.textMuted, textDecorationLine: "line-through" },
  discBadge: { backgroundColor: "#FEF2F2", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discText: { fontSize: 10, color: THEME.colors.error, fontWeight: "800" },
  deliveryRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  deliveryText: { fontSize: 11, color: "#16A34A", fontWeight: "600" },

  actionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderColor: "#F1F5F9", paddingHorizontal: 12, paddingVertical: 8 },
  removeBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },
  removeBtnText: { fontSize: 12, color: THEME.colors.textSecondary, fontWeight: "600" },
  qtyRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  qtyBtn: { padding: 8 },
  qtyNum: { fontSize: 14, fontWeight: "800", color: THEME.colors.textPrimary, paddingHorizontal: 12, minWidth: 20, textAlign: "center" },

  couponCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: "#E2E8F0", gap: 8 },
  couponInput: { flex: 1, fontSize: 13, color: THEME.colors.textPrimary, paddingVertical: 10 },
  couponApplyBtn: { backgroundColor: THEME.colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  couponApplyText: { color: "#FFF", fontSize: 12, fontWeight: "800" },

  priceBreakdown: { backgroundColor: "#FFF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#E2E8F0" },
  breakdownTitle: { fontSize: 14, fontWeight: "900", color: THEME.colors.textPrimary, marginBottom: 10 },
  breakdownLine: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  breakdownLabel: { fontSize: 13, color: THEME.colors.textSecondary },
  breakdownVal: { fontSize: 13, fontWeight: "700", color: THEME.colors.textPrimary },
  breakdownTotal: { borderTopWidth: 1.5, borderColor: "#E2E8F0", paddingTop: 10, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 15, fontWeight: "900", color: THEME.colors.textPrimary },
  totalVal: { fontSize: 16, fontWeight: "900", color: THEME.colors.primary },

  trustRow: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#FFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  trustItem: { alignItems: "center", gap: 4 },
  trustText: { fontSize: 10, color: THEME.colors.textSecondary, fontWeight: "700" },

  footerBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FFF", paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderColor: "#E2E8F0" },
  footerTotal: { fontSize: 18, fontWeight: "900", color: THEME.colors.textPrimary },
  footerSaved: { fontSize: 11, color: "#16A34A", fontWeight: "700" },
  checkoutBtn: { backgroundColor: THEME.colors.primary, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24, flexDirection: "row", alignItems: "center" },
  checkoutText: { color: "#FFF", fontSize: 15, fontWeight: "800" },

  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  emptyIcon: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#F3E8FF", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: "900", color: THEME.colors.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: 13, color: THEME.colors.textSecondary, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  shopBtn: { backgroundColor: THEME.colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, flexDirection: "row", alignItems: "center" },
  shopBtnText: { color: "#FFF", fontWeight: "800", fontSize: 15 },

  skelCard: { flexDirection: "row", backgroundColor: "#FFF", borderRadius: 16, padding: 12, gap: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  skelImg: { width: 80, height: 80, borderRadius: 12, backgroundColor: "#E2E8F0" },
  skelInfo: { flex: 1, gap: 8 },
  skelLine: { width: "80%", height: 12, backgroundColor: "#E2E8F0", borderRadius: 6 },
});
