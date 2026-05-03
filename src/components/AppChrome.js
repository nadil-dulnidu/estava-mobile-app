import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { estavaCore } from "../theme/estavaCore";
import { useAuth } from "../context/AuthContext";
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
  { label: "Post Property", route: "CreateProperty", icon: EditIcon },
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

const ActionButton = ({ icon: Icon, onPress, accessibilityLabel, active = false, hasAvatar = false, avatarUri, initials, badgeCount = 0 }) => (
  <View style={styles.actionShell}>
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
    {badgeCount > 0 ? (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badgeCount > 99 ? "99+" : String(badgeCount)}</Text>
      </View>
    ) : null}
  </View>
);

export const HeaderActions = ({ navigation, user, onMenuPress, menuOpen }) => {
  const { unreadNotificationCount } = useAuth();
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
        badgeCount={unreadNotificationCount}
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

const getQuickAccessItemsForUser = () => {
  return appQuickAccessItems;
};

export const QuickAccessMenu = ({ visible, onClose, navigation, user }) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const quickAccessItems = getQuickAccessItemsForUser(user);

  return (
    <>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.menuLayer, { paddingTop: insets.top + 54 }]}>
        <View style={styles.menuPanel}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Quick Menu</Text>
            <Text style={styles.menuSubtitle}>{quickAccessItems.length} shortcuts</Text>
          </View>
          {quickAccessItems.map((item) => {
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
      </View>
    </>
  );
};

export const AppFooter = ({ navigation, activeRoute }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.footer, { height: 66 + insets.bottom, paddingBottom: Math.max(insets.bottom, 6) }]}>
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
  actionShell: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center"
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    backgroundColor: estavaCore.colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  actionButtonActive: {
    backgroundColor: estavaCore.colors.accentSoft,
    borderColor: estavaCore.colors.accent
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 12
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 999,
    backgroundColor: estavaCore.colors.danger,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: estavaCore.colors.surface
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700"
  },
  avatarInitials: {
    fontWeight: "700",
    color: estavaCore.colors.primary
  },
  headerActions: {
    flexDirection: "row",
    gap: 6,
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
  menuLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    paddingHorizontal: 16,
    alignItems: "flex-end"
  },
  menuPanel: {
    width: 248,
    backgroundColor: estavaCore.colors.surface,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    borderRadius: 14,
    padding: 8,
    ...estavaCore.shadow.card
  },
  menuHeader: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 10
  },
  menuTitle: {
    color: estavaCore.colors.primary,
    fontWeight: "700",
    fontSize: 14
  },
  menuSubtitle: {
    marginTop: 2,
    color: estavaCore.colors.textSecondary,
    fontSize: 12
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
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: estavaCore.colors.border,
    backgroundColor: estavaCore.colors.surface,
    paddingTop: 4
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
