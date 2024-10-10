import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { supabase } from "../services/supabase";
import MapView from "react-native-maps";

export default function ReviewTask({ route, navigation }) {
  const { city, date, taskDescription, time, state, longitude, latitude } =
    route.params;

  // Format date to show day and month or set to "N/A"
  const formattedDate = date
    ? new Date(date).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  // Format time to show time of day or set to "N/A"
  const formattedTime = time
    ? new Date(time).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "numeric",
      })
    : "N/A";

  const uploadToSupabase = async () => {
    try {
      const user = supabase.auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const userId = user.id;

      const { data, error } = await supabase.from("tasks").insert([
        {
          taskCreator: userId,
          taskDescription: taskDescription,
          date: formattedDate,
          time: formattedTime,
          city: city,
          state: state,
          longitude: longitude,
          latitude: latitude,
        },
      ]);

      if (error) throw error;

      Alert.alert("Task Posted");
      navigation.navigate("Post");
      console.log("Insert result:", data);
    } catch (error) {
      console.error("Error uploading to Supabase:", error.message);
      Alert.alert("Error", "There was an issue posting the task.");
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={{
          height: 250,
          borderRadius: 5,
          borderWidth: 0.5,
          borderColor: "#4A3AFF",
        }}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        scrollEnabled={false}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Task Description:</Text>
        <Text style={styles.text}>{taskDescription}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Location:</Text>
        <Text style={styles.text}>
          {city}, {state}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => uploadToSupabase()}
        style={styles.postButton}
      >
        <Text style={styles.postButtonText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
    backgroundColor: "white",
  },
  map: {
    height: 250,
    borderRadius: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  infoContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
  },
  postButton: {
    backgroundColor: "#4A3AFF",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 10,
  },
  postButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
