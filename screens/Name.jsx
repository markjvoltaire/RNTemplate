import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Pressable,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Name({ route, navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const type = route.params.type;

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
          onChangeText={setFirstName}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Your Last Name"
          value={lastName}
          onChangeText={setLastName}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => {
              type === "business"
                ? navigation.navigate("AddAddress", {
                    firstName,
                    lastName,
                    type,
                  })
                : navigation.navigate("NoAuthAddLocation", {
                    firstName,
                    lastName,
                    type,
                  });
            }}
            style={styles.button}
          >
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
  cityList: {
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "white",
    width: "100%",
    overflow: "hidden",
  },
  cityItem: {
    padding: 10,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
});
