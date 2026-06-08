import React from "react";
import { Text, View } from "react-native";
import { profileStyles as s } from "../../styles/profileStyles";

type ProfileHeroProps = {
  user: {
    name?: string;
  } | null;
};

export const ProfileHero: React.FC<ProfileHeroProps> = ({ user }) => {
  return (
    <View style={s.heroBanner}>
      <View style={s.heroGradient}>
        <View style={s.largeAvatar}>
          <Text style={s.largeAvatarText}>
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </Text>
        </View>
        <Text style={s.profileName}>{user?.name || "User Name"}</Text>
      </View>
    </View>
  );
};
