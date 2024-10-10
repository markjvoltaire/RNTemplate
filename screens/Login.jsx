import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Button,
  Alert,
  Image,
} from "react-native";
import React, { useState } from "react";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";

export default function Login({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [signUpModal, setSignUpModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useUser();
  const [loading, setLoading] = useState(true);

  async function getUser(userid) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userid)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  async function loginWithEmail() {
    try {
      const { user, error } = await supabase.auth.signIn({ email, password });

      if (error) {
        Alert.alert(error.message);
      } else {
        const userData = await getUser(user.id);
        if (userData) {
          supabase.auth.setAuth(user.access_token);
          setUser(userData);
          setModalVisible(false);
        } else {
          Alert.alert("User not found.");
        }
      }
    } catch (error) {
      Alert.alert("Error during login:", error.message);
    }
  }

  const logUserIn = () => {
    loginWithEmail();
  };

  return (
    <SafeAreaView style={styles.modalView}>
      <View style={{ marginBottom: 30 }} />

      <Text
        style={{
          alignSelf: "center",
          fontFamily: "Poppins-Black",
          color: "#4A3AFF",
          fontSize: 45,
          marginBottom: 10,
        }}
      >
        tizly
      </Text>

      <TextInput
        style={styles.input}
        placeholderTextColor="grey"
        autoCapitalize="none"
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="grey"
        placeholder="Password"
        autoCapitalize="none"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      <TouchableOpacity style={styles.submitButton} onPress={logUserIn}>
        <Text style={styles.submitButtonText}>Log In</Text>
      </TouchableOpacity>
      <View style={styles.signUpContainer}></View>
      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => {
          setModalVisible(false);
          navigation.navigate("ResetPassword");
        }}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => {
          navigation.navigate("ProfileType");
        }}
      >
        <Text style={styles.forgotPasswordText}>Create an account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A3AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    color: "white",
    fontWeight: "900",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 18,
    color: "white",
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  loginButtonText: {
    color: "#4A3AFF",
    fontSize: 18,
    fontWeight: "600",
  },
  modalView: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#4A3AFF",
  },
  input: {
    height: 50,
    width: "95%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: "#F3F3F9",
    fontSize: 16,
    color: "black",
  },
  submitButton: {
    backgroundColor: "#4A3AFF",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  signUpText: {
    marginRight: 5,
    fontSize: 16,
    color: "#4A3AFF",
  },
  forgotPassword: {
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#4A3AFF",
    fontSize: 16,
  },
});
