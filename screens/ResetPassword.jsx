import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
  Image,
  Button,
} from "react-native";
import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import LottieView from "lottie-react-native";

export default function ResetPassword({ navigation }) {
  let height = Dimensions.get("window").height;
  let width = Dimensions.get("window").width;

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [otp, setOTP] = useState();
  const [state, setState] = useState("start");
  const [modal, setModal] = useState(true);

  async function sendEmail() {
    const { data, error } = await supabase.auth.api.resetPasswordForEmail(
      forgotEmail
    );

    if (error) {
      Alert.alert(error.message);
    } else {
      setState("awaitOTP");
      Alert.alert(`A 6 Digit Code Has Been Sent To ${forgotEmail}`);
    }
  }

  async function setUser(data) {
    setModal(true);
    supabase.auth.setAuth(data.access_token);
  }

  async function verifyOTP() {
    const { data, error } = await supabase.auth.api.verifyOTP({
      email: forgotEmail,
      token: otp,
      type: "recovery",
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      setUser(data);
      setState("changePassword");
      Alert.alert("OTP Verified! You Can Now Change Your Password");
    }
  }

  async function changePassword() {
    const { error, data } = await supabase.auth.update({
      password: forgotPassword,
    });

    if (error) {
      Alert.alert(error.message);
    }
    {
      setModal(false);
      Alert.alert("Your Password Has Been Changed");
      navigation.goBack();
    }

    console.log("error", error);
  }

  return (
    <SafeAreaView style={{ backgroundColor: "white", flex: 1 }}>
      <View style={{ flex: 1, alignItems: "center" }}>
        <View style={{ marginTop: 50 }}>
          {state === "start" ? (
            <View>
              <Text style={{ color: "black", marginBottom: 10 }}>
                Enter Your Account Email
              </Text>
              <TextInput
                style={{
                  width: 300,
                  height: 40,
                  backgroundColor: "#FAFAFA",
                  paddingHorizontal: 10,
                  marginBottom: 20,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: "#DBDBDB",
                }}
                placeholderTextColor="grey"
                placeholder="Enter Email"
                value={forgotEmail}
                onChangeText={setForgotEmail}
              />
              <TouchableOpacity
                onPress={() => sendEmail()}
                style={{
                  backgroundColor: "black",
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 5,
                  alignSelf: "stretch",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 18,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  Send Code To Email
                </Text>
              </TouchableOpacity>
            </View>
          ) : state === "awaitOTP" ? (
            <>
              <Text style={{ color: "black", marginBottom: 10 }}>
                Enter The 6 Digit OTP Code
              </Text>
              <TextInput
                style={{
                  width: 300,
                  height: 40,
                  backgroundColor: "#FAFAFA",
                  paddingHorizontal: 10,
                  marginBottom: 20,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: "#DBDBDB",
                }}
                placeholderTextColor="grey"
                keyboardType="number-pad"
                placeholder="6 Digit OTP Code"
                value={otp}
                onChangeText={setOTP}
              />
              <TouchableOpacity
                onPress={() => verifyOTP()}
                style={{
                  backgroundColor: "black",
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 5,
                  alignSelf: "stretch",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 18,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  Verify OTP Code
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View>
              <Text style={{ color: "black", marginBottom: 10 }}>
                Enter Your New Password
              </Text>
              <TextInput
                style={{
                  width: 300,
                  height: 40,
                  backgroundColor: "#FAFAFA",
                  paddingHorizontal: 10,
                  marginBottom: 20,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: "#DBDBDB",
                }}
                placeholderTextColor="grey"
                placeholder="Enter New Password"
                value={forgotPassword}
                onChangeText={setForgotPassword}
              />
              <TouchableOpacity
                onPress={() => changePassword()}
                style={{
                  backgroundColor: "black",
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 5,
                  alignSelf: "stretch",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 18,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  Reset Password
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
