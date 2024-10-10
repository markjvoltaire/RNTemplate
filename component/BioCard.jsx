import { StyleSheet, Text, View } from "react-native";
import React from "react";

export default function BioCard() {
  // Sample data
  const completedOrders = 10;
  const numberOfReviews = 5;
  const numberOfStars = 4;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.number}>{completedOrders}</Text>
          <Text style={styles.label}> Orders</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.number}>{numberOfReviews}</Text>
          <Text style={styles.label}>Reviews</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.number}>{numberOfStars}</Text>
          <Text style={styles.label}>Stars</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.number}>{completedOrders}</Text>
          <Text style={styles.label}> Photos</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  item: {
    alignItems: "center",
  },
  number: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
  },
  label: {
    color: "#666",
    fontSize: 14,
  },
});
