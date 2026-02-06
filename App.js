import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";

import { CartProvider } from "./context/CartContext";

// Screens
import SignupScreen from "./SignupScreen";
import LoginScreen from "./LoginScreen";
import OtpVerificationScreen from "./OtpVerificationScreen";
import ForgotPasswordScreen from "./ForgotPasswordScreen";
import ResetPasswordScreen from "./ResetPasswordScreen";
import AiAssistant from "./Aiassistant";
import FiltersScreen from "./FiltersScreen";

// Farmer Screens
import FDashboard from "./Farmer/fDashboard";
import MyProducts from "./Farmer/MyProducts";
import AddProducts from "./Farmer/AddProduct";
import Orders from "./Farmer/orders";
import Earnings from "./Farmer/earnings";
import Notifications from "./Consumer/Notifications";

// Customer Screens
import cDashboard from "./Consumer/cDashboard";
import ProductDetails from "./Consumer/ProductDetails";
import Cart from "./Consumer/Cart";
import Payment from "./Consumer/Payment";
import CustomerOrders from "./Consumer/CustomerOrders";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Custom Drawer with Logout
function CustomDrawerContent(props) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    Alert.alert("Logged out", "You have been logged out successfully");
    props.navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

// Nested Stack for Farmer
function FarmerDashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={FDashboard} />
      <Stack.Screen name="MyProducts" component={MyProducts} />
      <Stack.Screen name="AddProducts" component={AddProducts} />
      <Stack.Screen name="Orders" component={Orders} />
      <Stack.Screen name="Earnings" component={Earnings} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="AiAssistant" component={AiAssistant} />
    </Stack.Navigator>
  );
}

function FarmerDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Dashboard" component={FarmerDashboardStack} />
    </Drawer.Navigator>
  );
}

// Nested Stack for Customer
function CustomerDashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={cDashboard} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="Cart" component={Cart} />
      <Stack.Screen name="Payment" component={Payment} />
      <Stack.Screen name="CustomerOrders" component={CustomerOrders} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="FiltersScreen" component={FiltersScreen} />
    </Stack.Navigator>
  );
}

function CustomerDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Dashboard" component={CustomerDashboardStack} />
    </Drawer.Navigator>
  );
}

// Root App
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user from AsyncStorage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <CartProvider userPhone={user?.phone}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="OtpVerificationScreen" component={OtpVerificationScreen} />
          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="FarmerDashboard" component={FarmerDrawer} />
          <Stack.Screen name="CustomerDashboard" component={CustomerDrawer} />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    padding: 15,
    backgroundColor: "#d9534f",
    margin: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
