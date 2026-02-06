import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl 
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.15.108.12:5000/api/orders";

const Orders = ({ navigation }) => {
  const [negotiatedOrders, setNegotiatedOrders] = useState([]);
  const [placedOrders, setPlacedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Handle token expiration
  const handleTokenExpiration = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    Alert.alert("Session Expired", "Please login again");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        handleTokenExpiration();
        return;
      }

      const res = await axios.get(`${API_URL}/farmer`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && Array.isArray(res.data)) {
        // Split orders
        setNegotiatedOrders(
          res.data.filter(o => o.type === "negotiation" && o.status === "pending")
        );
        setPlacedOrders(
          res.data.filter(o => o.type === "direct" || o.status !== "pending")
        );
      } else {
        setNegotiatedOrders([]);
        setPlacedOrders([]);
      }
    } catch (err) {
      console.error("❌ Error fetching orders:", err.response?.data || err.message);
      
      if (err.response?.data?.code === "TOKEN_EXPIRED" || err.response?.status === 401) {
        handleTokenExpiration();
        return;
      }
      
      Alert.alert("Error", "Failed to fetch orders");
      setNegotiatedOrders([]);
      setPlacedOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchOrders(); 
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        handleTokenExpiration();
        return;
      }

      await axios.put(
        `${API_URL}/${orderId}/status`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchOrders();
      Alert.alert("Success", `Order ${status}`);
    } catch (err) {
      console.error("❌ Error updating order:", err.response?.data || err.message);
      
      if (err.response?.data?.code === "TOKEN_EXPIRED" || err.response?.status === 401) {
        handleTokenExpiration();
        return;
      }
      
      Alert.alert("Error", "Failed to update order");
    }
  };

  const renderOrderCard = (item, showActions = false) => (
    <View style={styles.card}>
      <Text style={styles.cropName}>
        🌱 {item.productId?.cropName || "Unknown Crop"}
      </Text>
      <Text>📦 Quantity: {item.productId?.quantity || "N/A"} kg</Text>
      <Text>💰 Price: ₹{item.productId?.price || "N/A"}</Text>
      {item.negotiatedPrice && (
        <Text>🤝 Negotiated Price: ₹{item.negotiatedPrice}</Text>
      )}
      {item.message && (
        <Text style={styles.message}>💬 {item.message}</Text>
      )}
      <Text style={[
        styles.status,
        item.status === "accepted" && styles.statusAccepted,
        item.status === "rejected" && styles.statusRejected
      ]}>
        📊 Status: {item.status}
      </Text>

      {showActions && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.acceptButton]} 
            onPress={() => handleStatusChange(item._id, "accepted")}
          >
            <Text style={styles.btnText}>✅ Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.rejectButton]} 
            onPress={() => handleStatusChange(item._id, "rejected")}
          >
            <Text style={styles.btnText}>❌ Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🤝 Negotiation Requests</Text>
      
      {negotiatedOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending negotiations</Text>
        </View>
      ) : (
        <FlatList 
          data={negotiatedOrders} 
          keyExtractor={item => item._id} 
          renderItem={({ item }) => renderOrderCard(item, true)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchOrders();
              }}
              colors={["#4caf50"]}
            />
          }
        />
      )}

      <Text style={[styles.heading, styles.placedHeading]}>
        🛒 Order History
      </Text>
      
      {placedOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No order history</Text>
        </View>
      ) : (
        <FlatList 
          data={placedOrders} 
          keyExtractor={item => item._id} 
          renderItem={({ item }) => renderOrderCard(item, false)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchOrders();
              }}
              colors={["#4caf50"]}
            />
          }
        />
      )}
    </View>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: { 
    paddingTop: 40,
    flex: 1, 
    padding: 20, 
    backgroundColor: "#f9f9f9" 
  },
  heading: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 15,
    color: "#333"
  },
  placedHeading: {
    marginTop: 25
  },
  card: { 
    backgroundColor: "#fff", 
    padding: 16, 
    marginBottom: 12, 
    borderRadius: 12, 
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cropName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2e7d32"
  },
  message: {
    fontStyle: "italic",
    color: "#666",
    marginTop: 4
  },
  status: {
    fontWeight: "600",
    marginTop: 8
  },
  statusAccepted: {
    color: "#4caf50"
  },
  statusRejected: {
    color: "#f44336"
  },
  actionsContainer: { 
    flexDirection: "row", 
    marginTop: 12,
    justifyContent: "space-between"
  },
  button: { 
    padding: 12,
    borderRadius: 8, 
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4
  },
  acceptButton: {
    backgroundColor: "#4caf50"
  },
  rejectButton: {
    backgroundColor: "#f44336"
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 14
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12
  },
  emptyText: {
    color: "#666",
    fontSize: 16
  }
});