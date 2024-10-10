import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Button,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useUser } from "../context/UserContext";
import { supabase } from "../services/supabase";

export default function LeaveReview({ defaultRating = 0, route, navigation }) {
  const [rating, setRating] = useState(defaultRating);
  const [loading, setLoading] = useState(true);
  const [showSubmitButton, setShowSubmitButton] = useState(defaultRating !== 0);
  const [service, setService] = useState();
  let height = Dimensions.get("window").height;
  let width = Dimensions.get("window").width;

  async function getService() {
    const resp = await supabase
      .from("services")
      .select("*")
      .eq("id", route.params.serviceId)
      .single();

    return resp.body;
  }

  const leaveRating = async () => {
    const userId = supabase.auth.currentUser.id;
    const newRating = rating; // Assuming rating is the new rating given by the user

    // Update the order with the new rating
    const res = await supabase
      .from("orders")
      .update({ rating: newRating })
      .eq("purchaserId", userId)
      .eq("serviceId", route.params.serviceId);

    if (res.error) {
      console.error("Error updating order:", res.error);
      Alert.alert("Something Went Wrong");
      return;
    }

    // Fetch all ratings for the service
    const { data: ratings, error: fetchError } = await supabase
      .from("orders")
      .select("rating")
      .eq("serviceId", route.params.serviceId);

    if (fetchError) {
      console.error("Error fetching ratings:", fetchError);
      Alert.alert("Something Went Wrong");
      return;
    }

    // Calculate the new average rating
    const totalRatings = ratings.length;
    const sumOfRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
    const newAverageRating = sumOfRatings / totalRatings;

    // Update the service with the new average rating
    const updateService = await supabase
      .from("services")
      .update({ rating: newAverageRating })
      .eq("id", route.params.serviceId);

    if (updateService.error) {
      console.error("Error updating service rating:", updateService.error);
      Alert.alert("Something Went Wrong");
    } else {
      Alert.alert("Thank you for your review");
      navigation.goBack();
      navigation.goBack(); // Assuming you navigate back twice to return to the previous screen
    }
  };

  const handleStarPress = (selectedRating) => {
    setRating(selectedRating);
    setShowSubmitButton(true);
  };

  const handleSubmit = async () => {
    await leaveRating();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          style={styles.starContainer}
        >
          <Text style={i <= rating ? styles.filledStar : styles.emptyStar}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  useEffect(() => {
    const fetchService = async () => {
      const resp = await getService();
      setService(resp);
      setLoading(false);
    };
    fetchService();
  }, []);

  console.log("service", service);

  if (loading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", backgroundColor: "white" }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.ratingContainer}>
      <Text style={styles.ratingText}>Rating</Text>
      <View style={styles.starsContainer}>{renderStars()}</View>

      {/* Review Text Input */}
      {/* <TextInput
        style={styles.reviewInput}
        multiline
        numberOfLines={4} // Adjust as needed
        placeholder="Write your review..."
        value={reviewText}
        onChangeText={setReviewText}
      /> */}

      {/* Submit Button */}
      {showSubmitButton && (
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: "#4A3AFF",
            width: width * 0.8,
            height: height * 0.06,
            padding: 12,
            alignSelf: "center",
            borderRadius: 13,
            top: 20,
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
            Send Rating
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ratingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  ratingText: {
    fontSize: 18,
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  starContainer: {
    padding: 5,
  },
  filledStar: {
    color: "gold",
    fontSize: 45,
  },
  emptyStar: {
    color: "lightgrey",
    fontSize: 45,
  },
  reviewInput: {
    width: "80%",
    height: 100,
    borderColor: "gray",
    borderWidth: 1,
    textAlignVertical: "top", // Align text to top in multiline input
    marginBottom: 20,
    padding: 10,
  },
});
