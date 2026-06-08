import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ChevronLeft, LogOut } from "lucide-react-native";
import { profileStyles as s } from "../../styles/profileStyles";

type ProfileHeaderProps = {
  onBack: () => void;
  onLogout: () => void;
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onBack, onLogout }) => {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} style={s.backButton} activeOpacity={0.7}>
        <ChevronLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={s.headerTitle}>My Profile</Text>
      <TouchableOpacity onPress={onLogout} style={s.logoutBtn} activeOpacity={0.7}>
        <LogOut size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};
