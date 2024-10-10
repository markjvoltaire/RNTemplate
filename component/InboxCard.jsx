import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../services/supabase";
import LottieView from "lottie-react-native";

export default function InboxCard({ item, user, navigation }) {
  const currentUserId = user.user_id;
  const [profileDetails, setProfileDetails] = useState(null); // Initialized as null
  const [loading, setLoading] = useState(true); // Loading state

  async function getUser(otherId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", otherId)
      .single();

    if (error) {
      console.error("Error fetching user:", error.message);
      return null;
    }

    return data;
  }

  useEffect(() => {
    const getProfileDetails = async () => {
      let otherId;
      if (item.sender !== currentUserId) {
        otherId = item.sender;
      } else {
        otherId = item.receiver;
      }

      setLoading(true); // Set loading to true when fetching data

      const resp = await getUser(otherId);

      setProfileDetails(resp); // Set profile details
      setLoading(false); // Set loading to false when data is fetched
    };
    getProfileDetails();
  }, []);

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() =>
        navigation.navigate("InboxDetails", {
          profileDetails,
        })
      }
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <LottieView
            autoPlay
            style={{ height: 100, width: 100 }}
            source={require("../assets/lottie/blackCircle.json")}
          />
        </View>
      ) : (
        <>
          <Image
            style={styles.profileImage}
            source={{ uri: profileDetails.profileimage }}
          />
          <View style={styles.textContainer}>
            <Text style={styles.username}>{profileDetails.username}</Text>
            {/* Display your inbox card content here */}
            {item.sender === currentUserId ? (
              <Text style={styles.currentUserMessage}>
                <Text style={styles.currentUserText}>You:</Text>{" "}
                {item.type === "offering" ? (
                  <Text style={styles.message}>Sent An Offer</Text>
                ) : (
                  <Text style={styles.message}>{item.message}</Text>
                )}
              </Text>
            ) : (
              <>
                <Text style={styles.message}>{item.message}</Text>
              </>
            )}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2, // for Android shadow
    shadowColor: "#000000", // for iOS shadow
    shadowOpacity: 0.1, // for iOS shadow
    shadowRadius: 5, // for iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    }, // for iOS shadow
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    height: 60,
    backgroundColor: "grey",
    width: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 5,
  },
  message: {
    fontSize: 16,
  },
  currentUserText: {
    fontWeight: "bold",
    color: "grey", // Change color as needed
  },
  currentUserMessage: {
    flexDirection: "row",
  },
});
