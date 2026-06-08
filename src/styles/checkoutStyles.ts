import { StyleSheet } from "react-native";
import { THEME } from "../constants/theme";

export const checkoutStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFF", borderBottomWidth: 1, borderColor: "#E2E8F0" },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "900", color: THEME.colors.textPrimary },

  // Steps
  stepsBar: { flexDirection: "row", alignItems: "flex-start", justifyContent: "center", backgroundColor: "#FFF", paddingVertical: 14, paddingHorizontal: 32, borderBottomWidth: 1, borderColor: "#E2E8F0" },
  stepCol: { alignItems: "center" },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#E2E8F0", justifyContent: "center", alignItems: "center" },
  stepDone: { backgroundColor: "#16A34A" },
  stepActive: { backgroundColor: THEME.colors.primary },
  stepNum: { fontSize: 12, fontWeight: "800", color: THEME.colors.textSecondary },
  stepNumActive: { color: "#FFF" },
  stepLabel: { fontSize: 10, fontWeight: "700", color: THEME.colors.textMuted, marginTop: 4 },
  stepLabelDone: { color: "#16A34A" },
  stepLabelActive: { color: THEME.colors.primary },
  stepConn: { flex: 1, height: 2, backgroundColor: "#E2E8F0", marginTop: 13, marginHorizontal: 4 },
  stepConnDone: { backgroundColor: "#16A34A" },

  loadingCont: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, color: THEME.colors.textSecondary, fontWeight: "600" },
  scrollContent: { padding: 12, gap: 10, paddingBottom: 16 },

  // Cards
  card: { backgroundColor: "#FFF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#E2E8F0" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: "900", color: THEME.colors.textPrimary },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addBtnText: { color: THEME.colors.primary, fontWeight: "800", fontSize: 13 },

  // Address Form
  formBox: { backgroundColor: "#F8FAFC", borderRadius: 12, padding: 12, gap: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  input: { backgroundColor: "#FFF", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: THEME.colors.textPrimary },
  inputRow: { flexDirection: "row" },
  formBtns: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 4 },
  cancelText: { color: THEME.colors.textSecondary, fontWeight: "700", fontSize: 13, paddingVertical: 8 },
  saveBtn: { backgroundColor: THEME.colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  saveBtnText: { color: "#FFF", fontWeight: "800", fontSize: 13 },
  emptyAddr: { alignItems: "center", paddingVertical: 20, gap: 4 },
  emptyAddrText: { fontSize: 13, fontWeight: "700", color: THEME.colors.textSecondary },
  emptyAddrHint: { fontSize: 11, color: THEME.colors.textMuted },

  // Address Cards
  addrCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: "#E2E8F0", marginBottom: 8, gap: 10 },
  addrCardSel: { borderColor: THEME.colors.primary, backgroundColor: "#FAF5FF" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#CBD5E1", justifyContent: "center", alignItems: "center" },
  radioSel: { borderColor: THEME.colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: THEME.colors.primary },
  addrStreet: { fontSize: 13, fontWeight: "800", color: THEME.colors.textPrimary },
  addrSub: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 2 },
  deliverBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: THEME.colors.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  deliverBadgeText: { color: "#FFF", fontSize: 9, fontWeight: "800" },

  // Order Items
  orderItemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: "#F1F5F9" },
  orderItemImg: { width: 64, height: 64, borderRadius: 10, backgroundColor: "#F1F5F9" },
  orderItemName: { fontSize: 13, fontWeight: "700", color: THEME.colors.textPrimary, lineHeight: 18 },
  orderItemMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  orderItemQty: { fontSize: 11, color: THEME.colors.textSecondary, fontWeight: "600" },
  deliveryChip: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#F0FDF4", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  deliveryChipText: { fontSize: 9, color: "#16A34A", fontWeight: "800" },
  orderItemPrice: { fontSize: 14, fontWeight: "900", color: THEME.colors.textPrimary },

  // Payment
  paymentCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FAF5FF", borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: THEME.colors.primary },
  paymentIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#F3E8FF", justifyContent: "center", alignItems: "center" },
  paymentName: { fontSize: 13, fontWeight: "800", color: THEME.colors.textPrimary },
  paymentDesc: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 1 },

  // Price Breakdown
  priceLine: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  priceLabel: { fontSize: 13, color: THEME.colors.textSecondary },
  priceVal: { fontSize: 13, fontWeight: "700", color: THEME.colors.textPrimary },
  priceTotalLine: { borderTopWidth: 1.5, borderColor: "#E2E8F0", paddingTop: 10, marginTop: 4, marginBottom: 0 },
  priceTotalLabel: { fontSize: 15, fontWeight: "900", color: THEME.colors.textPrimary },
  priceTotalVal: { fontSize: 16, fontWeight: "900", color: THEME.colors.primary },

  // Trust
  trustRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F0FDF4", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#BBF7D0" },
  trustText: { fontSize: 11, color: "#16A34A", fontWeight: "600", flex: 1 },

  // Footer
  footerBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FFF", paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderColor: "#E2E8F0" },
  footerTotal: { fontSize: 18, fontWeight: "900", color: THEME.colors.textPrimary },
  footerSaved: { fontSize: 11, color: "#16A34A", fontWeight: "700", marginTop: 1 },
  placeBtn: { backgroundColor: THEME.colors.primary, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 22, flexDirection: "row", alignItems: "center" },
  placeBtnOff: { backgroundColor: "#CBD5E1" },
  placeBtnText: { color: "#FFF", fontSize: 15, fontWeight: "800" },

  // ─── SUCCESS ───
  successContainer: { flex: 1, backgroundColor: "#F1F5F9" },
  successScroll: { padding: 20, alignItems: "center", paddingTop: 36 },

  successRings: { alignItems: "center", justifyContent: "center", width: 140, height: 140, marginBottom: 16 },
  ringOuter: { position: "absolute", width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: "#BBF7D0" },
  ringMiddle: { position: "absolute", width: 115, height: 115, borderRadius: 57.5, borderWidth: 2, borderColor: "#86EFAC" },
  successCheckCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#16A34A", justifyContent: "center", alignItems: "center", shadowColor: "#16A34A", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 12 },

  successEmoji: { fontSize: 28, marginBottom: 4 },
  successTitle: { fontSize: 22, fontWeight: "900", color: THEME.colors.textPrimary, textAlign: "center" },
  orderIdPill: { backgroundColor: "#F3E8FF", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginTop: 8 },
  orderIdPillText: { fontSize: 12, fontWeight: "800", color: THEME.colors.primary },
  successSub: { fontSize: 13, color: THEME.colors.textSecondary, textAlign: "center", lineHeight: 20, marginTop: 10, marginBottom: 20, paddingHorizontal: 16 },

  // Timeline
  timelineCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, width: "100%", borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 12 },
  timelineTitle: { fontSize: 14, fontWeight: "900", color: THEME.colors.textPrimary, marginBottom: 14 },
  timelineRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 2 },
  timelineLeft: { alignItems: "center", marginRight: 12, width: 20 },
  timelineDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#CBD5E1", backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" },
  timelineDotDone: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
  timelineDotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#CBD5E1" },
  timelineLine: { width: 2, height: 28, backgroundColor: "#E2E8F0" },
  timelineLineDone: { backgroundColor: "#16A34A" },
  timelineContent: { flex: 1, paddingBottom: 14 },
  timelineLabel: { fontSize: 13, fontWeight: "800", color: THEME.colors.textPrimary },
  timelineLabelDone: { color: "#16A34A" },
  timelineSub: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 1 },

  // Success Items
  successItemsCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 14, width: "100%", borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 16 },
  successItemsTitle: { fontSize: 14, fontWeight: "900", color: THEME.colors.textPrimary, marginBottom: 10 },
  successItemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderColor: "#F1F5F9" },
  successItemImg: { width: 52, height: 52, borderRadius: 10, backgroundColor: "#F1F5F9" },
  successItemName: { fontSize: 13, fontWeight: "700", color: THEME.colors.textPrimary },
  successItemMeta: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 2 },
  successItemPrice: { fontSize: 13, fontWeight: "900", color: THEME.colors.textPrimary },
  successTotalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, marginTop: 4 },
  successTotalLabel: { fontSize: 14, fontWeight: "900", color: THEME.colors.textPrimary },
  successTotalVal: { fontSize: 16, fontWeight: "900", color: THEME.colors.primary },

  // Success Buttons
  successPrimaryBtn: { backgroundColor: THEME.colors.primary, borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "center", marginBottom: 10 },
  successPrimaryText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  successSecondaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, backgroundColor: "#FFF", borderRadius: 14, borderWidth: 1.5, borderColor: THEME.colors.primary, width: "100%" },
  successSecondaryText: { color: THEME.colors.primary, fontWeight: "800", fontSize: 14 },
});
