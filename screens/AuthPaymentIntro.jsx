import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import LottieView from "lottie-react-native";

export default function AuthPaymentIntro({ navigation, route }) {
  let height = Dimensions.get("window").height;
  let width = Dimensions.get("window").width;
  return (
    <>
      <SafeAreaView style={styles.safeArea} />
      <View style={styles.container}>
        <View style={styles.backButtonContainer}>
          {/* <Pressable onPress={() => navigation.goBack()}>
            <Image
              style={{
                height: 20,

                resizeMode: "contain",
                right: 25,
              }}
              source={require("../assets/backArrow.png")}
            />
          </Pressable> */}

          <LottieView
            autoPlay
            style={{ height: 300, width: 300, alignSelf: "center" }}
            source={require("../assets/lottie/marketplace.json")}
          />

          <Text style={{ fontSize: 19, fontWeight: "700", marginBottom: 10 }}>
            Your privacy is our top priority.
          </Text>

          <Text
            style={{
              marginBottom: 85,
              alignSelf: "center",
              color: "grey",
              alignSelf: "center",
              fontSize: 18,
            }}
          >
            To securely process your transactions, we require a few more
            details: the last four digits of your SSN, along with your account
            and routing numbers. This information helps ensure that you safely
            receive your payments.
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AuthSsn", {
                route,
              })
            }
            style={{
              backgroundColor: "#4A3AFF",

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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  backButtonContainer: {
    marginBottom: 20,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
  },
  heading: {
    fontSize: 24,
    color: "white",
    fontWeight: "800",
    marginBottom: 30,
    textAlign: "center",
  },
  dateInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  dateInput: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    width: 70,
    textAlign: "center",
    fontSize: 18,
    marginHorizontal: 5,
  },
  separator: {
    fontSize: 18,
    color: "white",
    margin: 15,
  },
  submitButton: {
    backgroundColor: "black",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
});
