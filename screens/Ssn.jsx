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
} from "react-native";
import React, { useState } from "react";

export default function FinancialInfo({ navigation, route }) {
  const [ssn, setSsn] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");

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

  const handleContinue = () => {
    if (validateInputs()) {
      navigation.navigate("BusinessSignUp", {
        route,
        accountNumber,
        routingNumber,
        ssn,
      });
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
