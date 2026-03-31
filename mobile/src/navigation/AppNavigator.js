// Navigation graph with authenticated and unauthenticated route flows.
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import PropertyListScreen from "../screens/PropertyListScreen";
import PropertyDetailScreen from "../screens/PropertyDetailScreen";
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
            name="PropertyDetail"
            component={PropertyDetailScreen}
            options={{ title: "Property Details" }}
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