import React, { useEffect, useState } from "react";

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  Modal,
  Platform,
  TouchableOpacity,
  FlatList,
  Pressable,
} from "react-native";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";
import StarRating from "../component/StarRating";
import ServiceCard from "../component/ServiceCard";
import SearchServiceCard from "../component/SearchServiceCard";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { MaterialIcons } from "@expo/vector-icons"; // Import an icon library (you can use any)

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const HomeScreen = ({ navigation }) => {
  const { user } = useUser();

  const [forYouList, setForYouList] = useState([]);
  const [newServices, setNewServices] = useState([]);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [expoPushToken, setExpoPushToken] = useState("");

  const screenHeight = Dimensions.get("window").height;

  const services = [
    { id: 1, code: "7230", description: "Makeup artist" },
    { id: 2, code: "7241", description: "Barber" },
    { id: 3, code: "5813", description: "Bartending" },
    { id: 4, code: "7542", description: "Car Wash" },
    { id: 5, code: "7349", description: "House Cleaning" },
    { id: 6, code: "7349", description: "Handyman" },
    { id: 7, code: "7297", description: "Massage" },
    { id: 8, code: "7299", description: "Miscellaneous" },
    { id: 9, code: "7991", description: "Fitness" },
    { id: 10, code: "7333", description: "Photography" },
    { id: 11, code: "7333", description: "Videography" },
    { id: 12, code: "7230", description: "Hair stylist" },
  ];

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token)
    );
  }, []);

  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: "Here is the notification body",
        data: { data: "goes here", test: { test1: "more data" } },
      },
      trigger: { seconds: 2 },
    });
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      // if (finalStatus !== "granted") {
      //   alert("Failed to get push token for push notification!");
      //   return;
      // }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      // EAS projectId is used here.
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error("Project ID not found");
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;

        await updateExpoToken(token);
      } catch (e) {
        token = `${e}`;
      }
    } else {
      null;
    }

    return token;
  }

  const updateExpoToken = async (token) => {
    const userId = supabase.auth.currentUser.id;

    const res = await supabase
      .from("profiles")
      .update({ expo_push_token: token })
      .eq("user_id", userId);

    if (res.error) {
      console.log("ERROR", res.error);
      Alert.alert("Something Went Wrong");
    }

    return res;
  };

  async function getForYou() {
    const userLatitude = parseFloat(user.latitude);
    const userLongitude = parseFloat(user.longitude);

    // Function to calculate distance between two lat/lng points
    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 3958.8; // Radius of the Earth in miles
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in miles
    }

    try {
      let query = supabase
        .from("services")
        .select("*")
        .eq("deactivated", false);

      // Fetch all services first
      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error("No data returned");
      }

      // Filter services within 30 miles of the user's location
      const filteredData = data.filter((service) => {
        const distance = getDistance(
          userLatitude,
          userLongitude,
          parseFloat(service.latitude),
          parseFloat(service.longitude)
        );
        return distance <= 50; // 50 miles radius
      });

      // Shuffle and limit the data to 5 items
      const shuffledData = filteredData.sort(() => 0.5 - Math.random());
      const limitedData = shuffledData.slice(0, 5);

      setForYouList(limitedData);
    } catch (error) {
      console.error("Error fetching For You data:", error.message);
      Alert.alert("Error", "Failed to fetch For You data");
    }
  }

  async function getNew() {
    const userLatitude = parseFloat(user.latitude);
    const userLongitude = parseFloat(user.longitude);

    // Function to calculate distance between two lat/lng points
    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 3958.8; // Radius of the Earth in miles
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in miles
    }

    try {
      let query = supabase
        .from("services")
        .select("*")
        .eq("deactivated", false)
        .order("id", { ascending: false });

      // Fetch all services first
      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error("No data returned");
      }

      // Filter services within 30 miles of the user's location
      const filteredData = data.filter((service) => {
        const distance = getDistance(
          userLatitude,
          userLongitude,
          parseFloat(service.latitude),
          parseFloat(service.longitude)
        );
        return distance <= 50; // 50 miles radius
      });

      // Shuffle and limit the data to 5 items
      const shuffledData = filteredData.sort(() => 0.5 - Math.random());
      const limitedData = shuffledData.slice(0, 5);

      setNewServices(limitedData);
    } catch (error) {
      console.error("Error fetching For You data:", error.message);
      Alert.alert("Error", "Failed to fetch For You data");
    }
  }

  const searchServices = () => {
    const filteredServices = services.filter(
      (service) =>
        !service.deactivated &&
        service.description.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filteredServices);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh the data
      await getForYou(); // Ensure this function updates the forYouList
      setRefreshing(false);
    } catch (error) {
      console.error("Error refreshing data:", error.message);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getForYou();
    getNew();
  }, []);

  useEffect(() => {
    if (query.trim() !== "") {
      searchServices();
    } else {
      setSearchResults([]);
    }
  }, [query]);

  const screenWidth = Dimensions.get("window").width;

  const renderCard = ({ item }) => (
    <Pressable onPress={() => navigation.navigate("ServiceDetails", { item })}>
      <View style={styles.card}>
        <Image
          source={{ uri: item.thumbnail }} // Use the image URL dynamically
          style={{
            width: screenWidth * 0.7,
            height: screenWidth * 0.64,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            resizeMode: "cover",
            backgroundColor: "grey",
          }}
        />
        <View style={{ padding: 5 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>

          <Text style={styles.cardAddress}>
            {item.city}, {item.state}
          </Text>
          <Text style={styles.cardCategory}>Starting at ${item.price}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ padding: 10 }}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hey {user.username}</Text>
        </View>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#dcdcdc",
            borderRadius: 10,
            padding: 15,
            fontSize: 16,
            backgroundColor: "#fff",
          }}
          autoCorrect={false}
          placeholder="What are you looking for?"
          autoCapitalize="none"
          value={query}
          onChangeText={(text) => setQuery(text)}
        />
      </View>
      <View style={{ flex: 1 }}>
        {query === "" ? (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.container}
            >
              <View style={{ padding: 2, marginBottom: 50 }}>
                {/* Categories Section */}

                {/* Recommended Section */}
                <Text style={styles.sectionTitle}>Recommended</Text>
                <View style={{ marginBottom: 10 }}>
                  <FlatList
                    horizontal
                    data={forYouList}
                    renderItem={renderCard}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                  />
                </View>

                <Text style={styles.sectionTitle}>Recently Added</Text>
                <FlatList
                  horizontal
                  data={newServices}
                  renderItem={renderCard}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </ScrollView>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {services.length === 0 ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.container}
              >
                <View>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { marginTop: 20, alignSelf: "center" },
                    ]}
                  >
                    No Results Found
                  </Text>
                </View>
              </ScrollView>
            ) : searchResults.length === 0 ? (
              <ScrollView style={{ padding: 10 }}>
                <Text style={{ alignSelf: "center", fontWeight: "700" }}>
                  No Results
                </Text>
              </ScrollView>
            ) : (
              <View style={{ height: screenHeight * 0.32 }}>
                <FlatList
                  data={searchResults}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        padding: 10,
                        width: screenWidth * 0.6,
                        marginBottom: 10,
                      }}
                      key={item.id}
                    >
                      <Pressable
                        onPress={() =>
                          navigation.navigate("Category", {
                            item,
                          })
                        }
                      >
                        <Text style={{ fontWeight: "300" }}>
                          {item.description}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                />
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",

    padding: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "bold",
  },
  categoriesContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 16,
    margin: 4,
    width: "60%", // Adjust based on your design
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  messageContainer: {
    backgroundColor: "#e6f0ff",
    borderRadius: 8,
    padding: 16,
    width: "100%",
  },
  messageText: {
    fontSize: 16,
    marginBottom: 18,
    alignSelf: "center",
  },
  exploreButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  exploreText: {
    color: "white",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",

    marginBottom: 10,
    padding: 10,
  },
  card: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 0.2,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginRight: 30,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardRating: {
    fontSize: 14,
    marginTop: 5,
  },
  cardAddress: {
    fontSize: 12,
    color: "#777",
  },
  cardCategory: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
});

export default HomeScreen;
