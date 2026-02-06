import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);

 const handleSendOtp = async () => {
  if (!name || !email || !phone || !password) {
    Alert.alert("Error", "Please fill all required fields");
    return;
  }

  if (password.length < 6) {
    Alert.alert("Error", "Password must be at least 6 characters long");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    Alert.alert("Error", "Please enter a valid email address");
    return;
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    Alert.alert("Error", "Enter a valid 10-digit phone number");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("http://10.15.108.12:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name, email, phone, password, role }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Signup failed");

    if (data.success) {
      // ✅ Fixed navigation: removed the dot after screen name
      Alert.alert(
        "OTP Sent 📱",
        "An OTP has been sent to your mobile number for verification.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("OtpVerificationScreen", {
                phone,
                email,
              }),
          },
        ]
      );
    } else {
      Alert.alert("Signup Failed", data.error || "Something went wrong");
    }
  } catch (err) {
    console.error("Signup error:", err);
    console.error("❌ Signup error details:", err.message);
    Alert.alert("Signup Failed", err.message || "Server error");
  } finally {
    setLoading(false);
  }
};


  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>🌱 Create Account</Text>
        <Text style={styles.subtitle}>Join Kisan Market today</Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Full Name *"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="Email *"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="Phone Number *"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
          <View style={{ position: "relative" }}>
            <TextInput
              placeholder="Password *"
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

          {/* Role Selector */}
          <Text style={styles.roleLabel}>I want to:</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "customer" ? styles.roleSelected : styles.roleUnselected,
              ]}
              onPress={() => setRole("customer")}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "customer"
                    ? styles.roleTextSelected
                    : styles.roleTextUnselected,
                ]}
              >
                🛒 Buy Products
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "farmer" ? styles.roleSelected : styles.roleUnselected,
              ]}
              onPress={() => setRole("farmer")}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "farmer"
                    ? styles.roleTextSelected
                    : styles.roleTextUnselected,
                ]}
              >
                🌾 Sell Products
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.linkContainer}
          >
            <Text style={styles.link}>
              Already have an account? <Text style={styles.linkBold}>Login</Text>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#2e7d32",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    color: "#666",
  },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  showButton: { position: "absolute", right: 15, top: 18 },
  roleLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 10,
    color: "#333",
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  roleButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 2,
  },
  roleSelected: { backgroundColor: "#e8f5e8", borderColor: "#4caf50" },
  roleUnselected: { backgroundColor: "#f5f5f5", borderColor: "#ddd" },
  roleText: { fontSize: 14, fontWeight: "600" },
  roleTextSelected: { color: "#2e7d32" },
  roleTextUnselected: { color: "#666" },
  button: {
    backgroundColor: "#4caf50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
  },
  buttonDisabled: { backgroundColor: "#a5d6a7" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  linkContainer: { marginTop: 20, alignItems: "center" },
  link: { color: "#666", fontSize: 16 },
  linkBold: { color: "#4caf50", fontWeight: "bold" },
});
