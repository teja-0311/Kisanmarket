import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyProducts = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);

  const API_URL = "http://10.15.108.12:5000/api/products"; // ✅ update to your LAN IP

  useEffect(() => {
  const loadUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser?._id) {           // ✅ check if _id exists
          setUser(parsedUser);
          fetchProducts(parsedUser._id);
        } else {
          console.warn("No valid user ID found in AsyncStorage");
        }
      } else {
        console.warn("No user found in AsyncStorage");
      }
    } catch (err) {
      console.error("Error loading user:", err);
    }
  };
  loadUser();
}, []);
const fetchProducts = async (farmerId) => {
  if (!farmerId) return;  // don't fetch if no farmerId

  try {
    const res = await axios.get(`${API_URL}`);
    if (!Array.isArray(res.data)) return;

    const myProducts = res.data.filter((p) => {
      const id = typeof p.farmerId === "object" ? p.farmerId?._id : p.farmerId;
      return id?.toString() === farmerId?.toString();
    });
    setProducts(myProducts);
  } catch (err) {
    console.error("❌ Fetch products error:", err.message);
    Alert.alert("Error", "Failed to fetch products");
  }
};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>📋 My Posted Products</Text>
      {products.length === 0 ? (
        <Text style={{ color: "#555" }}>No products added yet.</Text>
      ) : (
        products.map((p) => (
          <View key={p._id} style={styles.card}>
            <Image
              source={{ uri: p.imageUrl || "https://via.placeholder.com/100" }}
              style={styles.cardImage}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{p.cropName}</Text>
              <Text>{p.description}</Text>
              <Text>📍 {p.location}</Text>
              <Text>📞 {p.phone}</Text>
              <Text>💰 ₹{p.price} / {p.quantity}Kg</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default MyProducts;

const styles = StyleSheet.create({
  container: { paddingTop: 40,padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  card: {
    flexDirection: "row",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  cardImage: { width: 100, height: 100, backgroundColor: "#eee" },
  cardContent: { flex: 1, padding: 8 },
  cardTitle: { fontWeight: "bold", fontSize: 16 },
});
