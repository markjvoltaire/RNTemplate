import { StyleSheet, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import Welcome from "../screens/Welcome";
import Login from "../screens/Login";
import SignUp from "../screens/SignUp";
import ResetPassword from "../screens/ResetPassword";
import ProfileType from "../screens/ProfileType";
import AddLocation from "../screens/AddLocation";
import NoAuthAddLocation from "../screens/NoAuthAddLocation";
import BusinessIntro from "../screens/BusinessIntro";
import Dob from "../screens/Dob";
import Name from "../screens/Name";
import PaymentIntro from "../screens/PaymentIntro";
import AddAddress from "../screens/AddAddress";
import AddCity from "../screens/AddCity";
import Ssn from "../screens/Ssn";
import BusinessSignUp from "../screens/BusinessSignUp";

export default function NoAuth() {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Welcome} />

      <Stack.Screen name="ProfileType" component={ProfileType} />

      <Stack.Screen name="NoAuthAddLocation" component={NoAuthAddLocation} />

      <Stack.Screen name="Login" component={Login} />

      <Stack.Screen name="SignUp" component={SignUp} />

      <Stack.Screen name="Dob" component={Dob} />

      <Stack.Screen name="Name" component={Name} />

      <Stack.Screen
        name="PaymentIntro"
        options={{
          tabBarVisible: false,
          headerShown: true,
          headerTitle: "Verification",
          headerTintColor: "black",
          headerBackTitle: "Go Back",
        }}
        component={PaymentIntro}
      />
      <Stack.Screen name="AddAddress" component={AddAddress} />
      <Stack.Screen name="AddCity" component={AddCity} />

      <Stack.Screen name="Ssn" component={Ssn} />
      <Stack.Screen name="BusinessSignUp" component={BusinessSignUp} />

      <Stack.Screen name="BusinessIntro" component={BusinessIntro} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});
