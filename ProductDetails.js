import React from "react";
import { useCart } from "../context/CartContext";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";

export default function ProductDetails({ route, navigation }) {
  const product = route?.params?.product;
  const { addToCart, loading } = useCart();

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "red" }}>❌ Product data not found</Text>
      </View>
    );
  }

  const handleAddToCart = () => {
    if (loading) return; // prevent adding before cart is loaded
    addToCart(product);
    Alert.alert("✅ Added", `${product.cropName} added to your cart!`);
  };

  const handleBuyNow = () => {
    navigation.navigate("Payment", { product });
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <Text style={styles.title}>{product.cropName}</Text>
      <Text>{product.description}</Text>
      <Text>💰 {product.price} / 1 kg</Text>
      <Text>📍 {product.location}</Text>
      <Text>📞 {product.phone}</Text>

      <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
        <Text style={styles.btnText}>🛒 Add to Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#4caf50" }]}
        onPress={handleBuyNow}
      >
        <Text style={styles.btnText}>💳 Buy Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 80, flex: 1, padding: 20, backgroundColor: "#fff" },
  image: { width: "100%", height: 200, borderRadius: 10, marginBottom: 15 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  button: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#2196f3",
    marginTop: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
