import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";

const FiltersScreen = ({ navigation, route }) => {
  const initialFilters = route.params?.filters || {
    cropName: "",
    minPrice: "",
    maxPrice: "",
  };

  const [cropName, setCropName] = useState(initialFilters.cropName || "");
  const [minPrice, setMinPrice] = useState(
    initialFilters.minPrice !== undefined ? initialFilters.minPrice.toString() : ""
  );
  const [maxPrice, setMaxPrice] = useState(
    initialFilters.maxPrice !== undefined ? initialFilters.maxPrice.toString() : ""
  );

  const applyFilters = () => {
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      Alert.alert("Invalid Price Range", "Min price cannot exceed max price");
      return;
    }

    navigation.navigate("DashboardHome", {
      filters: {
        cropName,
        minPrice: minPrice ? Number(minPrice) : 0,
        maxPrice: maxPrice ? Number(maxPrice) : 5000,
      },
    });
  };

  const resetFilters = () => {
    setCropName("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>🔍 Filter Products</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Crop Name</Text>
        <TextInput
          placeholder="e.g., Tomato, Wheat"
          value={cropName}
          onChangeText={setCropName}
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Price Range</Text>
        <View style={styles.priceContainer}>
          <TextInput
            placeholder="Min"
            keyboardType="numeric"
            value={minPrice}
            onChangeText={setMinPrice}
            style={[styles.input, styles.priceInput]}
          />
          <Text style={styles.toText}>to</Text>
          <TextInput
            placeholder="Max"
            keyboardType="numeric"
            value={maxPrice}
            onChangeText={setMaxPrice}
            style={[styles.input, styles.priceInput]}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
        <Text style={styles.buttonText}>Apply Filters</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
        <Text style={styles.resetText}>Reset Filters</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default FiltersScreen;

const styles = StyleSheet.create({
  container: {paddingTop: 40, padding: 20, backgroundColor: "#f9f9f9", flexGrow: 1 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 25, color: "#2e7d32" },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, backgroundColor: "#fff" },
  priceContainer: { flexDirection: "row", alignItems: "center" },
  priceInput: { flex: 1 },
  toText: { marginHorizontal: 10, fontSize: 16 },
  applyButton: { backgroundColor: "#4caf50", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  resetButton: { padding: 15, borderRadius: 8, alignItems: "center", marginTop: 15, borderWidth: 1, borderColor: "#4caf50" },
  resetText: { color: "#4caf50", fontWeight: "bold", fontSize: 16 },
});
