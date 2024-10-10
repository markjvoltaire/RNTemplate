import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
  Image,
  ScrollView,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";
import { RefreshControl } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const MyServices = ({ navigation }) => {
  const { user } = useUser();
  const [serviceList, setServiceList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch services from Supabase
  const fetchServices = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", user.user_id)
      .eq("deactivated", false)
      .order("id", { ascending: false });

    setIsLoading(false);

    if (error) {
      console.error("Error fetching data:", error.message);
      Alert.alert("Error", "Failed to fetch Services");
    } else {
      setServiceList(data);
    }
  };

  // Function to delete a service
  async function deleteTask(task) {
    const { data, error } = await supabase
      .from("services")
      .update({ deactivated: true })
      .eq("id", task.id)
      .eq("user_id", user.user_id);

    if (error) {
      Alert.alert("Error", "Failed to delete service");
    } else {
      Alert.alert("Service Deleted");
      setModalVisible(false);
      // Update local state to remove the deleted service
      setServiceList((prevList) =>
        prevList.filter((item) => item.id !== task.id)
      );
    }

    return data;
  }

  // Function to show delete confirmation alert
  const showDeleteAlert = (task) => {
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
          onPress: async () => {
            await deleteTask(task);
          },
        },
      ]
    );
  };

  // Function to open modal and set selected item
  const openModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  // Function to handle refresh of services
  const refreshServices = () => {
    fetchServices(); // Call fetchServices to refresh the list
  };

  useEffect(() => {
    fetchServices(); // Initial fetch of services when component mounts
  }, [user.user_id]); // Re-fetch when user_id changes

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refreshServices} />
      }
    >
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A3AFF" />
          <Text>Loading services...</Text>
        </View>
      )}
      {!isLoading && serviceList.length === 0 && (
        <View style={styles.noServicesContainer}>
          <Text style={styles.noServicesText}>You have no services.</Text>
        </View>
      )}
      {!isLoading &&
        serviceList.map((item, index) => (
          <Pressable
            key={index}
            style={styles.pressable}
            onPress={() => openModal(item)}
          >
            <View style={styles.card}>
              <Image source={{ uri: item.thumbnail }} style={styles.image} />
              <Text style={styles.serviceTitle}>{item.title}</Text>
              <Text style={styles.price}>From ${item.price}</Text>
            </View>
          </Pressable>
        ))}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Service</Text>
            {selectedItem && (
              <>
                <Text style={styles.modalServiceTitle}>
                  {selectedItem.title}
                </Text>
                <Text style={styles.modalPrice}>
                  From ${selectedItem.price}
                </Text>
                <TouchableOpacity
                  onPress={() => showDeleteAlert(selectedItem)}
                  style={[styles.modalButton, styles.deleteButton]}
                >
                  <Text style={styles.buttonText}>Delete Service</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  pressable: {
    marginBottom: 30,
  },
  card: {
    elevation: 5,
    backgroundColor: "#fff",
    borderRadius: 3,
    padding: 10,
  },
  image: {
    width: screenWidth * 0.96,
    height: screenHeight * 0.25,
    marginBottom: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    resizeMode: "cover",
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  price: {
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 6,
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
  modalServiceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  modalPrice: {
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: "white",
    height: screenHeight * 0.07,
    width: screenWidth * 0.6,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 0.4,
  },
  deleteButton: {
    backgroundColor: "red",
    marginBottom: 25,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  cancelButtonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
  noServicesContainer: {
    flex: 1,
    top: 200,
    alignItems: "center",
    height: screenHeight,
  },
  noServicesText: {
    fontSize: 18,
    color: "gray",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MyServices;
