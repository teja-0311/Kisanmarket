import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.15.108.12:5000/api/orders";

const Earnings = () => {
  const [orders, setOrders] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const fetchEarnings = async () => {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${API_URL}/farmer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
      let sum = 0;
      res.data.forEach((o) => {
        if (o.status === "Completed") {
          sum += o.totalAmount;
        }
      });
      setTotalEarnings(sum);
    };
    fetchEarnings();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>💰 Earnings</Text>
      <Text style={styles.total}>Total Earnings: ₹{totalEarnings}</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Crop: {item.productName}</Text>
            <Text>Amount: ₹{item.totalAmount}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default Earnings;

const styles = StyleSheet.create({
  container: { paddingTop: 40,flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  total: { fontSize: 20, fontWeight: "600", marginBottom: 15 },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
});
