import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Package, ShoppingBag } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { ordersStyles as s } from "../../styles/ordersStyles";

type OrdersEmptyStateProps = {
  searchQuery: string;
  onShopNow: () => void;
};

export const OrdersEmptyState: React.FC<OrdersEmptyStateProps> = ({ searchQuery, onShopNow }) => (
  <View style={s.emptyCont}>
    <View style={s.emptyIcon}>
      <Package size={44} color={THEME.colors.textMuted} />
    </View>
    <Text style={s.emptyTitle}>{searchQuery ? "No matching orders" : "No orders yet"}</Text>
    <Text style={s.emptySub}>
      {searchQuery ? "Try different search terms" : "Your orders will show up here once you place one"}
    </Text>
    {!searchQuery && (
      <TouchableOpacity style={s.shopNowBtn} onPress={onShopNow}>
        <ShoppingBag size={15} color="#FFF" style={{ marginRight: 6 }} />
        <Text style={s.shopNowText}>Shop Now</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const OrdersSkeletons: React.FC = () => (
  <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
    {[1, 2, 3].map((i) => (
      <View key={i} style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        gap: 12,
      }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ width: 120, height: 14, backgroundColor: "#E5E7EB", borderRadius: 4 }} />
          <View style={{ width: 70, height: 20, backgroundColor: "#E5E7EB", borderRadius: 6 }} />
        </View>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <View style={{ width: 50, height: 50, backgroundColor: "#E5E7EB", borderRadius: 10 }} />
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ width: "70%", height: 12, backgroundColor: "#E5E7EB", borderRadius: 4 }} />
            <View style={{ width: "40%", height: 10, backgroundColor: "#E5E7EB", borderRadius: 4 }} />
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 12, marginTop: 4 }}>
          <View style={{ width: 80, height: 12, backgroundColor: "#E5E7EB", borderRadius: 4 }} />
          <View style={{ width: 60, height: 12, backgroundColor: "#E5E7EB", borderRadius: 4 }} />
        </View>
      </View>
    ))}
  </ScrollView>
);
