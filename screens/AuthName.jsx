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

export default function AuthName({ route, navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");

  const validateName = (name) => {
    const nameRegex = /^[A-Za-z]+$/; // Ensures the name contains only alphabetic characters
    if (name.length === 0) {
      return "Name cannot be empty.";
    } else if (!nameRegex.test(name)) {
      return "Name can only contain letters.";
    } else if (name.length < 2) {
      return "Name should be at least 2 characters long.";
    }
    return "";
  };

  const handleNext = () => {
    const firstNameValidation = validateName(firstName);
    const lastNameValidation = validateName(lastName);

    setFirstNameError(firstNameValidation);
    setLastNameError(lastNameValidation);

    if (!firstNameValidation && !lastNameValidation) {
      navigation.navigate("AuthAddress", {
        firstName,
        lastName,
      });
    } else {
      Alert.alert(
        "Validation Error",
        "Please correct the errors before proceeding."
      );
    }
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
        <Text style={styles.header}>Let's Get to Know You</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Your First Name"
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            setFirstNameError(""); // Clear the error when the user starts typing
          }}
        />
        {firstNameError ? (
          <Text style={styles.errorText}>{firstNameError}</Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Enter Your Last Name"
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            setLastNameError(""); // Clear the error when the user starts typing
          }}
        />
        {lastNameError ? (
          <Text style={styles.errorText}>{lastNameError}</Text>
        ) : null}

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleNext} style={styles.button}>
            <Text style={styles.buttonText}>Next</Text>
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
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "white",
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
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
});
