import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { supabase } from "../services/supabase";
import LottieView from "lottie-react-native";
import { useUser } from "../context/UserContext";

export default function TaskDetails({ route, navigation }) {
  const task = route.params.service;
  const profile = route.params.serviceUser;
  const { user } = useUser();
  const [modal, setModal] = useState(false);

  const date = new Date(task.created_at);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - date.getTime();
  const secondsDifference = Math.floor(timeDifference / 1000);
  const minutesDifference = Math.floor(secondsDifference / 60);
  const hoursDifference = Math.floor(minutesDifference / 60);
  const daysDifference = Math.floor(hoursDifference / 24);

  let formattedDate;

  if (daysDifference > 7) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month = date.getMonth();
    const monthName = monthNames[month];
    formattedDate = `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
  } else if (daysDifference > 0) {
    formattedDate =
      daysDifference === 1 ? "1 day ago" : `${daysDifference} days ago`;
  } else if (hoursDifference > 0) {
    formattedDate =
      hoursDifference === 1 ? "1 hour ago" : `${hoursDifference} hours ago`;
  } else if (minutesDifference > 0) {
    formattedDate =
      minutesDifference === 1
        ? "1 minute ago"
        : `${minutesDifference} minutes ago`;
  } else {
    formattedDate = "Just now";
  }

  const createThreeButtonAlert = (task) =>
    Alert.alert(
      "Warning!",
      "This action cannot be undone. Are you sure you want to delete?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          style: "destructive",
          text: "Delete",
          onPress: () => {
            deleteTask(task);
            console.log("Delete Pressed");
            // Add your delete logic here
          },
        },
      ]
    );

  const handleComplete = (task) =>
    Alert.alert(
      "Confirm",
      "Once completed, this task cannot be undone. Are you sure you want to mark it as complete?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          style: "default",
          text: "Complete",
          onPress: () => {
            completeTask(task);
            console.log("Complete Pressed");
            // Add your completion logic here
          },
        },
      ]
    );

  async function deleteTask(task) {
    console.log("task", task);
    try {
      // Delete the car
      const deleteResult = await supabase
        .from("tasks")
        .delete()
        .eq("taskId", task.taskId);

      setModal(false);

      navigation.goBack();

      return deleteResult;
    } catch (error) {
      console.error(error.message);
    }
  }

  async function completeTask() {
    console.log("task", task);
    try {
      // Delete the car
      const result = await supabase
        .from("tasks")
        .update({ completed: "Y" })
        .eq("taskId", task.taskId);

      setModal(false);

      navigation.goBack();

      return result;
    } catch (error) {
      console.error(error.message);
    }
  }

  async function reportTask() {
    try {
      const { data, error } = await supabase.from("reports").insert([
        {
          userId: user.user_id,
          taskPoster: task.taskCreator,
          taskId: task.taskId,
        },
      ]);

      return data;
    } catch (error) {
      console.error(error.message);
    }
  }

  const createAlert = async (task) =>
    Alert.alert(
      "Report Task",
      "This action cannot be undone. Are you sure you want to report this?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Report",
          onPress: async () => {
            console.log(task);
            reportTask();
            Alert.alert("Your report was sent");
          },
        },
      ]
    );

  const handleSendOffer = () => {
    user?.user_id === task.taskCreator
      ? setModal(true)
      : user
      ? navigation.navigate("InboxDetails", {
          profileDetails: profile,
        })
      : navigation.navigate("Messages");
  };

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 25 }}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: task.latitude,
            longitude: task.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          scrollEnabled={false}
          zoomEnabled
        />
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <Text style={styles.title}>{task.taskDescription}</Text>
        </View>
        <Pressable
          onPress={() =>
            navigation.navigate("ProfileDetail", { item: profile })
          }
        >
          <View style={styles.optionContainer}>
            <Image
              source={{ uri: profile.profileimage }}
              style={styles.profileimage}
            />
            <Text style={styles.optionText}>{profile.username}</Text>
          </View>
        </Pressable>
        <View style={styles.optionContainer}>
          <Image
            source={require("../assets/Location.png")}
            style={styles.icon}
          />
          <Text style={styles.optionText}>
            {task.city}, {task.state}
          </Text>
        </View>
        <View style={styles.optionContainer}>
          <Image
            source={require("../assets/CalendarNotActive.png")}
            style={styles.icon}
          />
          <Text style={styles.optionText}>{formattedDate}</Text>
        </View>
      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleSendOffer()}
        >
          <Text style={styles.buttonText}>
            {user?.user_id === task.taskCreator
              ? "Manage Task"
              : "Send Message"}
          </Text>
        </TouchableOpacity>

        {user?.user_id === task.taskCreator ? null : (
          <TouchableOpacity
            style={{
              backgroundColor: "grey",
              height: Dimensions.get("window").height * 0.07,
              width: Dimensions.get("window").width * 0.9,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 25,
            }}
            onPress={() => createAlert(task)}
          >
            <Text style={styles.buttonText}>Report Task</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Modal for task actions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modal}
        onRequestClose={() => {
          setModal(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Task</Text>
            <TouchableOpacity
              onPress={() => handleComplete(task)}
              style={{
                backgroundColor: "#4A3AFF",
                height: Dimensions.get("window").height * 0.07,
                width: Dimensions.get("window").width * 0.6,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 25,
              }}
            >
              <Text style={styles.buttonText}>Mark as Complete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => createThreeButtonAlert(task)}
              style={{
                backgroundColor: "red",
                height: Dimensions.get("window").height * 0.07,
                width: Dimensions.get("window").width * 0.6,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 25,
              }}
            >
              <Text style={styles.buttonText}>Delete Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModal(false)}
              style={{
                backgroundColor: "white",
                height: Dimensions.get("window").height * 0.07,
                width: Dimensions.get("window").width * 0.6,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                borderWidth: 0.4,
              }}
            >
              <Text
                style={{ color: "black", fontWeight: "bold", fontSize: 18 }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
  },
  map: {
    height: 250,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "#4A3AFF",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#313131",
    width: Dimensions.get("window").width * 0.8,
    marginRight: 20,
  },
  profileimage: {
    width: 24,
    height: 24,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "grey",
    borderWidth: 1,
    borderColor: "#4A3AFF",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#313131",
  },
  bottomBar: {
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#4A3AFF",
    height: Dimensions.get("window").height * 0.07,
    width: Dimensions.get("window").width * 0.9,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: 350,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#eee",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "red",
    marginBottom: 0,
  },
});
