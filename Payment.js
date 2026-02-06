import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "http://10.15.108.12:5000/api/orders";

export default function Payment({ route, navigation }) {
  const cart = route.params?.cart; // Cart items if coming from Cart
  const product = route.params?.product; // Single product if coming from ProductDetails
  const [negotiatedPrice, setNegotiatedPrice] = useState("");
  const [message, setMessage] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (cart && cart.length > 0) {
      const total = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);
      setTotalPrice(total);
    } else if (product) {
      setTotalPrice(product.price * (product.cartQuantity || 1));
    }
  }, [cart, product]);

  const handleTokenExpiration = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    Alert.alert("Session Expired", "Please login again");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const handleOrder = async (type, item) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const user = JSON.parse(await AsyncStorage.getItem("user"));
      if (!token || !user) {
        handleTokenExpiration();
        return;
      }

      const payload = {
        productId: item._id,
        farmerId: item.farmerId._id || item.farmerId,
        customerId: user._id,
        type,
        negotiatedPrice,
        message,
      };

      const res = await axios.post(API_URL, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        Alert.alert("✅ Success", "Order placed successfully!");
        navigation.goBack();
      } else {
        Alert.alert("❌ Error", res.data.error || "Failed to place order");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        handleTokenExpiration();
        return;
      }
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>💳 Payment / Negotiation</Text>

      {cart && cart.length > 0 ? (
        <>
          <Text style={styles.subheading}>🛒 Cart Items:</Text>
          {cart.map((item) => (
            <View key={item._id} style={styles.item}>
              <Text>{item.cropName} × {item.cartQuantity} = ₹{item.price * item.cartQuantity}</Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#4caf50" }]}
                onPress={() => handleOrder("direct", item)}
              >
                <Text style={styles.btnText}>💳 Pay for this item</Text>
              </TouchableOpacity>
            </View>
          ))}
          <Text style={styles.total}>Total Cart Price: ₹{totalPrice}</Text>
        </>
      ) : product ? (
        <>
          <Text>Crop: {product.cropName}</Text>
          <Text>Price: ₹{product.price} / {product.quantity} kg</Text>
          <Text style={styles.total}>Total: ₹{totalPrice}</Text>

          <TextInput
            placeholder="Enter Negotiated Price (Optional)"
            value={negotiatedPrice}
            onChangeText={setNegotiatedPrice}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Message to Farmer (Optional)"
            value={message}
            onChangeText={setMessage}
            style={[styles.input, { height: 80 }]}
            multiline
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#4caf50" }]}
            onPress={() => handleOrder("direct", product)}
          >
            <Text style={styles.btnText}>✅  Purchase</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#f39c12" }]}
            onPress={() => handleOrder("negotiation", product)}
          >
            <Text style={styles.btnText}>🤝 Negotiate with Farmer</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={{ color: "red" }}>❌ No product data available</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {paddingTop: 40, flex: 1, padding: 20 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  subheading: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginBottom: 12 },
  button: { padding: 12, borderRadius: 8, marginTop: 8, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  item: { marginBottom: 12 },
  total: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
});
