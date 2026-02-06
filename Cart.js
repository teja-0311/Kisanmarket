import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { useCart } from "../context/CartContext";

export default function Cart({ navigation }) {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);

  if (cart.length === 0)
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🧺 Your Cart</Text>
        <Text style={{ textAlign: "center", marginTop: 50 }}>Your cart is empty!</Text>
      </View>
    );

  const handleClearCart = () => {
    Alert.alert("Confirm", "Are you sure you want to clear your cart?", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: clearCart },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧺 Your Cart</Text>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.cropName}</Text>
              <Text>💰 {item.price} / {item.quantity}kg</Text>
              <Text>📍 {item.location}</Text>

              <View style={styles.quantityContainer}>
                <Text>Qty: </Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.productId, Math.max(1, item.cartQuantity - 1))}
                >
                  <Text style={styles.qtyText}>➖</Text>
                </TouchableOpacity>
                <Text style={{ marginHorizontal: 8 }}>{item.cartQuantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.productId, item.cartQuantity + 1)}
                >
                  <Text style={styles.qtyText}>➕</Text>
                </TouchableOpacity>
              </View>

              <Text>Total: ₹{item.price * item.cartQuantity}</Text>

              <TouchableOpacity onPress={() => removeFromCart(item.productId)}>
                <Text style={{ color: "red", fontWeight: "bold", marginTop: 5 }}>Remove</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#4caf50" }]}
                onPress={() => navigation.navigate("Payment", { product: item })}
              >
                <Text style={styles.btnText}>💳 Pay for this item</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Text style={styles.total}>Total: ₹{totalAmount}</Text>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#f44336" }]} onPress={handleClearCart}>
        <Text style={styles.btnText}>🗑️ Clear Cart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 40, flex: 1, backgroundColor: "#fff", padding: 15 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  item: { flexDirection: "row", marginBottom: 12, backgroundColor: "#f9f9f9", padding: 10, borderRadius: 10 },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  name: { fontSize: 16, fontWeight: "bold" },
  button: { padding: 10, borderRadius: 8, marginTop: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold" },
  quantityContainer: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  qtyBtn: { padding: 5, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 },
  qtyText: { fontSize: 18, fontWeight: "bold" },
  total: { fontSize: 20, fontWeight: "bold", textAlign: "right", marginTop: 10 },
});
