import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";

const AiAssistantCard = () => {
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  // ✅ Fixed function name and variable consistency
  const askAI = async () => {
    if (!question.trim()) {
      Alert.alert("Error", "Please enter a question");
      return;
    }

    try {
      setLoading(true);
      
      // Add user message to chat
      const userMessage = { role: "user", text: question };
      setChat(prev => [...prev, userMessage]);
      
      // Clear input
      setQuestion("");

      const res = await axios.post("http://10.15.108.12:5000/api/ai", {
        query: question, // ✅ Fixed: use 'question' instead of 'query'
        language,
      });

      // Add AI response to chat
      const aiMessage = { role: "ai", text: res.data.reply };
      setChat(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error("❌ AI Error:", err);
      
      // Add error message to chat
      const errorMessage = { 
        role: "ai", 
        text: "Sorry, AI service is unavailable right now. Please try again later." 
      };
      setChat(prev => [...prev, errorMessage]);
      
      Alert.alert("Error", "Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Clear chat history
  const clearChat = () => {
    setChat([]);
    setQuestion("");
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI Farming Assistant</Text>
        <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Language Selector */}
      <View style={styles.langRow}>
        <Text style={styles.langLabel}>Language: </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={language}
            style={styles.picker}
            onValueChange={(val) => setLanguage(val)}
            dropdownIconColor="#4caf50"
          >
            <Picker.Item label="English" value="en" />
            <Picker.Item label="हिन्दी (Hindi)" value="hi" />
            <Picker.Item label="తెలుగు (Telugu)" value="te" />
            <Picker.Item label="தமிழ் (Tamil)" value="ta" />
          </Picker>
        </View>
      </View>

      {/* Chat Box */}
      <ScrollView style={styles.chatBox} showsVerticalScrollIndicator={false}>
        {chat.length === 0 ? (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyText}>
              Ask me about crops, fertilizers, pest control, weather advice, or any farming-related questions!
            </Text>
          </View>
        ) : (
          chat.map((msg, i) => (
            <View
              key={i}
              style={[
                styles.messageContainer,
                msg.role === "user" ? styles.userContainer : styles.aiContainer
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.role === "user" ? styles.userText : styles.aiText
                ]}
              >
                {msg.text}
              </Text>
            </View>
          ))
        )}
        {loading && (
          <View style={[styles.messageContainer, styles.aiContainer]}>
            <ActivityIndicator size="small" color="#4caf50" />
            <Text style={[styles.messageText, styles.aiText]}>
              AI is thinking...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask about crops, fertilizers, weather..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[
            styles.btn, 
            (loading || !question.trim()) && styles.btnDisabled
          ]} 
          onPress={askAI}
          disabled={loading || !question.trim()}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.btnText}>Ask</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AiAssistantCard;

const styles = StyleSheet.create({
  card: {
    paddingTop:40,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 40,
    marginHorizontal: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#2e7d32" 
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
  },
  clearText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
  },
  langRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 12 
  },
  langLabel: { 
    fontWeight: "bold", 
    color: "#333",
    fontSize: 14 
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginLeft: 8,
  },
  picker: {
    height: 40,
  },
  chatBox: { 
    maxHeight: 300,
    minHeight: 100,
    marginBottom: 12,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 8,
  },
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
  messageContainer: {
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    maxWidth: "85%",
  },
  userContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#e3f2fd",
    borderBottomRightRadius: 4,
  },
  aiContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f8e9",
    borderBottomLeftRadius: 4,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: "#1565c0",
  },
  aiText: {
    color: "#33691e",
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    fontSize: 14,
    backgroundColor: "#fafafa",
    maxHeight: 100,
    textAlignVertical: "top",
  },
  btn: { 
    backgroundColor: "#4caf50", 
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    backgroundColor: "#a5d6a7",
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 14,
  },
});