import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
  Image,
} from "react-native";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";
import LottieView from "lottie-react-native";

export default function Settings({ navigation }) {
  const { user, setUser } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function getUser(userid) {
    const resp = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userid)
      .single();

    return resp;
  }

  async function editAccountType() {
    const userId = supabase.auth.currentUser.id;

    const res = await supabase
      .from("profiles")
      .update({
        type: user.type === "business" ? "personal" : "business",
      })
      .eq("user_id", userId);

    if (!res.error) {
      setUser(res.data[0]);
    } else {
      console.error("ERROR", res.error);
      Alert.alert("Something Went Wrong");
    }

    return res;
  }

  async function loginWithEmail() {
    setLoading(true);
    const { user, error } = await supabase.auth.signIn({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert(error.message);
    } else {
      const resp = await getUser(user.id);
      supabase.auth.setAuth(user.access_token);
      setUser(resp.data);
      setModalVisible(false);
    }
  }

  const logUserIn = () => {
    loginWithEmail();
  };

  async function signOutUser() {
    await supabase.auth.signOut();
    setUser(null);
  }

  const handleLogOut = async () => {
    setLoading(true);
    await signOutUser();
    setLoading(false);
    navigation.navigate("HomeScreen");
  };

  const handleAuth = () => {
    user ? handleLogOut() : setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {user && (
        <>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditProfile")}
            style={styles.optionContainer}
          >
            <Image
              source={require("../assets/profileActive.png")}
              style={styles.icon}
            />
            <Text style={styles.optionText}>Account settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("MyServices")}
            style={styles.optionContainer}
          >
            <Image
              source={require("../assets/Calendar.png")}
              style={styles.icon}
            />
            <Text style={styles.optionText}>My services</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditProfile")}
            style={styles.optionContainer}
          >
            <Image
              source={require("../assets/PlusActive.png")}
              style={styles.icon}
            />
            <Text style={styles.optionText}>Invite a friend</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditProfile")}
            style={styles.optionContainer}
          >
            <Image
              source={require("../assets/MessageActive.png")}
              style={styles.icon}
            />
            <Text style={styles.optionText}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => editAccountType()}
            style={styles.optionContainer}
          >
            <Image source={require("../assets/info.png")} style={styles.icon} />
            <Text style={styles.optionText}>
              {user.type === "personal"
                ? "Switch to business account"
                : "Switch to personal account"}
            </Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={handleAuth}>
        <Text style={styles.logoutButtonText}>
          {user ? "Log out" : "Log in"}
        </Text>
      </TouchableOpacity>
      {loading && (
        <Modal visible={loading} transparent={true} animationType="slide">
          <View style={styles.loaderContainer}>
            <LottieView
              style={styles.loader}
              source={require("../assets/lottie/grey-loader.json")}
              autoPlay
            />
          </View>
        </Modal>
      )}
      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Login or Sign Up</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor="grey"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholderTextColor="grey"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.loginButton} onPress={logUserIn}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
          <View style={styles.signupContainer}>
            <Text>Don't have an account?</Text>
            <Button
              title="Sign Up"
              onPress={() => {
                // Add your sign up functionality here
              }}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              navigation.navigate("ResetPassword");
            }}
          >
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
          <Button
            title="Not Yet"
            onPress={() => setModalVisible(false)}
            color="grey"
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    paddingVertical: 25,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  optionText: {
    fontSize: 18,
    fontWeight: "500",
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#2BA5FE",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  loader: {
    height: 130,
    width: 130,
  },
  modalContent: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "#F3F3F9",
  },
  loginButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "stretch",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  forgotPassword: {
    color: "#007AFF",
    fontSize: 16,
    marginBottom: 20,
  },
});
