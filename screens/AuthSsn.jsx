import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  SafeAreaView,
  Pressable,
  Alert,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import LottieView from "lottie-react-native";
import { supabase } from "../services/supabase";

export default function AuthSsn({ navigation, route }) {
  const [ssn, setSsn] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [modal, setModal] = useState(false);

  const { user, setUser } = useUser();

  let height = Dimensions.get("window").height;
  let width = Dimensions.get("window").width;

  const handleSsnChange = (text) => {
    const cleanedText = text.replace(/\D/g, "");
    setSsn(cleanedText.slice(-4));
  };

  const handleAccountNumberChange = (text) => {
    const cleanedText = text.replace(/\D/g, "");
    setAccountNumber(cleanedText);
  };

  const handleRoutingNumberChange = (text) => {
    const cleanedText = text.replace(/\D/g, "");
    setRoutingNumber(cleanedText);
  };

  const validateInputs = () => {
    if (!ssn || !accountNumber || !routingNumber) {
      Alert.alert("Missing Information", "Please fill in all the fields.");
      return false;
    }

    if (ssn.length !== 4) {
      Alert.alert("Invalid SSN", "Please enter the last 4 digits of your SSN.");
      return false;
    }

    if (accountNumber.length < 8 || accountNumber.length > 12) {
      Alert.alert(
        "Invalid Account Number",
        "Please enter a valid account number (8-12 digits)."
      );
      return false;
    }

    if (routingNumber.length !== 9) {
      Alert.alert(
        "Invalid Routing Number",
        "Please enter a valid 9-digit routing number."
      );
      return false;
    }

    return true;
  };

  const createAccount = async (resp) => {
    setModal(true);

    try {
      const response = await fetch("https://tizlyexpress.onrender.com/account", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          username: user.username,
          mcc: route.params.route.params.mcc.code,
          ssn: ssn,
          address: route.params.route.params.userInfo.address,
          city: route.params.route.params.userInfo.city,
          state: route.params.route.params.userInfo.state,
          firstName: route.params.route.params.userInfo.details.firstName,
          lastName: route.params.route.params.userInfo.details.lastName,
          zipCode: route.params.route.params.userInfo.zipCode,
          accountNumber: accountNumber,
          routingNumber: routingNumber,
          phoneNumber: phoneNumber,
          month: route.params.route.params.month,
          day: route.params.route.params.day,
          year: route.params.route.params.year,
        }),
      });

      if (!response.ok) {
        setModal(false);

        throw new Error(`HTTP error! Status: ${response.status}`);
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const json = await response.json();

          await editUsername(json);

          if (json.error) {
            Alert.alert(json.error);
            setModal(false);
          }
        } else {
          const text = await response.text();
          console.warn("Received non-JSON response:", text);
          setError("Unexpected response format.");
          setModal(false);
        }
      }
    } catch (error) {
      setModal(false);

      console.error("Error creating account:", error);
    }
  };

  const editUsername = async (json) => {
    const userId = supabase.auth.currentUser.id;
    const res = await supabase
      .from("profiles")
      .update({ stripeAccountId: json.account })
      .eq("user_id", userId);

    if (res.error) {
      console.log("ERROR", res.error);
      Alert.alert("Something Went Wrong");
      setModal(false);
    } else {
      setUser(res.data[0]);
      setModal(false);
      navigation.navigate("Post");
    }
  };

  const handleContinue = () => {
    if (validateInputs()) {
      createAccount();
    }
  };

  return (
    <>
      <SafeAreaView style={{ backgroundColor: "#4A3AFF" }}>
        <Pressable onPress={() => navigation.goBack()}>
          <Image
            style={{ aspectRatio: 1, height: 30, left: 20, marginBottom: 40 }}
            source={require("../assets/WhiteBack.png")}
          />
        </Pressable>
      </SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.heading}>Let's Get Your Payments Set Up!</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>xxx-xx-</Text>
          <TextInput
            style={styles.input}
            value={ssn}
            onChangeText={handleSsnChange}
            maxLength={4}
            keyboardType="numeric"
            placeholder="Last 4 of SSN"
            secureTextEntry
            accessibilityLabel="SSN Last 4 Digits"
            accessibilityHint="Enter the last 4 digits of your Social Security Number."
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={(item) => setPhoneNumber(item)}
            maxLength={10}
            keyboardType="numeric"
            placeholder="Phone Number"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={accountNumber}
            onChangeText={handleAccountNumberChange}
            maxLength={12}
            keyboardType="numeric"
            placeholder="Account Number"
            accessibilityLabel="Account Number"
            accessibilityHint="Enter your bank account number."
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={routingNumber}
            onChangeText={handleRoutingNumberChange}
            maxLength={9}
            keyboardType="numeric"
            placeholder="Routing Number"
            accessibilityLabel="Routing Number"
            accessibilityHint="Enter your bank routing number."
          />
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          style={{
            backgroundColor: "black",
            width: width * 0.8,
            height: height * 0.06,
            padding: 12,
            alignSelf: "center",
            borderRadius: 13,
            top: 0.07,
          }}
        >
          <Text
            style={{
              fontFamily: "Poppins-SemiBold",
              alignSelf: "center",
              fontSize: 18,
              color: "white",
            }}
          >
            Continue
          </Text>
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
    padding: 20,
    flex: 1,
    backgroundColor: "#4A3AFF",
  },
  heading: {
    fontSize: 22,
    color: "white",
    fontWeight: "800",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "white",
    borderRadius: 5,
  },
  prefix: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    color: "gray",
    width: 79,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
});
