import React from "react";
import { ScrollView } from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, Package, Truck, CheckCircle, XCircle } from "lucide-react-native";
import { ROUTES } from "../../constants/routes";

// Extracted hook, styles, and components
import { useOrdersData } from "../../hooks/useOrdersData";
import { ordersStyles as s } from "../../styles/ordersStyles";
import { OrdersHeader } from "../../components/orders/OrdersHeader";
import { OrdersEmptyState, OrdersSkeletons } from "../../components/orders/OrdersEmptyState";
import { OrderCard } from "../../components/orders/OrderCard";
import { ReviewModal } from "../../components/orders/ReviewModal";

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; label: string; Icon: any }> = {
  pending:    { bg: "#FEF9C3", text: "#A16207", border: "#FCD34D", label: "Pending",    Icon: Clock },
  processing: { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A", label: "Processing", Icon: Package },
  shipped:    { bg: "#E0F2FE", text: "#0369A1", border: "#7DD3FC", label: "Shipped",    Icon: Truck },
  delivered:  { bg: "#DCFCE7", text: "#15803D", border: "#86EFAC", label: "Delivered",  Icon: CheckCircle },
  completed:  { bg: "#DCFCE7", text: "#15803D", border: "#86EFAC", label: "Completed",  Icon: CheckCircle },
  cancelled:  { bg: "#FEE2E2", text: "#DC2626", border: "#FCA5A5", label: "Cancelled",  Icon: XCircle },
};

export default function OrdersScreen() {
  const router = useRouter();
  const {
    orders,
    filtered,
    reduxLoading,
    activeTab,
    searchQuery,
    expandedOrders,
    TABS,
    showReviewModal,
    reviewProductName,
    reviewRating,
    reviewComment,
    isAnonymous,
    isSubmittingReview,
    setActiveTab,
    setSearchQuery,
    setReviewRating,
    setReviewComment,
    setIsAnonymous,
    setShowReviewModal,
    toggleExpand,
    handleCancelOrder,
    openReviewModal,
    handleReviewSubmit,
    matchTab,
  } = useOrdersData();

  return (
    <SafeAreaView style={s.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <OrdersHeader
        onBack={() => router.back()}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        tabs={TABS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        getTabCount={(tab) => orders.filter(o => matchTab(o.status, tab)).length}
      />

      {reduxLoading && orders.length === 0 ? (
        <OrdersSkeletons />
      ) : filtered.length === 0 ? (
        <OrdersEmptyState
          searchQuery={searchQuery}
          onShopNow={() => router.push(ROUTES.HOME as any)}
        />
      ) : (
        <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
          {filtered.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              isExpanded={expandedOrders.has(order.id)}
              onToggleExpand={() => toggleExpand(order.id)}
              onCancelOrder={handleCancelOrder}
              onBuyAgain={(productId) => {
                if (productId) {
                  router.push({ pathname: ROUTES.HOME, params: { openProductId: productId } } as any);
                } else {
                  router.push(ROUTES.HOME as any);
                }
              }}
              onRateProduct={openReviewModal}
              statusConfig={STATUS_CONFIG}
            />
          ))}
        </ScrollView>
      )}

      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        productName={reviewProductName}
        rating={reviewRating}
        setRating={setReviewRating}
        comment={reviewComment}
        setComment={setReviewComment}
        isAnonymous={isAnonymous}
        setIsAnonymous={setIsAnonymous}
        onSubmit={handleReviewSubmit}
        isSubmitting={isSubmittingReview}
      />
    </SafeAreaView>
  );
}
