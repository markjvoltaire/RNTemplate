import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";
import LottieView from "lottie-react-native";

const GigCard = ({ navigation, item }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const screenWidth = Dimensions.get("window").width;
  const { user } = useUser();

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", item.user_id)
          .single();

        if (error) throw error;

        setUserDetails(data);
      } catch (error) {
        console.error("Error fetching user details:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getUserDetails();
  }, [item.user_id]); // Added dependency to avoid unnecessary re-renders

  const renderUserInfo = () => {
    if (isLoading) {
      return (
        <View
          style={{
            borderRadius: 10,
            backgroundColor: "white",
            height: 80,
            width: screenWidth * 0.95,
            elevation: 5, // Add elevation for drop shadow
            shadowColor: "#000", // Shadow color
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            marginBottom: 10, // Adjust margin to accommodate drop shadow
            paddingHorizontal: 15, // Padding for inner content
            paddingVertical: 10, // Padding for inner content
          }}
        >
          <LottieView
            autoPlay
            style={{ height: 40, width: 40, alignSelf: "center" }}
            source={require("../assets/lottie/greyCircle.json")}
          />
        </View>
      );
    } else {
      return (
        <View
          style={{
            borderRadius: 10,
            backgroundColor: "white",
            width: screenWidth * 0.95,
            elevation: 5, // Add elevation for drop shadow
            shadowColor: "#000", // Shadow color
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            marginBottom: 10, // Adjust margin to accommodate drop shadow
            paddingHorizontal: 15, // Padding for inner content
            paddingVertical: 10, // Padding for inner content
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              style={{
                height: 80,
                width: 80,
                borderRadius: 10,
                backgroundColor: "grey",
              }}
              source={{ uri: userDetails.profileimage }}
            />
            <View style={{ marginLeft: 15 }}>
              <Text
                style={{ fontWeight: "bold", fontSize: 16, paddingBottom: 5 }}
              >
                Cliffs Auto Detailing
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#888",

                  width: screenWidth * 0.7,
                }}
              >
                Transforming rides one detail at a time! 🔧 Passionate about
                perfection.
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{ fontSize: 14, paddingRight: 30, fontWeight: "600" }}
                >
                  From: $200
                </Text>

                <Text>Online Now</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
  };

  const newItem = {
    ...item,
    profileimage: userDetails?.profileimage,
    username: userDetails?.username,
    profession: userDetails?.profession,
  }; // Fixed potential null error

  return (
    <View style={{}}>
      <Pressable
        onPress={() => navigation.navigate("ProfileDetail", { item: newItem })}
        style={styles.userContainer}
      >
        {renderUserInfo()}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},

  button: {
    backgroundColor: "#007AFF",
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  userContainer: {
    padding: 3,
    alignSelf: "center",
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "grey",
  },
  username: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  optionButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  moreIcon: {
    width: 50,
    height: 50,
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
  },
  location: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  separator: {
    height: 0.5,
    backgroundColor: "#E0E0E0",
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});

export default GigCard;
