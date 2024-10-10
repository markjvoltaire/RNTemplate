import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";
import { sendPushNotification } from "../services/notification";
import { useFocusEffect, useScrollToTop } from "@react-navigation/native"; // Import useScrollToTop

export default function OrderDetails({ route, navigation }) {
  const { user } = useUser();
  const order = route.params.service;
  const {
    created_at,
    id,
    orderId,
    orderStatus,
    purchaserId,
    serviceId,
    user_id,
    date,
    time,
    rating,
    seller_id,
  } = order;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [manageModal, setManageModal] = useState(false);

  const [reportText, setReportText] = useState("");

  const formattedCreatedAt = new Date(created_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function reportTask() {
    try {
      const { data, error } = await supabase.from("orderReports").insert([
        {
          customerId: user.user_id,
          description: reportText,
          serviceId: order.serviceId,
        },
      ]);

      return data;
    } catch (error) {
      console.error(error.message);
    }
  }

  const completeTask = async () => {
    const body = `Service Completed by ${user.username}`;
    const title = "Service Complete";

    try {
      const userId = supabase.auth.currentUser.id;

      const updateOrderResponse = await supabase
        .from("orders")
        .update({ orderStatus: "complete" })
        .eq("seller_id", userId)
        .eq("orderId", orderId);

      if (updateOrderResponse.error) {
        console.error("Error updating order:", updateOrderResponse.error);
        Alert.alert("Something Went Wrong");
        return;
      }

      const updateProfileResponse = await supabase
        .from("profiles")
        .update({ ratingNeeded: true })
        .eq("user_id", purchaserId);

      if (updateProfileResponse.error) {
        console.error("Error updating profile:", updateProfileResponse.error);
        Alert.alert("Something Went Wrong");
        return;
      }

      const tokenCode = updateOrderResponse.body[0].expo_push_token;

      await sendPushNotification(body, title, tokenCode);
      setManageModal(false);
      Alert.alert("Task Complete");
      navigation.goBack();
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Something Went Wrong");
    }
  };

  const handleReportPress = () => {
    setIsModalVisible(true);
  };

  const handleReportSubmit = () => {
    // Handle the report submission (e.g., send the reportText to a server)

    setIsModalVisible(false);
    setReportText("");
    reportTask();
    Alert.alert("Your report was sent");
  };

  const showAlert = async () =>
    Alert.alert(
      "Confirm Completion",
      "Are you sure you want to mark this order as complete? This action cannot be undone.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => await completeTask(),
        },
      ],
      {
        cancelable: true,
        onDismiss: () =>
          Alert.alert(
            "This alert was dismissed by tapping outside of the alert dialog."
          ),
      }
    );

  const handleOrderComplete = async () => {
    showAlert();
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setReportText("");
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Order ID:</Text>
          <Text style={styles.value}>{orderId}</Text>

          <Text style={styles.label}>Payment Date:</Text>
          <Text style={styles.value}>{formattedCreatedAt}</Text>

          <Text style={styles.label}>Purchaser ID:</Text>
          <Text style={styles.value}>{purchaserId}</Text>

          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>{time}</Text>

          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{formattedDate}</Text>

          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{seller_id}</Text>

          <Text style={styles.label}>Order Status:</Text>
          <Text style={styles.value}>{orderStatus}</Text>
        </View>
      </ScrollView>
      <View style={styles.bottomContainer}>
        {orderStatus === "complete" &&
          order.seller_id !== user.user_id &&
          order.rating === null && (
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate("LeaveReview", route.params.service)
              }
            >
              <Text style={styles.buttonText}>Leave a Review</Text>
            </TouchableOpacity>
          )}

        {order.seller_id === user.user_id &&
          order.orderStatus !== "complete" && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setManageModal(true)}
            >
              <Text style={styles.buttonText}>Manage Order</Text>
            </TouchableOpacity>
          )}

        <TouchableOpacity style={styles.button} onPress={handleReportPress}>
          <Text style={styles.buttonText}>Report Order</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={manageModal}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Manage Order</Text>

            <TouchableOpacity
              onPress={() => handleOrderComplete()}
              style={styles.modalButton}
            >
              <Text style={styles.buttonText}>Mark as Complete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setManageModal(false)}
            >
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Report Issue</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe the issue"
              value={reportText}
              multiline
              onChangeText={setReportText}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleReportSubmit}
            >
              <Text style={styles.buttonText}>Submit Report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleModalClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 10,
  },
  bottomContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#4A3AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    width: "100%",
    height: 200,
  },
  modalButton: {
    backgroundColor: "#4A3AFF",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 5,
    width: "100%",
  },
});
