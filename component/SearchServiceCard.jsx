import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
  Animated,
  ActivityIndicator,
} from "react-native";
import StarRating from "./StarRating";
import { supabase } from "../services/supabase";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const SearchServiceCard = ({ navigation, item, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000, // Adjust as needed
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("serviceId", item.id)
          .eq("orderStatus", "complete");

        if (error) {
          console.error("Error fetching order count:", error);
          return;
        }

        setOrderCount(data.length);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order count:", error);
      }
    };

    fetchOrderCount();
  }, []);

  if (loading) {
    return (
      <View style={styles.skeletonContainer}>
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  return (
    <Pressable
      key={index.id}
      onPress={() => navigation.navigate("ServiceDetails", { item })}
    >
      <View style={styles.cardContainer}>
        <Animated.Image
          source={{ uri: item.thumbnail }}
          style={[styles.cardImage, { opacity: fadeAnim }]}
        />

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardPrice}>From ${item.price}</Text>
        <Text style={styles.cardLocation}>
          {item.city}, {item.state}
        </Text>

        <View style={styles.starRating}>
          <StarRating orderCount={orderCount} rating={item.rating} />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 30,
    backgroundColor: "black",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
    width: screenWidth * 0.96,
    height: screenHeight * 0.25,
  },
  cardContainer: {
    elevation: 5,
    marginBottom: 30,
  },
  cardImage: {
    height: screenHeight * 0.42,
    aspectRatio: 1,
    marginBottom: 5,
    borderRadius: 10,
    resizeMode: "cover",
    backgroundColor: "grey",
  },
  cardTitle: {
    color: "#2C3624",
    fontFamily: "interSemiBold",
    fontSize: 16,
    marginBottom: 5,
    width: screenWidth * 0.75,
    marginRight: 15,
  },
  cardPrice: {
    fontFamily: "interRegular",
    fontSize: 13,
    marginBottom: 5,
  },
  cardLocation: {
    fontFamily: "interRegular",
    fontSize: 13,
    color: "#676C5E",
    marginBottom: 5,
    marginRight: 19,
  },
  starRating: {
    marginBottom: 5,
  },
});

export default SearchServiceCard;
