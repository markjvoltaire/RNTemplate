import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  Animated,
  FlatList,
  TouchableOpacity,
  Pressable,
  Modal,
  TextInput,
  Button,
  Alert,
  Dimensions,
  ScrollView,
  Switch,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { getPosts } from "../services/user";
import { useUser } from "../context/UserContext";
import LottieView from "lottie-react-native";
import { supabase } from "../services/supabase";
import MapView from "react-native-maps";
import Login from "./Login";
import * as Notifications from "expo-notifications";

const UserProfile = ({ route, navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [loadingGrid, setLoadingGrid] = useState(true);
  const [profilePost, setProfilePost] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [userID, setUserID] = useState(user?.user_id);

  const [isBusinessAccount, setIsBusinessAccount] = useState(
    user.accountType === "business"
  );
  const [isEnabled, setIsEnabled] = useState(user.type === "business");

  // Function to toggle account type switch
  const toggleSwitch = async () => {
    setIsEnabled((previousState) => !previousState);
    await updateAccountType();
  };
  const alertPress = async () => {
    try {
      const { status: notificationStatus } =
        await Notifications.getPermissionsAsync();
      if (notificationStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "You need to enable notifications permission from settings."
        );
      } else {
        Alert.alert(
          "Notifications Enabled",
          "You have notifications permissions enabled."
        );
        const pushToken = await Notifications.getExpoPushTokenAsync();

        const resp = await supabase
          .from("profiles")
          .update({ expo_push_token: pushToken.data })
          .eq("user_id", user.user_id);

        return resp;
      }
    } catch (error) {
      console.error(
        "Error checking notification permissions or fetching push token:",
        error
      );
      Alert.alert(
        "Error",
        "An error occurred while checking notification permissions or fetching the push token. Please try again."
      );
    }
  };

  if (!user) {
    return <Login />;
  }

  // Function to update the account type in the database
  const updateAccountType = async () => {
    const userId = supabase.auth.currentUser.id;
    const accountType = isEnabled ? "personal" : "business";
    const res = await supabase
      .from("profiles")
      .update({ type: accountType })
      .eq("user_id", userId);

    if (res.error) {
      console.log("ERROR", res.error);
      Alert.alert("Something Went Wrong");
    } else {
      setUser(res.data[0]);
    }
  };

  const getUser = async (userid) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userid)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching user data: ", error);
      Alert.alert("Error", "Failed to fetch user data");
    }
  };

  const loginWithEmail = async () => {
    try {
      const { user, error } = await supabase.auth.signIn({
        email,
        password,
      });

      if (error) throw error;

      const userProfile = await getUser(user.id);
      supabase.auth.setAuth(user.access_token);
      setUser(userProfile);
      setIsLoggedIn(true);
      setModalVisible(false);
    } catch (error) {
      console.error("Login error: ", error);
      Alert.alert("Login Error", error.message);
    }
  };

  const handleDeactiveAccount = async () => {
    await deleteUserTasks();
    await deleteMessages();
    await deleteAccount(userID);
    await deleteProfileSchema();
  };
  async function deleteProfileSchema() {
    console.log("user", user);
    const { data, error: deleteError } = await supabase.auth.api.deleteUser(
      user.user_id
    );

    console.log("data", data);

    console.log("DELETE SUCCESSFUL", data);
    signOutUser();

    if (deleteError) {
      console.log("ERROR DELETE", deleteError);
      throw deleteError;
    }
  }
  const deleteUserTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("taskCreator", user.user_id);

    console.log("TASK DELETED");
  };

  const deleteMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .delete()
      .like("threadID", `%${user.user_id}%`);

    console.log("Messages DELETED");

    return data;
  };

  const deleteAccount = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .delete()
      .eq("user_id", userID);

    console.log("DELETE FROM PROFILE");

    console.log("error", error);
    return data;
  };

  const createAlert = async (service) =>
    Alert.alert(
      "Deactive Account",
      "This action cannot be undone. Are you sure you want to delete?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: async () => {
            await handleDeactiveAccount();

            // Add your delete logic here
          },
        },
      ]
    );

  const logUserIn = () => loginWithEmail();

  const signOutUser = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const getUserInfo = async () => {
      if (!user) return;

      const resp = await getPosts(user.user_id);
      setProfilePost(resp);
      setLoadingGrid(false);
      setLoading(false);
    };
    getUserInfo();
  }, [user]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (isLoggedIn === false) {
    return (
      <View>
        <Text>NO USER</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <Image
              source={{ uri: user.profileimage }}
              style={{
                height: 70,
                width: 70,
                borderRadius: 40,
                marginBottom: 15,
                backgroundColor: "grey",
                borderWidth: 1,
                borderColor: "#4A3AFF",
              }}
            />
            <Text style={styles.profileName}>{user.username}</Text>
            <Text
              style={{
                fontSize: 20,
                color: "grey",
                marginBottom: 25,
                alignSelf: "center",
              }}
            >
              {user.type}
            </Text>
          </View>
        </View>
        {/* Account type switch */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Personal</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#4A3AFF" }}
            thumbColor={isEnabled ? "white" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
          <Text style={styles.toggleLabel}>Business</Text>
        </View>
        <View style={styles.separator} />

        <TouchableOpacity
          onPress={() => navigation.navigate("EditProfile")}
          style={styles.optionContainer}
        >
          <Image
            source={require("../assets/profileNotActive.png")}
            style={styles.icon}
          />
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("EditLocation")}
          style={styles.optionContainer}
        >
          <Image
            source={require("../assets/Location.png")}
            style={styles.icon}
          />
          <Text style={styles.optionText}>My Location</Text>
        </TouchableOpacity>

        {/* {user.type === "business" ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("Payments")}
            style={styles.optionContainer}
          >
            <Image
              source={require("../assets/Wallet.png")}
              style={styles.icon}
            />
            <Text style={styles.optionText}>Business Settings</Text>
          </TouchableOpacity>
        ) : null} */}

        {user.type === "business" ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("MyHours")}
            style={styles.optionContainer}
          >
            <Image
              source={require("../assets/Clock.png")}
              style={styles.icon}
            />
            <Text style={styles.optionText}>My Hours</Text>
          </TouchableOpacity>
        ) : null}

        {user.type === "business" ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("Upload")}
            style={styles.optionContainer}
          >
            <Image
              source={require("../assets/Upload.png")}
              style={styles.icon}
            />
            <Text style={styles.optionText}>Upload To Portfolio</Text>
          </TouchableOpacity>
        ) : null}

        {user.type === "business" ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("MyServices")}
            style={styles.optionContainer}
          >
            <Image source={require("../assets/Work.png")} style={styles.icon} />
            <Text style={styles.optionText}>My Services</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity onPress={alertPress} style={styles.optionContainer}>
          <Image
            source={require("../assets/notificationInactiveLightMode.png")}
            style={styles.icon}
          />
          <Text style={styles.optionText}>Notifications</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={() => navigation.navigate("MyTasks")}
          style={styles.optionContainer}
        >
          <Image source={require("../assets/Swap.png")} style={styles.icon} />
          <Text style={styles.optionText}>My Tasks</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={() => createAlert()}
          style={styles.optionContainer}
        >
          <Image source={require("../assets/Hide.png")} style={styles.icon} />
          <Text style={styles.optionText}>Deactivate Account</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => signOutUser()} style={styles.button}>
            <Text style={styles.buttonText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Main containers
  container: { flex: 1, backgroundColor: "white" },
  scrollView: { padding: 16 },
  separator: { height: 1, backgroundColor: "#e0e0e0", marginBottom: 20 },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 14, color: "#636363" },
  serviceInfo: {
    padding: 10,
  },

  // Login modal
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  loginContent: { alignItems: "center" },
  loginTitle: { fontSize: 32, fontFamily: "gilroy", marginBottom: 16 },
  loginSubtitle: { fontSize: 18, marginBottom: 8 },
  loginInfo: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: "#C52A66",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  input: {
    width: "80%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: "#C52A66",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  profileName: { fontSize: 22, marginBottom: 1 },

  profileInfo: { alignItems: "center" },
  profileStats: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 30,
  },

  serviceCategory: {
    fontSize: 14,
    color: "#666",
    marginVertical: 2,
  },
  serviceRating: {
    fontSize: 14,
    color: "grey",
    marginBottom: 2,
  },
  servicePrice: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 1,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  buttonContainer: {
    marginTop: 16,
    width: "100%",
    marginBottom: 50,
  },
  button: {
    backgroundColor: "#4A3AFF",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
  },
  map: {
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "#4A3AFF",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 50,
  },
  optionText: {
    fontSize: 18,
    fontWeight: "500",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#313131",
  },
  textInput: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    borderWidth: 0.3,
    borderRadius: 12,
    marginBottom: 30,
    paddingHorizontal: 10,
    backgroundColor: "#F3F3F9",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 60,
    borderRadius: 12,
    backgroundColor: "#F3F3F9",
    borderColor: "gray",
    borderWidth: 0.3,
    paddingHorizontal: 10,
    marginBottom: 25,
  },
  toggleLabel: {
    fontSize: 18,
    color: "#313131",
  },
});

export default UserProfile;
