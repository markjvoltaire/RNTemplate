import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";

export default function ReviewCards() {
  const reviews = [
    {
      name: "John Doe",
      date: "May 10, 2024",
      comment: "Great service! Will definitely come back again.",
      image: require("../assets/chef.jpg"), // Replace with actual image path
      rating: 4, // Replace with the actual rating value
    },
    // Add more reviews here
  ];

  const renderStars = (rating) => {
    const filledStars = Math.floor(rating);

    const stars = [];

    for (let i = 0; i < filledStars; i++) {
      stars.push(
        <Image
          key={i}
          source={require("../assets/goldStar.png")}
          style={styles.starIcon}
        />
      );
    }

    return stars;
  };

  return (
    <View style={styles.container}>
      {reviews.map((review, index) => (
        <View key={index} style={styles.reviewCard}>
          <View style={styles.userInfo}>
            <Image source={review.image} style={styles.profileImage} />
            <Text style={styles.name}>{review.name}</Text>
          </View>
          <Text style={styles.date}>{review.date}</Text>
          <View style={styles.ratingContainer}>
            {renderStars(review.rating)}
          </View>
          <Text style={styles.comment}>{review.comment}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  reviewCard: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    width: "100%",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  name: {},
  date: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  starIcon: {
    width: 13,
    height: 13,
    marginRight: 2,
  },
  comment: {
    fontSize: 16,
  },
});
