import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, View, Dimensions, Alert, Button } from "react-native";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";
import UserCars from "./UserCars";
import { useColorScheme } from "react-native";

const HomeCard = ({ navigation, city, state }) => {
  const height = Dimensions.get("window").height;
  const slideUpAnim = useRef(new Animated.Value(height)).current;
  const { user, setUser } = useUser();
  const [addCarModal, setAddCarModal] = useState(false);
  const [licensePlate, setLicensePlate] = useState("");
  const [description, setDescription] = useState("");
  const [uploadComplete, setUploadComplete] = useState(false);
  const [addingCarModal, setAddingCarModal] = useState(false);
  const [searching, setSearching] = useState(false);
  let colorScheme = useColorScheme();

  const uploadNewCar = async () => {
    setUploadComplete(false);
    const userId = supabase.auth.currentUser.id;
    try {
      setAddingCarModal(true);
      const newCar = { user_id: userId, licensePlate, description };
      const resp = await supabase.from("cars").insert([newCar]);

      await new Promise((resolve) =>
        setTimeout(() => {
          setUploadComplete(true);
          resolve();
        }, 2000)
      );

      await new Promise((resolve) =>
        setTimeout(() => {
          setAddCarModal(false);
          setAddingCarModal(false);
          setLicensePlate("");
          setDescription("");
          resolve();
        }, 2000)
      );

      return resp;
    } catch (error) {
      console.error("Error submitting comment:", error);
      throw error;
    }
  };

  const noInput = () => {
    Alert.alert("Inputs were empty");
  };

  const signOutUser = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  useEffect(() => {
    Animated.timing(slideUpAnim, {
      toValue: height * 0.65,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        backgroundColor: "white",
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height * 0.57,
        borderTopLeftRadius: 11,
        borderTopRightRadius: 11,
        elevation: 5,
        top: -40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        transform: [{ translateY: slideUpAnim }],
      }}
    >
      <Text
        style={{
          fontSize: 20,
          left: Dimensions.get("window").width * 0.07,
          top: 22,
          fontFamily: "Helvetica Neue",
          color: "black",
        }}
      >
        Good morning, {user?.displayName}
      </Text>
      <UserCars city={city} state={state} navigation={navigation} />
    </Animated.View>
  );
};

export default HomeCard;
