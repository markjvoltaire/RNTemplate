import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser } = useUser();

  let height = Dimensions.get("window").height;
  let width = Dimensions.get("window").width;

  async function getUser(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  const handleLogin = async () => {
    try {
      const { user, session, error } = await supabase.auth.signIn({
        email,
        password,
      });

      if (error) {
        Alert.alert(error.message);
      } else {
        const profile = await getUser(user.id);
        if (profile) {
          setUser(profile);
          // Assuming you want to set the session
          supabase.auth.setSession(session);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login failed", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={{
            backgroundColor: "black",
            width: width * 0.8,
            height: height * 0.06,
            padding: 12,
            alignSelf: "center",
            borderRadius: 13,
            top: height * 0.04,
          }}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A3AFF",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 40,
    color: "#fff",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  button: {
    width: "100%",
    padding: 15,
    alignItems: "center",
    backgroundColor: "#003f5c",
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    alignSelf: "center",
    fontWeight: "700",
  },
});
