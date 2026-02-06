import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.15.108.12:5000/api/orders";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);

  // ✅ Handle token expiration
  const handleTokenExpiration = async (navigation) => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    Alert.alert("Session Expired", "Please login again");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          handleTokenExpiration();
          return;
        }

        const res = await axios.get(`${API_URL}/customer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Fetch orders error:", err.response?.data);
        
        if (err.response?.data?.code === "TOKEN_EXPIRED" || err.response?.status === 401) {
          handleTokenExpiration();
          return;
        }
        
        Alert.alert("Error", "Failed to fetch orders");
      }
    };
    fetchOrders();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📦 My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Crop: {item.productId?.cropName || "Unknown"}</Text>
            <Text>Type: {item.type}</Text>
            {item.type === "negotiation" && <Text>Negotiated Price: ₹{item.negotiatedPrice}</Text>}
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 40,flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
});