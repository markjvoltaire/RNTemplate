import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Dimensions,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import LottieView from "lottie-react-native";

import { useFonts } from "expo-font";

export default function Welcome({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(true);
  const [header, setHeader] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000, // Adjust the duration as per your preference
        useNativeDriver: true,
      }).start();
    }, 2000);
  }, []);

  let height = Dimensions.get("window").height;
  let width = Dimensions.get("window").width;

  function goToLogin() {
    setModal(false);
    navigation.navigate("Login");
  }

  function goToSignUp() {
    setModal(false);
    navigation.navigate("ProfileType");
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const log = async () => {
        setModal(true);
      };
      log();
    });
    return unsubscribe;
  }, [navigation]);

  const [fontsLoaded] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "SF-SemiBold": require("../assets/fonts/SFUIText-Semibold.ttf"),
    "SF-Bold": require("../assets/fonts/SFUIText-Bold.ttf"),
    "SF-Medium": require("../assets/fonts/SFUIText-Medium.ttf"),
    "SF-Regular": require("../assets/fonts/SFUIText-Regular.ttf"),
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#4A3AFF" }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <LottieView
            autoPlay
            style={{ height: 300, width: 300, alignSelf: "center" }}
            source={require("../assets/lottie/3Dots.json")}
          />
        </View>
      ) : (
        <SafeAreaView>
          <View>
            <Animated.Image
              style={[
                {
                  aspectRatio: 1,
                  height: 160,
                  alignSelf: "center",
                  top: height * 0.1,
                  opacity: fadeAnim,
                },
              ]}
              source={require("../assets/icon.png")}
            />

            {/* {Tagline} */}
            <Animated.Text
              style={{
                fontWeight: "800",
                color: "white",
                top: height * 0.1,
                fontSize: 25,
                alignSelf: "center",
                opacity: fadeAnim,
              }}
            >
              Booking Made Simple
            </Animated.Text>
          </View>
          <Modal animationType="slide" transparent={true} visible={modal}>
            <View
              style={{
                height: height * 0.45,
                width: width,
                top: height * 0.7,
                borderRadius: 25,
              }}
            >
              <TouchableOpacity
                onPress={() => goToSignUp()}
                style={{
                  backgroundColor: "white",

                  width: width * 0.8,
                  height: height * 0.06,
                  padding: 12,
                  alignSelf: "center",
                  borderRadius: 13,
                  top: height * 0.04,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins-SemiBold",
                    alignSelf: "center",
                    fontSize: 18,
                  }}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => goToLogin()}
                style={{
                  backgroundColor: "black",

                  width: width * 0.8,
                  height: height * 0.06,
                  padding: 12,
                  alignSelf: "center",
                  borderRadius: 13,
                  top: height * 0.07,
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
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerText: {
    alignSelf: "center",
    color: "white",

    fontSize: 48,
  },

  headerSubline: {
    alignSelf: "center",
    color: "white",

    fontSize: 10,
  },
});
