import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useToast } from "../components/ui/Toast";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { fetchCart } from "../redux/action";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";

type Address = {
  id: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export const useCheckoutData = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("USA");
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);

  const cartItems = useAppSelector((state) => state.cart.items);
  const totalAmount = useAppSelector((state) => state.cart.meta.grand_total);

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    setIsLoading(true);
    try {
      await dispatch(fetchCart());
      const addrRes = await apiClient.get(API_ENDPOINTS.ADDRESSES);
      if (addrRes.ok) {
        const d = await addrRes.json();
        const records = d.records || d;
        const list = Array.isArray(records) ? records : (records.addresses || records.data || d.addresses || d.data || []);
        setAddresses(list);
        if (list.length > 0) setSelectedAddressId(list[0].id);
      }
    } catch (err) {
      showToast({ message: "Failed to load checkout data", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!street.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      showToast({ message: "Please fill in all address fields", type: "warning" });
      return;
    }
    setIsSavingAddress(true);
    try {
      const res = await apiClient.post(API_ENDPOINTS.ADDRESSES, { street, city, state, zip, country });
      if (res.ok) {
        const d = await res.json();
        const n = d.address || d.data;
        if (n) {
          setAddresses(p => [...p, n]);
          setSelectedAddressId(n.id);
        }
        setStreet(""); setCity(""); setState(""); setZip(""); setCountry("USA");
        setShowNewAddressForm(false);
        showToast({ message: "Address saved successfully!", type: "success" });
      }
    } catch {
      showToast({ message: "Failed to save address", type: "error" });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast({ message: "Please select a delivery address", type: "warning" });
      return;
    }
    const a = addresses.find(x => x.id === selectedAddressId);
    if (!a) return;
    setIsPlacingOrder(true);
    try {
      const res = await apiClient.post(API_ENDPOINTS.ORDERS, {
        shipping_address: `${a.street}, ${a.city}, ${a.state} ${a.zip}, ${a.country}`,
      });
      if (res.ok) {
        const d = await res.json();
        setPlacedOrderId(d.order?.id || d.data?.id);
        setOrderSuccess(true);
        dispatch(fetchCart());
      } else {
        const e = await res.json().catch(() => ({}));
        showToast({ message: e.message || "Failed to place order", type: "error" });
      }
    } catch {
      showToast({ message: "Network error — please try again", type: "error" });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const discount = totalAmount * 0.05;
  const finalTotal = totalAmount - discount;
  const deliveryDate = new Date(Date.now() + 4 * 86400000).toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric",
  });

  return {
    router,
    addresses,
    selectedAddressId,
    showNewAddressForm,
    street,
    city,
    state,
    zip,
    country,
    isLoading,
    isPlacingOrder,
    isSavingAddress,
    orderSuccess,
    placedOrderId,
    cartItems,
    totalAmount,
    discount,
    finalTotal,
    deliveryDate,

    setSelectedAddressId,
    setShowNewAddressForm,
    setStreet,
    setCity,
    setState,
    setZip,
    setCountry,
    handleSaveAddress,
    handlePlaceOrder,
  };
};
