import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { Trash2, Plus, Minus, Truck } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { getProductImage } from "../home/ProductCard";

type CartItem = {
  cart_item_id: number;
  product_id: number;
  name: string;
  price: string | number;
  quantity: number;
  total_price: number;
};

type CartItemRowProps = {
  item: CartItem;
  index: number;
  onUpdateQuantity: (itemId: number, newQty: number, currentQty: number) => void;
  onRemoveItem: (itemId: number) => void;
};

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  index,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const img = getProductImage(item.name);
  const disc = 15 + ((item.product_id * 5) % 25);
  const sale = Number(item.price);
  const orig = sale / (1 - disc / 100);
  const deliveryDate = new Date(Date.now() + (3 + index) * 86400000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <View style={s.itemCard}>
      <View style={s.itemRow}>
        <Image
          source={{ uri: img }}
          style={s.productImg}
          resizeMode="cover"
          defaultSource={require("../../../assets/images/icon.png")}
        />
        <View style={s.itemInfo}>
          <Text style={s.itemName} numberOfLines={2}>{item.name}</Text>
          <View style={s.priceRow}>
            <Text style={s.salePrice}>${sale.toFixed(2)}</Text>
            <Text style={s.origPrice}>${orig.toFixed(2)}</Text>
            <View style={s.discBadge}><Text style={s.discText}>{disc}% off</Text></View>
          </View>
          <View style={s.deliveryRow}>
            <Truck size={12} color="#16A34A" />
            <Text style={s.deliveryText}>Delivery by {deliveryDate}</Text>
          </View>
        </View>
      </View>

      {/* Actions Row */}
      <View style={s.actionsRow}>
        <TouchableOpacity onPress={() => onRemoveItem(item.cart_item_id)} style={s.removeBtn} activeOpacity={0.7}>
          <Trash2 size={14} color={THEME.colors.textSecondary} />
          <Text style={s.removeBtnText}>Remove</Text>
        </TouchableOpacity>

        <View style={s.qtyRow}>
          <TouchableOpacity onPress={() => onUpdateQuantity(item.cart_item_id, item.quantity - 1, item.quantity)} style={s.qtyBtn} activeOpacity={0.7}>
            <Minus size={14} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.qtyNum}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => onUpdateQuantity(item.cart_item_id, item.quantity + 1, item.quantity)} style={s.qtyBtn} activeOpacity={0.7}>
            <Plus size={14} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  itemCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
  },
  itemRow: { flexDirection: "row", gap: 12 },
  productImg: { width: 80, height: 80, borderRadius: 12, backgroundColor: "#F1F5F9" },
  itemInfo: { flex: 1, gap: 4 },
  itemName: { fontSize: 13, fontWeight: "800", color: THEME.colors.textPrimary, lineHeight: 18 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  salePrice: { fontSize: 15, fontWeight: "900", color: THEME.colors.textPrimary },
  origPrice: { fontSize: 11, color: THEME.colors.textMuted, textDecorationLine: "line-through" },
  discBadge: { backgroundColor: "#F0FDF4", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discText: { fontSize: 9, color: "#16A34A", fontWeight: "800" },
  deliveryRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  deliveryText: { fontSize: 11, color: "#16A34A", fontWeight: "700" },

  // Actions
  actionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 10, marginTop: 10 },
  removeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  removeBtnText: { fontSize: 11, color: THEME.colors.textSecondary, fontWeight: "700" },
  qtyRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 8, padding: 3, gap: 10 },
  qtyBtn: { width: 24, height: 24, borderRadius: 6, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  qtyNum: { fontSize: 12, fontWeight: "900", color: THEME.colors.textPrimary, minWidth: 16, textAlign: "center" },
});
