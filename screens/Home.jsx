import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  Animated,
  RefreshControl,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { useFocusEffect, useScrollToTop } from "@react-navigation/native"; // Import useScrollToTop
import { useUser } from "../context/UserContext";
import { supabase } from "../services/supabase";
import {
  notifyUserAboutNewComment,
  sendPushNotification,
} from "../services/notification";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const ServiceItem = ({ service, navigation }) => {
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serviceUser, setServiceUser] = useState({});
  const { user, setUser } = useUser();

  const ref = useRef(null);
  useScrollToTop(ref);

  const date = new Date(service.created_at);
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

  async function getUser() {
    const resp = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", service.taskCreator)
      .single()
      .limit(1);

    return resp;
  }

  const fetchUser = async () => {
    const resp = await getUser();
    setServiceUser(resp.body);
    setLoading(false);
  };

  const createThreeButtonAlert = async (service) =>
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
            navigation.navigate("TaskDetails", { service, serviceUser });

            // Add your delete logic here
          },
        },
      ]
    );

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Pressable
      style={{ backgroundColor: "white" }}
      onPress={() =>
        navigation.navigate("TaskDetails", { service, serviceUser })
      }
    >
      <View style={{ padding: 10, marginBottom: 1 }}>
        <View style={{ flexDirection: "row" }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "bold",
              marginBottom: 10,
              color: "#313131",

              width: screenWidth * 0.8,
              marginRight: 20,
            }}
          >
            {service.taskDescription}
          </Text>

          <Pressable
            onPress={() =>
              navigation.navigate("TaskDetails", { service, serviceUser })
            }
          >
            <Image
              source={require("../assets/moreButton.png")}
              style={styles.icon}
            />
          </Pressable>
        </View>

        <View style={styles.optionContainer}>
          <Image
            source={{ uri: serviceUser.profileimage }}
            style={styles.profileimage}
          />
          <Text style={{ fontSize: 14, color: "#313131" }}>
            {serviceUser.username}
          </Text>
        </View>

        <View style={styles.optionContainer}>
          <Image
            source={require("../assets/CalendarNotActive.png")}
            style={styles.icon}
          />
          <Text style={{ fontSize: 14, color: "#313131" }}>
            {formattedDate}
          </Text>
        </View>

        <View style={styles.optionContainer}>
          <Image
            source={require("../assets/Location.png")}
            style={styles.icon}
          />
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                fontSize: 14,
                color: "#313131",

                width: screenWidth * 0.6,
                marginRight: 30,
              }}
            >
              {service.city}, {service.state}
            </Text>

            <View style={{ width: screenWidth * 0.2 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  width: screenWidth * 0.2,
                }}
              >
                {service.completed === "F" ? "Open" : null}
              </Text>
            </View>
          </View>
        </View>
      </View>
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
              onPress={() => createThreeButtonAlert(setModal)}
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
    </Pressable>
  );
};

export default function Home({ navigation }) {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [taskList, setTaskList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  async function getTasks() {
    // Start building the query by selecting all columns from the "tasks" table
    // where the "completed" field is "F" and ordering by "id" in descending order.
    let query = supabase
      .from("tasks")
      .select("*")
      .eq("completed", "F")
      // .neq("taskCreator", user.user_id)
      .order("id", { ascending: false });

    // Check if the user object exists and has both "city" and "state" properties.
    if (user && user.city && user.state) {
      // If the user object is defined, add additional filters for "city" and "state".
      query = query.eq("city", user.city).eq("state", user.state);
    }

    // Execute the query and await the results.
    let { data: tasks, error } = await query;

    // Check if there was an error with the query.
    if (error) {
      // Log the error to the console for debugging purposes.
      console.error("Error fetching tasks:", error);
      // Return null to indicate that fetching the tasks failed.
      return null;
    }

    // Return the list of tasks retrieved from the database.
    return tasks;
  }

  const fetchTasks = async () => {
    setRefreshing(true);
    const resp = await getTasks();
    setTaskList(resp);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      const fetchData = async () => {
        try {
          const resp = await getTasks();
          setTaskList(resp);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

      fetchData();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <SafeAreaView
        style={{
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderColor: "#f5f5f5",
        }}
      >
        <Pressable onPress={async () => await sendPushNotification()}>
          <Text
            style={{
              alignSelf: "center",
              fontFamily: "Poppins-Black",
              color: "#4A3AFF",
              fontSize: 25,
              marginBottom: 10,
            }}
          >
            tizly
          </Text>
        </Pressable>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.servicesContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchTasks} />
        }
      >
        {taskList.map((service) => (
          <View style={{ marginBottom: 3 }} key={service.id}>
            <ServiceItem navigation={navigation} service={service} />
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 10,
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
  optionText: {},
  searchBar: {
    backgroundColor: "white",
    padding: 10,
    margin: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 0.2,
  },
  categoriesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 2,
    bottom: 10,
  },
  categoryItem: {
    backgroundColor: "#635BFF",
    paddingHorizontal: 10,
    marginHorizontal: 10,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 30,
  },
  categoryText: {
    fontSize: 12,
    color: "white",
    fontFamily: "gilroy",
  },
  servicesContainer: {
    paddingHorizontal: 1,
  },
  serviceItem: {
    backgroundColor: "white",
    borderRadius: 18,
    marginBottom: 2,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    borderWidth: 3,
    borderColor: "#f5f5f5",
  },
  serviceInfo: {
    padding: 10,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 1,
  },
  serviceCategory: {
    fontSize: 14,
    color: "#666",
    marginVertical: 2,
  },
  serviceRating: {
    fontSize: 14,
    color: "grey",
    marginBottom: 1,
  },
  servicePrice: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  deliveryPersonName: {
    fontSize: 16,
    fontWeight: "500",
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
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
