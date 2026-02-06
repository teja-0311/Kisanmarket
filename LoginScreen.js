import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, Alert,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Auto login if user already logged in
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const token = await AsyncStorage.getItem("token");

        if (userData && token) {
          const parsed = JSON.parse(userData);
          if (parsed.role === "farmer") {
            navigation.reset({ index: 0, routes: [{ name: "FarmerDashboard" }] });
          } else {
            navigation.reset({ index: 0, routes: [{ name: "CustomerDashboard" }] });
          }
        }
      } catch (error) {
        console.error("Error checking login:", error);
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("token");
      } finally {
        setCheckingLogin(false);
      }
    };
    checkLogin();
  }, []);

  // ✅ Handle login
  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://10.15.108.12:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Login failed");

      if (data.success) {
        // ✅ Save user details for CartContext
        await AsyncStorage.setItem(
          "user",
          JSON.stringify({
            name: data.user.name,
            phone: data.user.phone,
            location: data.user.location,
            role: data.user.role,
          })
        );
        await AsyncStorage.setItem("token", data.token);

        Alert.alert("✅ Success", "Login successful!");

        if (data.user.role === "farmer") {
          navigation.reset({ index: 0, routes: [{ name: "FarmerDashboard" }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: "CustomerDashboard" }] });
        }
      } else {
        Alert.alert("Login Failed", data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("Login Failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (checkingLogin) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>🌾 Welcome to Kisan Market</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="number-pad"
            maxLength={10}
            placeholderTextColor="#999"
          />

          <View style={{ position: "relative" }}>
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.showButton}
              onPress={() => setShowPassword((prev) => !prev)}
            >
              <Text style={{ color: "#4caf50", fontWeight: "bold" }}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={styles.linkContainer}>
            <Text style={styles.link}>
              Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPasswordScreen")}
            style={styles.linkContainer}
          >
            <Text style={[styles.link, { color: "#4caf50", marginTop: 10 }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10, textAlign: "center", color: "#2e7d32" },
  subtitle: { fontSize: 16, marginBottom: 30, textAlign: "center", color: "#666" },
  form: { backgroundColor: "#fff", padding: 20, borderRadius: 12, elevation: 3 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 15, marginVertical: 8, borderRadius: 8, fontSize: 16 },
  button: { backgroundColor: "#4caf50", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 15 },
  buttonDisabled: { backgroundColor: "#a5d6a7" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  linkContainer: { marginTop: 20, alignItems: "center" },
  link: { color: "#666", fontSize: 16 },
  linkBold: { color: "#4caf50", fontWeight: "bold" },
  showButton: { position: "absolute", right: 15, top: 18 },
});
