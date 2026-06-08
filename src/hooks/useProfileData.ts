import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useToast } from "../components/ui/Toast";
import { useConfirm } from "../components/ui/ConfirmDialog";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { fetchFavorites, login as loginAction, logout as logoutAction } from "../redux/action";
import { apiClient } from "../utils/api";
import { API_ENDPOINTS } from "../constants/endpoints";
import { ROUTES } from "../constants/routes";
import { InfoModalType } from "../components/profile/InfoModal";

export type Address = {
  id: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export const useProfileData = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { authToken, user } = useAppSelector((state) => state.auth);
  const favorites = useAppSelector((state) => state.favorites.items);
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

  const [isLoading, setIsLoading] = useState(!user);
  const [activeModal, setActiveModal] = useState<InfoModalType>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("USA");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  useEffect(() => {
    fetchProfileData();
    dispatch(fetchFavorites(false));
  }, [dispatch]);

  const fetchProfileData = async () => {
    if (!user) {
      setIsLoading(true);
    }
    try {
      const res = await apiClient.get(API_ENDPOINTS.PROFILE);
      if (res.ok) {
        const data = await res.json();
        const profile = data.records || data.user || data.data || {};
        if (authToken) {
          dispatch(loginAction(authToken, profile));
        }
      }

      const addressRes = await apiClient.get(API_ENDPOINTS.ADDRESSES);
      if (addressRes.ok) {
        const addressData = await addressRes.json();
        const records = addressData.records || addressData;
        const list = Array.isArray(records) ? records : (addressData.addresses || addressData.data || []);
        setAddresses(list);
      }
    } catch (err) {
      console.error("Error fetching profile screen details:", err);
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
          setAddresses(p => [n, ...p]);
        } else {
          const n2 = d.records || d;
          setAddresses(p => [n2, ...p]);
        }
        setStreet(""); setCity(""); setState(""); setZip(""); setCountry("USA");
        setShowNewAddressForm(false);
        showToast({ message: "Address saved successfully!", type: "success" });
      } else {
        showToast({ message: "Failed to save address", type: "error" });
      }
    } catch {
      showToast({ message: "Failed to save address due to network error", type: "error" });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleLogout = () => {
    showConfirm({
      title: "Logout",
      message: "Are you sure you want to sign out?",
      confirmText: "Sign Out",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        await dispatch(logoutAction());
        router.replace(ROUTES.LOGIN as any);
      },
    });
  };

  return {
    router,
    user,
    favorites,
    isLoading,
    activeModal,
    showEditModal,
    addresses,
    showNewAddressForm,
    street,
    city,
    state,
    zip,
    country,
    isSavingAddress,

    setActiveModal,
    setShowEditModal,
    setShowNewAddressForm,
    setStreet,
    setCity,
    setState,
    setZip,
    setCountry,

    handleSaveAddress,
    handleLogout,
    fetchProfileData,
  };
};
