import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  Button,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useUser } from "../context/UserContext";
import { supabase } from "../services/supabase";
import { getUser } from "../services/user";
import InboxCard from "../component/InboxCard";
import { useFocusEffect, useScrollToTop } from "@react-navigation/native"; // Import useScrollToTop
import Login from "./Login";

const Inbox = ({ navigation }) => {
  const { user, setUser } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inboxMessages, setInboxMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [state, setState] = useState("start");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOTP] = useState();
  const [isLoggedIn, setIsLoggedIn] = useState(!user ? false : true);

  async function getUser(userid) {
    const resp = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userid)
      .single()
      .limit(1);

    return resp;
  }

  async function loginWithEmail() {
    // setModalLoader(true);
    const { user, error } = await supabase.auth.signIn({
      email,
      password,
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      const resp = await getUser(user.id);
      supabase.auth.setAuth(user.access_token);
      setUser(resp.body);
    }
  }

  const handleRefresh = async () => {
    const resp = await getLatestMessages();
    setInboxMessages(resp);
  };

  async function getLatestMessages() {
    // Check if user is not logged in
    if (!supabase.auth.currentUser) {
      return [];
    }

    try {
      const userId = supabase.auth.currentUser.id;

      // Fetch all messages for the user
      const { data: allMessages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .like("threadID", `%${userId}%`)
        .order("created_at", { ascending: false });

      // if (messagesError) {
      //   throw new Error(messagesError.message);
      // }

      // Create a map to store the latest message for each threadID
      const latestMessagesMap = new Map();

      // Iterate over all messages
      for (const message of allMessages) {
        // Check if threadID already exists in the map
        if (!latestMessagesMap.has(message.threadID)) {
          // If not, add the message
          latestMessagesMap.set(message.threadID, message);
        }
      }

      // Extract the latest messages from the map
      const latestMessages = Array.from(latestMessagesMap.values());

      return latestMessages;
    } catch (error) {
      console.error("Error fetching latest messages:", error);
      return [];
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      const fetchData = async () => {
        try {
          if (user === null || undefined) {
            return;
          }
          const resp = await getLatestMessages();
          if (isMounted) {
            setInboxMessages(resp);
          }
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
    const retrieveMessages = async () => {
      if (isLoggedIn === false) {
        return;
      }
      const resp = await getLatestMessages();
      setInboxMessages(resp);

      // setLoading(false);
    };
    retrieveMessages();
  }, []);

  const handleLoginModal = () => {
    setModalVisible(true);
    // Add your login logic here
  };

  const logUserIn = () => {
    loginWithEmail();
    // Add your login logic here
  };

  if (isLoggedIn === false) {
    return <Login />;
  }

  const renderInboxItem = ({ item }) => {
    return (
      <View>
        <InboxCard navigation={navigation} user={user} item={item} />
        <View style={styles.separator} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {inboxMessages.length === 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          style={{ alignContent: "center" }}
        >
          <Text style={{ top: 100, alignSelf: "center" }}>
            You currently have no messages
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          onRefresh={handleRefresh} // Pass refresh function to FlatList
          refreshing={refreshing}
          data={inboxMessages}
          renderItem={renderInboxItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  separator: { height: 1, backgroundColor: "#e0e0e0" },
  list: {
    flex: 1,
    paddingHorizontal: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "grey",
  },
  messageContainer: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  sender: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },
  date: {
    fontSize: 12,
    color: "#6b7c93",
  },
  subject: {
    fontSize: 16,
    color: "#14171a",
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
});

export default Inbox;
