// Home Dashboard - displays featured & recommended properties with design system styling
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Image, FlatList } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [recommendedProperties, setRecommendedProperties] = useState([]);

  const profileInitial = String(user?.fullName || "").trim().charAt(0).toUpperCase() || "U";

  useEffect(() => {
    // Mock featured properties (newest 3)
    const mockFeatured = [
      {
        _id: "1",
        title: "Modern Apartment",
        price: 250000,
        location: "Downtown",
        imageUrls: ["https://via.placeholder.com/300x240?text=Featured+1"]
      },
      {
        _id: "2",
        title: "Luxury Villa",
        price: 450000,
        location: "Uptown",
        imageUrls: ["https://via.placeholder.com/300x240?text=Featured+2"]
      },
      {
        _id: "3",
        title: "Cozy House",
        price: 180000,
        location: "Suburbs",
        imageUrls: ["https://via.placeholder.com/300x240?text=Featured+3"]
      }
    ];

    // Mock recommended properties (visited 3)
    const mockRecommended = [
      {
        _id: "4",
        title: "Beach House",
        price: 550000,
        location: "Coastal",
        imageUrls: ["https://via.placeholder.com/380x200?text=Recommended+1"]
      },
      {
        _id: "5",
        title: "City Penthouse",
        price: 800000,
        location: "City Center",
        imageUrls: ["https://via.placeholder.com/380x200?text=Recommended+2"]
      },
      {
        _id: "6",
        title: "Garden Estate",
        price: 320000,
        location: "Countryside",
        imageUrls: ["https://via.placeholder.com/380x200?text=Recommended+3"]
      }
    ];

    setFeaturedProperties(mockFeatured);
    setRecommendedProperties(mockRecommended);
  }, []);

  const menuItems = [
    { label: "Browse", screen: "PropertyList", icon: "🏠" },
    { label: "My Properties", screen: "MyProperties", icon: "🗂️" },
    { label: "Post", screen: "CreateProperty", icon: "📢" },
    { label: "Favorites", screen: "Favorites", icon: "❤️" },
    { label: "Inquiries", screen: "Inquiries", icon: "💬" },
    { label: "Appointments", screen: "Appointments", icon: "📅" },
    { label: "Reviews", screen: "Reviews", icon: "⭐" }
  ];

  const PropertyCard = ({ property, isSmall = false }) => (
    <Pressable
      style={[styles.propertyCard, isSmall && styles.propertyCardSmall]}
      onPress={() => navigation.navigate("PropertyDetail", { propertyId: property._id })}
      accessibilityRole="button"
      accessibilityLabel={property.title}
    >
      {property.imageUrls && property.imageUrls[0] && (
        <Image
          source={{ uri: property.imageUrls[0] }}
          style={[styles.propertyImage, isSmall && styles.propertyImageSmall]}
        />
      )}
      <View style={[styles.propertyInfo, isSmall && styles.propertyInfoSmall]}>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {property.title}
        </Text>
        <Text style={styles.propertyLocation}>{property.location}</Text>
        <Text style={styles.propertyPrice}>LKR {Number(property.price || 0).toLocaleString()}</Text>
      </View>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Welcome, Notifications, and Profile */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.userName}>{user?.fullName || "User"}</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              style={styles.notificationButton}
              onPress={() => navigation.navigate("Notifications")}
              accessibilityLabel="Notifications"
              accessibilityRole="button"
            >
              <Text style={styles.notificationIcon}>🔔</Text>
            </Pressable>
            <Pressable
              style={styles.profileButton}
              onPress={() => navigation.navigate("Profile")}
              accessibilityLabel="Open profile"
              accessibilityRole="button"
              hitSlop={8}
            >
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileFallback}>
                  <Text style={styles.profileFallbackText}>{profileInitial}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {/* Featured Properties Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Properties</Text>
          <Pressable onPress={() => navigation.navigate("PropertyList")}>
            <Text style={styles.seeAllLink}>See all →</Text>
          </Pressable>
        </View>
        <FlatList
          data={featuredProperties}
          horizontal
          scrollEnabled={false}
          renderItem={({ item }) => <PropertyCard property={item} isSmall />}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.horizontalList}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Quick Menu Grid */}
      <View style={styles.section}>
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <Pressable
              key={item.screen}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Recommended For You Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <Pressable onPress={() => navigation.navigate("PropertyList")}>
            <Text style={styles.seeAllLink}>See all →</Text>
          </Pressable>
        </View>
        <FlatList
          data={recommendedProperties}
          scrollEnabled={false}
          renderItem={({ item }) => <PropertyCard property={item} />}
          keyExtractor={(item) => item._id}
        />
      </View>

      <Pressable
        style={styles.logoutButton}
        onPress={logout}
        accessibilityRole="button"
        accessibilityLabel="Logout"
      >
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fb", // Design system surface color
    paddingVertical: 12
  },
  
  // Header styles
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e3e5"
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerLeft: {
    flex: 1
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  greeting: {
    fontSize: 14,
    color: "#45464d", // on-surface-variant
    fontWeight: "500"
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000", // primary
    marginTop: 4
  },
  
  // Notification button
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#eceef0", // surface-container
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e3e5"
  },
  notificationIcon: {
    fontSize: 20
  },
  
  // Profile button
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f2f4f6",
    borderWidth: 1,
    borderColor: "#c6c6cd", // outline-variant
    alignItems: "center",
    justifyContent: "center"
  },
  profileImage: {
    width: "100%",
    height: "100%"
  },
  profileFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000"
  },
  profileFallbackText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16
  },
  
  // Sections
  section: {
    marginTop: 24,
    paddingHorizontal: 16
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000"
  },
  seeAllLink: {
    fontSize: 14,
    color: "#059669", // secondary accent
    fontWeight: "600"
  },
  
  // Property cards
  propertyCard: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e3e5",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1
  },
  propertyCardSmall: {
    width: 160,
    marginRight: 12,
    marginBottom: 0
  },
  propertyImage: {
    width: "100%",
    height: 120
  },
  propertyImageSmall: {
    height: 100
  },
  propertyInfo: {
    padding: 12
  },
  propertyInfoSmall: {
    padding: 8
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000"
  },
  propertyLocation: {
    fontSize: 12,
    color: "#45464d",
    marginTop: 4
  },
  propertyPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#059669",
    marginTop: 8
  },
  
  // Horizontal list container
  horizontalList: {
    paddingRight: 16
  },
  
  // Menu grid
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between"
  },
  menuItem: {
    width: "30%",
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e3e5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1
  },
  menuIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  menuItemLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#191c1e",
    textAlign: "center"
  },
  
  // Logout button
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: "#ba1a1a", // error color
    borderRadius: 8,
    minHeight: 44,
    paddingVertical: 12,
    alignItems: "center"
  },
  logoutText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16
  }
});