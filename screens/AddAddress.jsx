import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NoAuthAddLocation({ route, navigation }) {
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [zipCodeError, setZipCodeError] = useState("");


  const details = route.params;

  // Define text variables
  const headerText = "Where Are You Located? Let’s Pin Your Spot!";
  const buttonText = "Next";
  const errorText = "Please select a city.";

  const handleCityChange = (text) => {
    setAddress(text);
  };

  const handleZipCodeChange = (text) => {
    setZipCode(text);
    if (zipCodeError) {
      validateZipCode(text);
    }
  };

  const validateZipCode = (code) => {
    const zipCodePattern = /^\d{5}$/; // A basic pattern to match a 5-digit ZIP code
    if (!zipCodePattern.test(code)) {
      setZipCodeError("Please enter a valid 5-digit ZIP code.");
      return false;
    }
    setZipCodeError("");
    return true;
  };

  const handleNext = () => {
    if (!validateZipCode(zipCode)) {
      return;
    }
    navigation.navigate("AddCity", {
      details,
      address,
      zipCode,
    });
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
        <Text style={styles.header}>{headerText}</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Street Address"
          value={address}
          onChangeText={handleCityChange}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Zip Code"
          value={zipCode}
          keyboardType="number-pad"
          onChangeText={handleZipCodeChange}
        />

        {zipCodeError ? (
          <Text style={styles.errorText}>{zipCodeError}</Text>
        ) : null}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A3AFF",
    padding: 10,
    paddingBottom: 180,
  },
  header: {
    fontSize: 25,
    marginBottom: 30,
    color: "white",
    fontWeight: "800",
    width: "100%",
  },
  button: {
    backgroundColor: "black",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: 50,
    fontSize: 18,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 26,
    borderRadius: 8,
    backgroundColor: "white",
    fontWeight: "600",
  },
  buttonContainer: {
    marginTop: 16,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 20,
  },
});
