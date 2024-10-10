import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Alert,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";

export default function MyTasks({ navigation }) {
  const [taskList, setTaskList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  async function getTasks() {
    const userId = supabase.auth.currentUser.id;
    let { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("taskCreator", userId)
      .order("id", { ascending: false });
    return tasks;
  }

  const fetchTasks = async () => {
    const resp = await getTasks();
    setTaskList(resp);
  };

  const ServiceItem = ({ service, navigation }) => {
    const [loading, setLoading] = useState(true);
    const [serviceUser, setServiceUser] = useState({});

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

    const createAlert = async (service) =>
      Alert.alert(
        "Report Task",
        "This action cannot be undone. Are you sure you want to delete?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "Report",
            onPress: async () => {
              console.log("REPORT");

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
          service.completed === "F"
            ? navigation.navigate("TaskDetails", { service, serviceUser })
            : createAlert(service)
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

            <Image
              source={require("../assets/moreButton.png")}
              style={styles.icon}
            />
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

                  width: screenWidth * 0.5,
                  marginRight: 30,
                }}
              >
                {service.city}, {service.state}
              </Text>

              <View
                style={{
                  width: screenWidth * 0.2,
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "black",
                    fontWeight: "800",
                    alignSelf: "center",
                  }}
                >
                  {service.completed === "F"
                    ? "Open"
                    : service.completed === "Y"
                    ? "Completed"
                    : null}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.servicesContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchTasks} />
        }
      >
        {taskList.length === 0 ? (
          <Text style={styles.emptyMessage}>No tasks available.</Text>
        ) : (
          taskList.map((service) => (
            <View style={{ marginBottom: 3 }} key={service.id}>
              <ServiceItem navigation={navigation} service={service} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  servicesContainer: {
    flexGrow: 1,
    padding: 10,
    backgroundColor: "white",
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
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
});
