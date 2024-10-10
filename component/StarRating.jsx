// StarRating.js

import React from "react";
import { View, Image, StyleSheet, Text } from "react-native";

const StarRating = ({ rating, orderCount }) => {
  const maxStars = 5;
  const filledStars = Math.floor(rating);
  const halfStars = rating % 1 !== 0;
  const emptyStars = maxStars - filledStars - (halfStars ? 1 : 0);

  return (
    <View style={styles.starRating}>
      {[...Array(filledStars)].map((_, index) => (
        <Image
          key={index}
          style={styles.starIcon}
          source={require("../assets/greenStar.png")} // Replace with your star icon
        />
      ))}
      {halfStars && (
        <Image
          style={styles.starIcon}
          source={require("../assets/halfGreenStar.png")} // Replace with your half star icon
        />
      )}
      {[...Array(emptyStars)].map((_, index) => (
        <Image
          key={index}
          style={styles.starIcon}
          source={require("../assets/emptyStar.png")} // Replace with your empty star icon
        />
      ))}
      {/* 
      <Text
        style={{ fontFamily: "interRegular", fontSize: 13, color: "#676C5E" }}
      >
        ({orderCount})
      </Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  starRating: {
    flexDirection: "row",
  },
  starIcon: {
    height: 15,
    width: 15,
    marginRight: 2,
    resizeMode: "contain",
  },
});

export default StarRating;
