import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ChevronLeft, Search, X } from "lucide-react-native";
import { THEME } from "../../constants/theme";
import { ordersStyles as s } from "../../styles/ordersStyles";

type OrdersHeaderProps = {
  onBack: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  tabs: readonly string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  getTabCount: (tab: string) => number;
};

export const OrdersHeader: React.FC<OrdersHeaderProps> = ({
  onBack,
  searchQuery,
  setSearchQuery,
  tabs,
  activeTab,
  setActiveTab,
  getTabCount,
}) => {
  return (
    <>
      {/* Title bar */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Orders</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Search bar */}
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Search size={15} color={THEME.colors.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by product name or order ID..."
            placeholderTextColor={THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={15} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <View style={s.tabsContainer}>
        {tabs.map(tab => {
          const active = tab === activeTab;
          const count = getTabCount(tab);
          return (
            <TouchableOpacity
              key={tab}
              style={[s.tabItem, active && s.tabItemActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <View style={s.tabTextWrapper}>
                <Text style={[s.tabItemText, active && s.tabItemTextActive]}>{tab}</Text>
                {count > 0 && (
                  <View style={[s.tabItemBadge, active && s.tabItemBadgeActive]}>
                    <Text style={[s.tabItemBadgeText, active && s.tabItemBadgeTextActive]}>{count}</Text>
                  </View>
                )}
              </View>
              {active && <View style={s.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
};
