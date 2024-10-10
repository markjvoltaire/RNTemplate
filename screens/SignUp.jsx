import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Pressable,
  Image,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUp({ route, navigation }) {
  console.log("route", route);
  const { user, setUser } = useUser();
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [modal, setModal] = useState(false);
  const [userCred, setUserCred] = useState();

  const signUpWithEmail = async () => {
    setModal(true);
    // Input validation
    if (password.length < 8) {
      Alert.alert("Password should be 8 or more characters");
      console.log("LINE 28");
      setModal(false);
      return;
    }

    if (!email) {
      Alert.alert("Please fill in all field inputs");
      console.log("LINE 35");
      setModal(false);

      return;
    }

    try {
      const { user, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (!error) {
        const userId = supabase.auth.currentUser.id;
        const resp = await supabase.from("profiles").insert([
          {
            username: username,
            user_id: userId,
            email: email,
            type: route.params.type,
            city: route.params.city,
            state: route.params.state,
            latitude: route.params.latitude,
            longitude: route.params.longitude,
          },
        ]);

        setUser(resp.body[0]);
        // await createAccount(resp.body[0]);

        return resp;
      } else {
        console.log("LINE 67");
        setModal(false);
        Alert.alert(error.message);
        console.error("Error during sign-up:", error);
      }

      return { user, error };
    } catch (error) {
      console.log("LINE 75");
      setModal(false);
      console.error("An error occurred during sign-up:", error);
      Alert.alert("An error occurred. Please try again later.");

      return { user: null, error };
    }
  };

  // const createAccount = async (resp) => {
  //   setModal(true);

  //   try {
  //     const response = await fetch("http://localhost:8080/account", {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         email: email,
  //         userId: resp.user_id,
  //         username: resp.username,
  //         email: resp.email,
  //       }),
  //     });

  //     if (!response.ok) {
  //       console.log("response", response);
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }

  //     const contentType = response.headers.get("content-type");
  //     if (contentType && contentType.includes("application/json")) {
  //       const json = await response.json();

  //       if (json.account) {
  //         try {
  //           const res = await supabase
  //             .from("profiles")
  //             .select("*")
  //             .eq("user_id", resp.user_id)
  //             .single()
  //             .limit(1);
  //           setUser(res.body);
  //           return res.body ?? null;
  //         } catch (error) {
  //           console.error("Failed to fetch user:", error);
  //           return null;
  //         }
  //       }

  //       if (json.error) {
  //         Alert.alert(json.error);
  //       }
  //     } else {
  //       const text = await response.text();
  //       console.warn("Received non-JSON response:", text);
  //       setError("Unexpected response format.");
  //     }
  //   } catch (error) {
  //     console.error("Error creating account:", error);
  //   }
  // };

  const handleSignUp = async () => {
    await signUpWithEmail();
  };

  return (
    <>
      <SafeAreaView
        style={{ backgroundColor: "#4A3AFF", padding: 15, height: 10 }}
      >
        <View style={{ width: 90 }}>
          <Pressable onPress={() => navigation.goBack()}>
            <Image
              style={{ aspectRatio: 1, height: 30 }}
              source={require("../assets/WhiteBack.png")}
            />
          </Pressable>
        </View>
      </SafeAreaView>
      <View style={styles.container}>
        <Text
          style={{
            fontSize: 25,
            marginBottom: 30,
            color: "white",
            fontWeight: "800",
            width: "100%",
          }}
        >
          Complete your registration and start exploring!
        </Text>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholderTextColor="#A0A0A0"
            placeholder="Name"
            value={username}
            onChangeText={(text) => setUserName(text)}
          />

          <TextInput
            style={styles.input}
            placeholderTextColor="#A0A0A0"
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => setEmail(text)}
          />

          <TextInput
            style={styles.input}
            placeholderTextColor="#A0A0A0"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={(text) => setPassword(text)}
          />

          <TouchableOpacity
            onPress={() => handleSignUp()}
            style={styles.signupButton}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => {
            navigation.navigate("Login");
          }}
        >
          <Text style={styles.forgotPasswordText}>Login Here</Text>
        </TouchableOpacity>

        <Modal animationType={"fade"} visible={modal}>
          <View style={{ flex: 1, backgroundColor: "#4A3AFF" }}>
            <View style={{ top: 200 }}>
              <LottieView
                autoPlay
                style={{ height: 300, width: 300, alignSelf: "center" }}
                source={require("../assets/lottie/3Dots.json")}
              />
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A3AFF",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  forgotPassword: {
    marginBottom: 20,
    alignSelf: "center",
  },
  forgotPasswordText: {
    color: "#4A3AFF",
    fontSize: 16,
  },
  formContainer: {
    width: "100%",
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "#E8E8E8",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#FAFAFA",
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: "black",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
