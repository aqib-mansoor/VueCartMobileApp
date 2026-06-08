import { useState, useEffect } from "react";
import { Animated } from "react-native";
import { useRouter } from "expo-router";
import { useToast } from "../components/ui/Toast";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { fetchCart, updateCartQuantity, removeFromCart, clearCart } from "../redux/action";

export const useCartData = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

  const cartItems = useAppSelector((state) => state.cart.items);
  const meta = useAppSelector((state) => state.cart.meta);
  const isLoading = useAppSelector((state) => state.cart.isLoading);

  const [isClearing, setIsClearing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [wipeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    dispatch(fetchCart(cartItems.length === 0));
  }, [dispatch, cartItems.length]);

  const updateQuantity = async (itemId: number, newQty: number, currentQty: number) => {
    if (newQty < 1) {
      handleRemoveItem(itemId);
      return;
    }
    try {
      await dispatch(updateCartQuantity(itemId, newQty));
    } catch (err: any) {
      showToast({ message: err || "Failed to update quantity", type: "error" });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await dispatch(removeFromCart(itemId));
      showToast({ message: "Item removed from cart", type: "success" });
    } catch (err: any) {
      showToast({ message: err || "Failed to remove item", type: "error" });
    }
  };

  const handleClearCart = () => {
    showConfirm({
      title: "Clear Cart",
      message: "Are you sure you want to remove all items from your cart?",
      confirmText: "Clear All",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        setIsClearing(true);
        try {
          await dispatch(clearCart());
          Animated.timing(wipeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
            wipeAnim.setValue(1);
            setIsClearing(false);
            showToast({ message: "Cart cleared successfully", type: "success" });
          });
        } catch (err: any) {
          setIsClearing(false);
          showToast({ message: err || "Failed to clear cart", type: "error" });
        }
      }
    });
  };

  const discount = meta.grand_total * 0.05;
  const finalTotal = meta.grand_total - discount;

  return {
    router,
    cartItems,
    meta,
    isLoading,
    isClearing,
    promoCode,
    wipeAnim,
    discount,
    finalTotal,

    setPromoCode,
    updateQuantity,
    handleRemoveItem,
    handleClearCart,
    showToast,
  };
};
