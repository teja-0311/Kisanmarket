import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AddProducts = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [image, setImage] = useState(null);
  const [cropName, setCropName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [products, setProducts] = useState([]);

  const API_URL = "http://10.15.108.12:5000/api/products";

  // Load user + token
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        const savedToken = await AsyncStorage.getItem("token");

        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser?._id) {
            setUser(parsedUser);
            setToken(savedToken);
            setPhone(parsedUser.phone || "");
            fetchProducts(parsedUser._id, savedToken);
          }
        }
      } catch (err) {
        console.error("Error loading user:", err);
      }
    };
    loadUser();
  }, []);

  // Pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Fetch my products
  const fetchProducts = async (farmerId, jwt) => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (Array.isArray(res.data)) {
        const myProducts = res.data.filter((p) => {
          const id = typeof p.farmerId === "object" ? p.farmerId?._id : p.farmerId;
          return id?.toString() === farmerId?.toString();
        });
        setProducts(myProducts);
      }
    } catch (err) {
      console.error("❌ Fetch products error:", err.message);
    }
  };

  // Submit product
  const handleSubmit = async () => {
    if (!cropName || !description || !phone || !location || !price || !quantity || !image) {
      Alert.alert("⚠️ Missing Fields", "Please fill all fields and upload an image");
      return;
    }
    if (!user?._id || !token) {
      Alert.alert("⚠️ Error", "User not logged in");
      return;
    }

    const formData = new FormData();
    formData.append("cropName", cropName);
    formData.append("description", description);
    formData.append("phone", phone);
    formData.append("location", location);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("farmerId", user._id);
    formData.append("image", {
      uri: image,
      type: "image/jpeg",
      name: `product_${Date.now()}.jpg`,
    });

    try {
      const res = await axios.post(`${API_URL}/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("✅ Success", res.data.message || "Product added!");
      setCropName("");
      setDescription("");
      setLocation("");
      setPrice("");
      setQuantity("");
      setImage(null);

      fetchProducts(user._id, token);
    } catch (err) {
      console.error("❌ Upload error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.error || "Failed to add product");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>📦 Add Products</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imageText}>📸 Upload Product Image</Text>
        )}
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Crop Name" value={cropName} onChangeText={setCropName} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
      <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder="Price (₹)" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Quantity (Kg)" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>➕ Add Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddProducts;

const styles = StyleSheet.create({
  container: { paddingTop: 40,padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  imageText: { color: "#666" },
  imagePreview: { width: "100%", height: 180, borderRadius: 8 },
  button: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
