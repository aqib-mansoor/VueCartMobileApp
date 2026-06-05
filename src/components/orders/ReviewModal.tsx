import React from "react";
import { StyleSheet, View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { X, Star, Send, Eye, EyeOff } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { getProductImage } from "../home/ProductCard";

type ReviewModalProps = {
  visible: boolean;
  onClose: () => void;
  productName: string;
  rating: number;
  setRating: (n: number) => void;
  comment: string;
  setComment: (s: string) => void;
  isAnonymous: boolean;
  setIsAnonymous: (v: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

const STAR_LABELS = ["", "Terrible", "Bad", "Okay", "Good", "Excellent!"];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  productName,
  rating,
  setRating,
  comment,
  setComment,
  isAnonymous,
  setIsAnonymous,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />

          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Rate Your Purchase</Text>
            <TouchableOpacity onPress={onClose} style={s.modalClose}>
              <X size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Product being reviewed */}
          <View style={s.reviewProductRow}>
            <Image
              source={{ uri: getProductImage(productName) }}
              style={s.reviewProductImg}
              defaultSource={require("../../../assets/images/icon.png")}
            />
            <View style={{ flex: 1 }}>
              <Text style={s.reviewProductName} numberOfLines={2}>{productName}</Text>
              <Text style={s.reviewProductHint}>Share your experience</Text>
            </View>
          </View>

          {/* Stars */}
          <Text style={s.ratingPrompt}>How would you rate this product?</Text>
          <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity key={n} onPress={() => setRating(n)} activeOpacity={0.7} style={s.starBtn}>
                <Star
                  size={42}
                  color={n <= rating ? "#FBBF24" : "#E2E8F0"}
                  fill={n <= rating ? "#FBBF24" : "transparent"}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={s.ratingLabel}>{STAR_LABELS[rating]}</Text>
          )}

          {/* Comment */}
          <TextInput
            style={s.commentInput}
            placeholder="Write your review here (optional)..."
            placeholderTextColor={THEME.colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
          />

          {/* Anonymous Toggle */}
          <View style={s.anonRow}>
            <View style={s.anonLabelWrap}>
              {isAnonymous
                ? <EyeOff size={15} color="#6366F1" />
                : <Eye size={15} color={THEME.colors.textSecondary} />
              }
              <View>
                <Text style={s.anonTitle}>
                  Post as: <Text style={isAnonymous ? s.anonHighlight : s.namedHighlight}>
                    {isAnonymous ? "Anonymous" : "My Name"}
                  </Text>
                </Text>
                <Text style={s.anonHint}>
                  {isAnonymous
                    ? "Your name is hidden from other shoppers"
                    : "Your name will be visible to others"}
                </Text>
              </View>
            </View>

            {/* Toggle pill */}
            <TouchableOpacity
              style={[s.togglePill, isAnonymous && s.togglePillAnon]}
              onPress={() => setIsAnonymous(!isAnonymous)}
              activeOpacity={0.8}
            >
              <View style={[s.toggleThumb, isAnonymous && s.toggleThumbRight]} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[s.submitBtn, rating === 0 && s.submitBtnDisabled]}
            onPress={onSubmit}
            disabled={isSubmitting || rating === 0}
            activeOpacity={0.9}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Send size={16} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={s.submitBtnText}>Submit Review</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#FFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 36 },
  modalHandle: { width: 40, height: 4, backgroundColor: "#D1D5DB", borderRadius: 2, alignSelf: "center", marginBottom: 18 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: THEME.colors.textPrimary },
  modalClose: { padding: 4 },

  reviewProductRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F8FAFC", borderRadius: 14, padding: 12, marginBottom: 18, borderWidth: 1, borderColor: "#E2E8F0" },
  reviewProductImg: { width: 56, height: 56, borderRadius: 10, backgroundColor: "#E2E8F0" },
  reviewProductName: { fontSize: 13, fontWeight: "800", color: THEME.colors.textPrimary, lineHeight: 18 },
  reviewProductHint: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 2 },

  ratingPrompt: { fontSize: 13, fontWeight: "800", color: THEME.colors.textPrimary, textAlign: "center", marginBottom: 12 },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 8 },
  starBtn: { padding: 4 },
  ratingLabel: { textAlign: "center", fontSize: 14, fontWeight: "800", color: "#FBBF24", marginBottom: 14 },

  commentInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    minHeight: 90,
    marginBottom: 14,
  },

  // Anonymous toggle row
  anonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  anonLabelWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flex: 1,
  },
  anonTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  anonHighlight: {
    color: "#6366F1",
    fontWeight: "900",
  },
  namedHighlight: {
    color: THEME.colors.primary,
    fontWeight: "900",
  },
  anonHint: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
    fontWeight: "500",
  },

  // Toggle switch
  togglePill: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#CBD5E1",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  togglePillAnon: {
    backgroundColor: "#6366F1",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    alignSelf: "flex-start",
  },
  toggleThumbRight: {
    alignSelf: "flex-end",
  },

  submitBtn: { backgroundColor: THEME.colors.primary, borderRadius: 14, paddingVertical: 14, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  submitBtnDisabled: { backgroundColor: "#CBD5E1" },
  submitBtnText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
});
