// fDashboard.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;
const API_URL = "http://10.15.108.12:5000/api/orders";

const FDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [language, setLanguage] = useState("en");

  const navigation = useNavigation();

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

      const orders = res.data || [];
      const monthlySales = Array(12).fill(0);
      const monthlyRevenue = Array(12).fill(0);

      orders.forEach((order) => {
        if (!order.createdAt) return;
        const month = new Date(order.createdAt).getMonth();

        monthlySales[month] += 1;

        let revenue = 0;
        if (order.negotiatedPrice) {
          const negotiated = parseFloat(order.negotiatedPrice);
          revenue = isNaN(negotiated) ? 0 : negotiated;
        } else if (order.productId) {
          const price = parseFloat(order.productId?.price || 0);
          const quantity = parseFloat(order.productId?.quantity || 0);
          if (!isNaN(price) && !isNaN(quantity)) revenue = price * quantity;
        }

        monthlyRevenue[month] += revenue;
      });

      setSalesData(monthlySales);
      setRevenueData(monthlyRevenue);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch analytics data");
      setSalesData(Array(12).fill(0));
      setRevenueData(Array(12).fill(0));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const askAI = async () => {
    if (!query.trim()) return;
    try {
      setLoadingAI(true);
      const res = await axios.post("http://10.15.108.12:5000/api/ai", {
        query,
        language,
      });
      setAnswer(res.data.reply);
    } catch (err) {
      console.error(err);
      setAnswer("AI service is unavailable right now.");
    } finally {
      setLoadingAI(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text>Loading analytics...</Text>
      </View>
    );
  }

  const monthLabels = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
            <Ionicons name="menu" size={28} color="#4caf50" />
          </TouchableOpacity>
          <Text style={styles.heading}>📊 Analytics Dashboard</Text>
          <View style={{ width: 28 }} /> {/* placeholder for alignment */}
        </View>

        {/* Sales Line Chart */}
        <Text style={styles.subHeading}>🛒 Monthly Orders</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Orders")}>
          <LineChart
            data={{ labels: monthLabels, datasets: [{ data: salesData }] }}
            width={screenWidth - 30}
            height={220}
            yAxisSuffix=" orders"
            chartConfig={{
              backgroundColor: "#4caf50",
              backgroundGradientFrom: "#81c784",
              backgroundGradientTo: "#388e3c",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
              labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
            }}
            style={styles.chart}
          />
        </TouchableOpacity>

        {/* Revenue Bar Chart */}
        <Text style={styles.subHeading}>💰 Monthly Revenue (₹)</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Orders")}>
          <BarChart
            data={{ labels: monthLabels, datasets: [{ data: revenueData }] }}
            width={screenWidth - 30}
            height={250}
            yAxisLabel="₹"
            chartConfig={{
              backgroundColor: "#2196f3",
              backgroundGradientFrom: "#64b5f6",
              backgroundGradientTo: "#1976d2",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
              labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
            }}
            style={styles.chart}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* AI Assistant */}
      <View style={styles.aiCardFloating}>
        <Text style={styles.aiHeading}>🤖 Saathiya</Text>

        <Picker
          selectedValue={language}
          style={styles.picker}
          onValueChange={(val) => setLanguage(val)}
        >
          <Picker.Item label="English" value="en" />
          <Picker.Item label="Hindi" value="hi" />
          <Picker.Item label="Telugu" value="te" />
          <Picker.Item label="Tamil" value="ta" />
        </Picker>

        <TextInput
          style={styles.aiInput}
          placeholder="Ask about crops, fertilizers..."
          value={query}
          onChangeText={setQuery}
        />

        <TouchableOpacity style={styles.aiButton} onPress={askAI}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Ask AI</Text>
        </TouchableOpacity>

        {loadingAI ? (
          <ActivityIndicator size="small" color="#4caf50" />
        ) : (
          answer !== "" && (
            <View style={styles.answerBox}>
              <ScrollView nestedScrollEnabled>
                <Text style={styles.answerText}>{answer}</Text>
              </ScrollView>
            </View>
          )
        )}
      </View>
    </View>
  );
};

export default FDashboard;

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flexGrow: 1,
    padding: 15,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
    paddingHorizontal: 5,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
    alignSelf: "flex-start",
  },
  chart: {
    borderRadius: 12,
    marginVertical: 10,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  aiHeading: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  aiInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
  aiButton: { backgroundColor: "#4caf50", padding: 10, alignItems: "center", borderRadius: 8, marginBottom: 10 },
  picker: { height: 50, width: "100%", marginBottom: 10 },
  answerBox: { marginTop: 10, backgroundColor: "#f0f0f0", padding: 10, borderRadius: 8, maxHeight: 150 },
  answerText: { fontSize: 16 },
  aiCardFloating: {
    position: "absolute",
    bottom: 5,
    right: 20,
    width: 280,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 5,
  },
});
