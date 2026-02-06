// ForgotPasswordScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";

export default function ForgotPasswordScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone) {
      Alert.alert("Error", "Please enter your registered phone number");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert("Error", "Enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://10.15.108.12:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert("OTP Sent", "An OTP has been sent to your phone.", [
          {
            text: "OK",
            onPress: () => navigation.navigate("ResetPasswordScreen", { phone }),
          },
        ]);
      } else {
        Alert.alert("Error", data.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔑 Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your registered phone number</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="number-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 30, backgroundColor: "#f9f9f9" },
  title: { fontSize: 26, fontWeight: "bold", color: "#2e7d32", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 15, backgroundColor: "#fff" },
  button: { backgroundColor: "#4caf50", marginTop: 20, padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
