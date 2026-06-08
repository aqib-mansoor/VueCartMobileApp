import { StyleSheet, Platform, Dimensions } from "react-native";
import { THEME } from "../constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF", // Very light purple
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchSection: {
    flexDirection: "row",
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.sm,
    gap: THEME.spacing.md,
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: THEME.spacing.md,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: THEME.spacing.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 14,
    color: THEME.colors.textPrimary,
  },
  clearSearchButton: {
    padding: 4,
  },
  filterButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesContainer: {
    marginTop: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
  },
  categoryList: {
    gap: THEME.spacing.sm,
    paddingBottom: 4,
  },
  categoryPill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryPillSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  categoryPillTextSelected: {
    color: "#FFFFFF",
  },
  productsSection: {
    marginTop: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.lg,
  },
  resetButton: {
    padding: 4,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: THEME.spacing.md,
  },
  skeletonCard: {
    width: (Dimensions.get("window").width - THEME.spacing.lg * 3) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: THEME.spacing.sm,
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  skeletonImage: {
    width: "100%",
    height: "55%",
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
  },
  skeletonLine: {
    width: "80%",
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: THEME.spacing.xl,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
    marginTop: THEME.spacing.md,
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: THEME.spacing.lg,
  },
  emptyStateButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emptyStateButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    paddingVertical: 14,
    marginTop: THEME.spacing.lg,
    gap: 8,
  },
  loadMoreIcon: {
    marginRight: 4,
  },
  loadMoreText: {
    color: THEME.colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  loadingMoreIndicator: {
    marginVertical: THEME.spacing.lg,
  },
});
