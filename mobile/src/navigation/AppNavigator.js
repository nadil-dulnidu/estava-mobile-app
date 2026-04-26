// Navigation graph with authenticated and unauthenticated route flows.
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import PropertyListScreen from "../screens/PropertyListScreen";
import MyPropertiesScreen from "../screens/MyPropertiesScreen";
import PropertyDetailScreen from "../screens/PropertyDetailScreen";
import EditPropertyScreen from "../screens/EditPropertyScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import InquiriesScreen from "../screens/InquiriesScreen";
import AppointmentsScreen from "../screens/AppointmentsScreen";
import ReviewsScreen from "../screens/ReviewsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import CreatePropertyScreen from "../screens/CreatePropertyScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Dashboard" }} />
          <Stack.Screen
            name="PropertyList"
            component={PropertyListScreen}
            options={{ title: "Properties" }}
          />
          <Stack.Screen
            name="MyProperties"
            component={MyPropertiesScreen}
            options={{ title: "My Properties" }}
          />
          <Stack.Screen
            name="CreateProperty"
            component={CreatePropertyScreen}
            options={{ title: "Post Property" }}
          />
          <Stack.Screen
            name="PropertyDetail"
            component={PropertyDetailScreen}
            options={{ title: "Property Details" }}
          />
          <Stack.Screen
            name="EditProperty"
            component={EditPropertyScreen}
            options={{ title: "Edit Property" }}
          />
          <Stack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{ title: "My Favorites" }}
          />
          <Stack.Screen
            name="Inquiries"
            component={InquiriesScreen}
            options={{ title: "Inquiries" }}
          />
          <Stack.Screen
            name="Appointments"
            component={AppointmentsScreen}
            options={{ title: "Appointments" }}
          />
          <Stack.Screen
            name="Reviews"
            component={ReviewsScreen}
            options={{ title: "Reviews" }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ title: "Notifications" }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: "My Profile" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
        </>
      )}
    </Stack.Navigator>
  );
}