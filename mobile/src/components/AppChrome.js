import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { estavaCore } from "../theme/estavaCore";
import {
  BellIcon,
  CalendarIcon,
  ChevronDownIcon,
  GridIcon,
  HeartIcon,
  HomeIcon,
  InboxIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
  EditIcon
} from "./AppIcons";

export const appQuickAccessItems = [
  { label: "Browse", route: "PropertyList", icon: SearchIcon },
  { label: "My Properties", route: "MyProperties", icon: GridIcon },
  { label: "Favorites", route: "Favorites", icon: HeartIcon },
  { label: "Inquiries", route: "Inquiries", icon: InboxIcon },
  { label: "Appointments", route: "Appointments", icon: CalendarIcon }
];

export const appFooterItems = [
  { label: "Home", route: "Home", icon: HomeIcon },
  { label: "Properties", route: "PropertyList", icon: GridIcon },
  { label: "Favorites", route: "Favorites", icon: HeartIcon },
  { label: "Profile", route: "Profile", icon: UserIcon }
];

const ActionButton = ({ icon: Icon, onPress, accessibilityLabel, active = false, hasAvatar = false, avatarUri, initials }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={({ pressed }) => [styles.actionButton, active && styles.actionButtonActive, pressed && styles.pressed]}
  >
    {hasAvatar ? (
      avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarInitials}>{initials || "U"}</Text>
      )
    ) : (
      <Icon color={estavaCore.colors.primary} size={18} />
    )}
  </Pressable>
);

export const HeaderActions = ({ navigation, user, onMenuPress, menuOpen }) => {
  const initials = String(user?.fullName || "User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <View style={styles.headerActions}>
      <ActionButton icon={MenuIcon} onPress={onMenuPress} accessibilityLabel="Open quick access menu" active={menuOpen} />
      <ActionButton
        icon={BellIcon}
        onPress={() => navigation.navigate("Notifications")}
        accessibilityLabel="Open notifications"
      />
      <ActionButton
        icon={UserIcon}
        onPress={() => navigation.navigate("Profile")}
        accessibilityLabel="Open profile"
        hasAvatar
        avatarUri={user?.profileImage}
        initials={initials}
      />
    </View>
  );
};

export const QuickAccessMenu = ({ visible, onClose, navigation }) => {
  if (!visible) return null;

  return (
    <>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.menuPanel}>
        {appQuickAccessItems.map((item) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.route}
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
              onPress={() => {
                onClose();
                navigation.navigate(item.route);
              }}
            >
              <View style={styles.menuIconWrap}>
                <Icon color={estavaCore.colors.accent} size={18} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronDownIcon color={estavaCore.colors.textSecondary} size={14} />
            </Pressable>
          );
        })}
      </View>
    </>
  );
};

export const AppFooter = ({ navigation, activeRoute }) => {
  return (
    <View style={styles.footer}>
      {appFooterItems.map((item) => {
        const Icon = item.icon;
        const active = item.route === activeRoute;
        return (
          <Pressable
            key={item.route}
            style={({ pressed }) => [styles.footerItem, active && styles.footerItemActive, pressed && styles.pressed]}
            onPress={() => navigation.navigate(item.route)}
          >
            <Icon color={active ? estavaCore.colors.accent : estavaCore.colors.textSecondary} size={18} />
            <Text style={[styles.footerLabel, active && styles.footerLabelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export const quickAccessTriggerIcon = MenuIcon;
export const appIcons = { MenuIcon, BellIcon, UserIcon, HomeIcon, GridIcon, HeartIcon, InboxIcon, CalendarIcon, SearchIcon, EditIcon };

const styles = StyleSheet.create({
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    backgroundColor: estavaCore.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  actionButtonActive: {
    backgroundColor: estavaCore.colors.accentSoft,
    borderColor: estavaCore.colors.accent
  },
  avatarImage: {
    width: 42,
    height: 42
  },
  avatarInitials: {
    fontWeight: "700",
    color: estavaCore.colors.primary
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center"
  },
  backdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(15,23,42,0.18)",
    zIndex: 20
  },
  menuPanel: {
    position: "absolute",
    top: 8,
    left: 16,
    right: 16,
    zIndex: 30,
    backgroundColor: estavaCore.colors.surface,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    borderRadius: 14,
    padding: 8,
    ...estavaCore.shadow.card
  },
  menuItem: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: estavaCore.colors.accentSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  menuLabel: {
    flex: 1,
    color: estavaCore.colors.textPrimary,
    fontWeight: "600"
  },
  footer: {
    height: 72,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: estavaCore.colors.border,
    backgroundColor: estavaCore.colors.surface
  },
  footerItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  footerItemActive: {
    backgroundColor: estavaCore.colors.accentSoft,
    borderTopWidth: 2,
    borderTopColor: estavaCore.colors.accent
  },
  footerLabel: {
    fontSize: 11,
    color: estavaCore.colors.textSecondary,
    fontWeight: "600"
  },
  footerLabelActive: {
    color: estavaCore.colors.accent,
    fontWeight: "700"
  },
  pressed: {
    opacity: 0.75,
    transform: [{ translateY: 1 }]
  }
});