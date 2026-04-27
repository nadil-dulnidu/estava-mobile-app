import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { getProperties } from "../api/propertyApi";
import { useAuth } from "../context/AuthContext";
import { estavaCore } from "../theme/estavaCore";
import { getRecentlyViewedPropertyIds } from "../utils/recentlyViewedProperties";

const resolveUserId = (entity) => {
  if (!entity) return "";
  if (typeof entity === "string") return entity;
  return entity._id || entity.id || "";
};

const getNameInitials = (name) => {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "U";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();

  return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
};

const getCreatedAtTime = (item) => {
  const createdAt = item?.createdAt || item?.updatedAt || 0;
  const parsed = new Date(createdAt).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const fallbackMenu = [
  { label: "Browse", route: "PropertyList" },
  { label: "My Properties", route: "MyProperties" },
  { label: "Post", route: "CreateProperty" },
  { label: "Favorites", route: "Favorites" },
  { label: "Inquiries", route: "Inquiries" },
  { label: "Appointments", route: "Appointments" }
];

const footerLinks = [
  { label: "Home", route: "Home" },
  { label: "Properties", route: "PropertyList" },
  { label: "Favorites", route: "Favorites" },
  { label: "Profile", route: "Profile" }
];

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUserId = resolveUserId(user);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const list = await getProperties({ page: 1, limit: 80 });
      const items = Array.isArray(list?.items) ? list.items : [];
      setProperties(items);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load dashboard properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const featuredProperties = useMemo(() => {
    return [...properties].sort((a, b) => getCreatedAtTime(b) - getCreatedAtTime(a)).slice(0, 3);
  }, [properties]);

  const recommendedProperties = useMemo(() => {
    const viewedIds = getRecentlyViewedPropertyIds(currentUserId, 3);
    if (!viewedIds.length) return [];

    return viewedIds
      .map((id) => properties.find((item) => String(item?._id) === String(id)))
      .filter(Boolean)
      .slice(0, 3);
  }, [currentUserId, properties]);

  const renderPropertyCard = (item, compact = false) => {
    const imageUrl = Array.isArray(item?.imageUrls) ? item.imageUrls[0] : "";
    return (
      <Pressable
        key={item._id}
        style={[styles.propertyCard, compact && styles.propertyCardCompact]}
        onPress={() => navigation.navigate("PropertyDetail", { propertyId: item._id })}
      >
        {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.propertyImage} /> : <View style={styles.imagePlaceholder}><Text style={styles.imagePlaceholderText}>No image</Text></View>}
        <View style={styles.propertyContent}>
          <Text style={styles.propertyTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.propertyMeta} numberOfLines={1}>{item.location || "Unknown location"}</Text>
          <Text style={styles.propertyPrice}>LKR {Number(item.price || 0).toLocaleString()}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerCaption}>Estava Real Estate</Text>
            <Text style={styles.headerTitle}>Welcome back, {user?.fullName || "User"}</Text>
            <Text style={styles.headerSubline}>Browse curated listings and manage your activity</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton} onPress={() => navigation.navigate("Notifications")}>
              <Text style={styles.iconButtonText}>N</Text>
            </Pressable>
            <Pressable style={styles.avatarButton} onPress={() => navigation.navigate("Profile")}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{getNameInitials(user?.fullName)}</Text>
              )}
            </Pressable>
          </View>
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Featured Properties</Text>
          <Pressable onPress={() => navigation.navigate("PropertyList")}>
            <Text style={styles.sectionLink}>See all</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingBlock}><ActivityIndicator color={estavaCore.colors.accent} /></View>
        ) : (
          <FlatList
            data={featuredProperties}
            horizontal
            scrollEnabled
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => renderPropertyCard(item, true)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        )}

        <View style={styles.menuGrid}>
          {fallbackMenu.map((menu) => (
            <Pressable key={menu.route} style={styles.menuItem} onPress={() => navigation.navigate(menu.route)}>
              <Text style={styles.menuItemText}>{menu.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <Pressable onPress={() => navigation.navigate("PropertyList")}>
            <Text style={styles.sectionLink}>See all</Text>
          </Pressable>
        </View>

        {recommendedProperties.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyText}>Open a few property details and we will suggest based on your visits.</Text>
          </View>
        ) : (
          <View style={styles.stackList}>{recommendedProperties.map((item) => renderPropertyCard(item, false))}</View>
        )}

        <Pressable style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Sign out</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        {footerLinks.map((link) => (
          <Pressable
            key={link.route}
            style={[styles.footerItem, link.route === "Home" && styles.footerItemActive]}
            onPress={() => navigation.navigate(link.route)}
          >
            <Text style={[styles.footerItemText, link.route === "Home" && styles.footerItemTextActive]}>{link.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: estavaCore.colors.background
  },
  container: {
    flex: 1,
    backgroundColor: estavaCore.colors.background
  },
  content: {
    paddingHorizontal: estavaCore.spacing.lg,
    paddingVertical: estavaCore.spacing.lg,
    paddingBottom: 96
  },
  header: {
    marginBottom: estavaCore.spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerCaption: {
    color: estavaCore.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600"
  },
  headerTitle: {
    marginTop: 4,
    fontSize: estavaCore.typography.h2.fontSize,
    fontWeight: estavaCore.typography.h2.fontWeight,
    color: estavaCore.colors.primary,
    maxWidth: 230
  },
  headerSubline: {
    marginTop: 6,
    color: estavaCore.colors.textSecondary,
    maxWidth: 220,
    lineHeight: 18,
    fontSize: 12
  },
  headerActions: {
    flexDirection: "row",
    gap: estavaCore.spacing.sm
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: estavaCore.radius.sm,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    backgroundColor: estavaCore.colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  iconButtonText: {
    color: estavaCore.colors.primary,
    fontWeight: "700"
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: estavaCore.radius.full,
    backgroundColor: estavaCore.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  avatarImage: {
    width: "100%",
    height: "100%"
  },
  avatarText: {
    color: estavaCore.colors.surface,
    fontWeight: "700"
  },
  errorText: {
    marginBottom: estavaCore.spacing.md,
    color: estavaCore.colors.danger,
    fontWeight: "600"
  },
  sectionHead: {
    marginTop: estavaCore.spacing.lg,
    marginBottom: estavaCore.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    fontSize: estavaCore.typography.h3.fontSize,
    fontWeight: estavaCore.typography.h3.fontWeight,
    color: estavaCore.colors.primary
  },
  sectionLink: {
    color: estavaCore.colors.accent,
    fontWeight: "700"
  },
  loadingBlock: {
    backgroundColor: estavaCore.colors.surface,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    borderRadius: estavaCore.radius.md,
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center"
  },
  horizontalList: {
    paddingRight: 8,
    gap: estavaCore.spacing.md
  },
  propertyCard: {
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    backgroundColor: estavaCore.colors.surface,
    borderRadius: estavaCore.radius.md,
    overflow: "hidden",
    ...estavaCore.shadow.card
  },
  propertyCardCompact: {
    width: 248
  },
  propertyImage: {
    width: "100%",
    height: 148,
    backgroundColor: estavaCore.colors.surfaceMuted
  },
  imagePlaceholder: {
    width: "100%",
    height: 132,
    backgroundColor: estavaCore.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  imagePlaceholderText: {
    color: estavaCore.colors.textSecondary,
    fontWeight: "600"
  },
  propertyContent: {
    padding: estavaCore.spacing.md
  },
  propertyTitle: {
    color: estavaCore.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700"
  },
  propertyMeta: {
    marginTop: 4,
    color: estavaCore.colors.textSecondary
  },
  propertyPrice: {
    marginTop: 8,
    color: estavaCore.colors.accent,
    fontWeight: "700"
  },
  menuGrid: {
    marginTop: estavaCore.spacing.xl,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: estavaCore.spacing.sm
  },
  menuItem: {
    width: "48%",
    minHeight: 58,
    borderRadius: estavaCore.radius.sm,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    backgroundColor: estavaCore.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...estavaCore.shadow.card
  },
  menuItemText: {
    color: estavaCore.colors.textPrimary,
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center"
  },
  stackList: {
    gap: estavaCore.spacing.md
  },
  emptyBlock: {
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    borderRadius: estavaCore.radius.md,
    backgroundColor: estavaCore.colors.surface,
    padding: estavaCore.spacing.lg
  },
  emptyText: {
    color: estavaCore.colors.textSecondary,
    lineHeight: 20
  },
  logoutButton: {
    marginTop: estavaCore.spacing.xl,
    minHeight: 48,
    borderRadius: estavaCore.radius.sm,
    borderWidth: 1,
    borderColor: estavaCore.colors.danger,
    backgroundColor: estavaCore.colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  logoutButtonText: {
    color: estavaCore.colors.danger,
    fontWeight: "700"
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: estavaCore.colors.border,
    backgroundColor: estavaCore.colors.surface
  },
  footerItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  footerItemActive: {
    backgroundColor: estavaCore.colors.accentSoft,
    borderTopWidth: 2,
    borderTopColor: estavaCore.colors.accent
  },
  footerItemText: {
    color: estavaCore.colors.textSecondary,
    fontWeight: "600",
    fontSize: 12
  },
  footerItemTextActive: {
    color: estavaCore.colors.accent,
    fontWeight: "700"
  }
});
