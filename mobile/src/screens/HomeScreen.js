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
import { useFocusEffect } from "@react-navigation/native";
import { getProperties } from "../api/propertyApi";
import { useAuth } from "../context/AuthContext";
import { estavaCore } from "../theme/estavaCore";
import { getRecentlyViewedPropertyIds } from "../utils/recentlyViewedProperties";
import { AppFooter, QuickAccessMenu, HeaderActions } from "../components/AppChrome";

const resolveUserId = (entity) => {
  if (!entity) return "";
  if (typeof entity === "string") return entity;
  return entity._id || entity.id || "";
};

const getCreatedAtTime = (item) => {
  const createdAt = item?.createdAt || item?.updatedAt || 0;
  const parsed = new Date(createdAt).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

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
      <QuickAccessMenu visible={menuVisible} onClose={() => setMenuVisible(false)} navigation={navigation} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerCaption}>Estava Real Estate</Text>
            <Text style={styles.headerTitle}>Welcome back, {user?.fullName || "User"}</Text>
            <Text style={styles.headerSubline}>Browse curated listings and manage your activity</Text>
          </View>
          <HeaderActions
            navigation={navigation}
            user={user}
            onMenuPress={() => setMenuVisible((current) => !current)}
            menuOpen={menuVisible}
          />
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

      </ScrollView>
      <AppFooter navigation={navigation} activeRoute="Home" />
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
    paddingTop: 32,
    paddingBottom: 96
  },
  header: {
    marginBottom: estavaCore.spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
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
  footerSpacer: {
    height: 72
  }
});
