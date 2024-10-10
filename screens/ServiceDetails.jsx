import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";
import LottieView from "lottie-react-native";
import { supabase } from "../services/supabase";
import { SharedElement } from "react-native-shared-element";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function ServiceDetails({ route, navigation }) {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [businessProfile, setBusinessProfile] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [bookingCount, setBookingCount] = useState(0);
  const [ratingAverage, setRatingAverage] = useState(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    fetchBusinessProfile(route.params.item.user_id);
  }, []);

  async function getBookingCount() {
    const res = await supabase
      .from("orders")
      .select("*")
      .eq("orderStatus", "complete")
      .eq("seller_id", route.params.item.user_id);

    setBookingCount(res.body.length);

    return res.body;
  }

  async function getRatings() {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("rating")
        .eq("orderStatus", "complete")
        .eq("seller_id", route.params.item.user_id);

      if (error) {
        console.error("Error fetching ratings:", error.message);
        return null; // or handle the error as needed
      }

      if (!data || data.length === 0) {
        console.log("No ratings found.");
        return null; // or handle the case where no ratings are found
      }

      // Calculate the average rating
      const totalRatings = data.reduce((sum, record) => sum + record.rating, 0);
      const averageRating = totalRatings / data.length;

      setRatingAverage(averageRating);

      return { averageRating };
    } catch (err) {
      console.error("Unexpected error:", err.message);
      return null; // or handle the error as needed
    }
  }

  const fetchBusinessProfile = async (businessId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", businessId)
        .single();
      if (error) throw error;
      setBusinessProfile(data);
    } catch (error) {
      console.error("Error fetching user data: ", error);
      Alert.alert("Error", "Failed to fetch user data");
    }
  };

  const goToAddTime = () => {
    navigation.navigate("AddDate", { serviceInfo: route.params.item });
  };

  useEffect(() => {
    const getInfo = async () => {
      const res = await getBookingCount();
      const resp = await getRatings();

      console.log("resp", resp);
      setBookingCount(res.length);
    };
    getInfo();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingBottom: 100 }}
      >
        <SharedElement id={route.params.item.thumbnail}>
          <Animated.Image
            source={{ uri: route.params.item.thumbnail }}
            style={styles.image}
          />
          <View
            style={{
              backgroundColor: "black",
              width: screenWidth,
              height: screenHeight * 0.55,
              resizeMode: "cover",
              position: "absolute",
              opacity: 0.5,
            }}
          ></View>
        </SharedElement>
        <View style={styles.detailsContainer}>
          <Text style={styles.serviceTitle}>{route.params.item.title}</Text>
          <Text style={styles.priceText}>from ${route.params.item.price}</Text>
          <Pressable
            onPress={() =>
              navigation.navigate("ProfileDetail", {
                item: businessProfile,
              })
            }
          >
            <BusinessInfo
              bookingCount={bookingCount}
              businessProfile={businessProfile}
              ratingAverage={ratingAverage}
            />
          </Pressable>
          <Text style={styles.descriptionText}>
            {route.params.item.description}
          </Text>
        </View>
        <View style={{ marginBottom: 100 }}></View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={goToAddTime}
          disabled={loading}
          style={styles.bookButton}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>Select Date</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={processing} animationType="fade">
        <SafeAreaView style={styles.modalContainer}>
          <LottieView
            style={styles.lottie}
            source={require("../assets/lottie/3Dots.json")}
            autoPlay
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const BusinessInfo = ({ businessProfile, bookingCount, ratingAverage }) => {
  return (
    <View style={styles.businessInfoContainer}>
      <Image
        style={styles.profileImage}
        source={{ uri: businessProfile.profileimage }}
      />
      <View>
        <Text style={styles.profileName}>{businessProfile.username}</Text>
        <Text style={styles.ratingText}>
          {ratingAverage} ★ ({bookingCount})
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  image: {
    width: screenWidth,
    height: screenHeight * 0.55,
    resizeMode: "cover",
  },
  detailsContainer: {
    padding: 10,
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "600",
    color: "black",
    marginVertical: 5,
  },
  descriptionText: {
    fontSize: 16,
    color: "#2C3624",
    marginTop: 10,
  },
  bottomBar: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  bookButton: {
    backgroundColor: "black",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#4A3AFF",
  },
  lottie: {
    height: 500,
    width: 500,
    alignSelf: "center",
  },
  businessInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: "grey",
  },
  profileName: {
    fontWeight: "600",
    fontSize: 16,
  },
  ratingText: {
    color: "grey",
  },
});
