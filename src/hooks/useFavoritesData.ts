import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useToast } from "../components/ui/Toast";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { fetchFavorites, toggleFavorite, addToCart } from "../redux/action";

type Product = {
  id: number;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  category_id: number;
  category?: { name: string };
};

export const useFavoritesData = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const favorites = useAppSelector((state) => state.favorites.items);
  const isAddingToCart = useAppSelector((state) => state.cart.isAddingToCartId);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await dispatch(fetchFavorites(true));
      setIsLoading(false);
    };
    loadData();
  }, [dispatch]);

  const handleToggleFavorite = async (productId: number) => {
    try {
      await dispatch(toggleFavorite(productId));
      showToast({ message: "Removed from favorites", type: "info" });
    } catch (err: any) {
      showToast({ message: err || "Failed to update favorites", type: "error" });
    }
  };

  const handleAddToCart = (productId: number) => {
    showToast({ message: "Added to cart! 🎉", type: "success" });
    dispatch(addToCart(productId, 1)).catch((err: any) => {
      showToast({ message: err?.message || "Failed to add to cart", type: "error" });
    });
  };

  return {
    router,
    favorites,
    isLoading,
    isAddingToCart,
    selectedProduct,
    setSelectedProduct,

    handleToggleFavorite,
    handleAddToCart,
  };
};
