// cDashboard.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const cDashboard = ({ navigation, route }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }

      const res = await axios.get("http://10.15.108.12:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch products");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (route.params?.filters) {
      const { cropName, minPrice, maxPrice } = route.params.filters;

      const filtered = products.filter((p) => {
        const cropMatch = cropName
          ? p.cropName.toLowerCase().includes(cropName.toLowerCase())
          : true;
        const priceMatch =
          (minPrice ? p.price >= minPrice : true) &&
          (maxPrice ? p.price <= maxPrice : true);
        return cropMatch && priceMatch;
      });

      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [route.params?.filters, products]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} >
      {/* Header with Menu + Products Heading + Icons */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
          <Ionicons name="menu" size={28} color="#4caf50" />
        </TouchableOpacity>

        <Text style={styles.heading}>🛒 Products</Text>

        <View style={styles.icons}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("FiltersScreen", {
                filters: route.params?.filters || {},
              })
            }
          >
            <Ionicons name="filter" size={24} color="#4caf50" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
            <Ionicons name="cart" size={24} color="#4caf50" />
          </TouchableOpacity>
        </View>
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.center}>
          <Text>No products match your filters.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchProducts();
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("ProductDetails", { product: item })
              }
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.productImage}
              />
              <View style={styles.details}>
                <Text style={styles.name}>{item.cropName}</Text>
                <Text numberOfLines={2}>{item.description}</Text>
                <Text>💰 {item.price} / {item.quantity} kg</Text>
                <Text>📍 {item.location}</Text>
                <Text>📞 {item.phone}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default cDashboard;

const styles = StyleSheet.create({
  container: { paddingTop: 40,flex: 1, padding: 15, backgroundColor: "#f9f9f9" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  heading: { fontSize: 22, fontWeight: "bold", flex: 1, textAlign: "center" },
  icons: { flexDirection: "row" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
  },
  iconBtn: { marginHorizontal: 8 },
  productImage: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  details: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
