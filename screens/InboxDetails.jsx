import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions,
  Pressable,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useUser } from "../context/UserContext";
import { supabase } from "../services/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { sendPushNotification } from "../services/notification";

export default function InboxDetails({ route, navigation }) {
  const profileDetails = route.params.profileDetails;
  const [refreshing, setRefreshing] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;
  const [loading, setLoading] = useState(true);
  const [isThereMessages, setIsThereMessages] = useState(false);
  const [threadId, setThreadId] = useState();
  const { user } = useUser();

  const getMessages = async () => {
    try {
      const userId = supabase.auth.currentUser.id;
      const resp = await supabase
        .from("messages")
        .select("*")
        .in("sender", [profileDetails.user_id, userId])
        .in("receiver", [profileDetails.user_id, userId])
        .order("created_at", { ascending: true });

      if (resp.error) throw new Error(resp.error.message);

      if (resp.body.length === 0) {
        setIsThereMessages(false);
      } else {
        setThreadId(resp.body[0].threadID);
        setIsThereMessages(true);
      }
      return resp.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  };

  const sendNotification = async (body, title) => {
    try {
      // Notification message
      const message = {
        to: profileDetails.expo_push_token,
        sound: "default",
        title: title,
        body: body,
      };

      // Send the notification
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          host: "exp.host",
          accept: "application/json",
          "accept-encoding": "gzip, deflate",
          "content-type": "application/json",
        },
        body: JSON.stringify(message),
      });

      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Notification sent successfully:", data);
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };
  const sendMessage = async () => {
    try {
      const userId = supabase.auth.currentUser.id;
      const body = `New message from ${user.username}`;
      const title = "Tizly";
      const tokenCode = profileDetails.expo_push_token;

      if (messageText.trim() !== "") {
        const res = await supabase.from("messages").insert([
          {
            type: "message",
            sender: userId,
            receiver: profileDetails.user_id,
            message: messageText.trim(),
            threadID: isThereMessages
              ? threadId
              : `${userId}${profileDetails.user_id}`,
          },
        ]);

        if (res.error) {
          console.error("Error inserting message:", res.error);
          Alert.alert("An error has occurred, please try again.");
          return;
        }

        setMessages([
          ...messages,
          { sender: userId, message: messageText.trim() },
        ]);
        setMessageText("");

        try {
          await sendNotification(body, title, tokenCode);
        } catch (notificationError) {
          console.error("Error sending push notification:", notificationError);
        }
      } else {
        Alert.alert("Please enter a message before sending.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("An error has occurred, please try again.");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const resp = await getMessages();
    setMessages(resp);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      const fetchData = async () => {
        try {
          const resp = await getMessages();
          if (isMounted) setMessages(resp);
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
      const resp = await getMessages();
      setMessages(resp);
      setLoading(false);
    };
    retrieveMessages();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : -200}
    >
      <View style={[styles.container, { height: screenHeight }]}>
        {messages.length === 0 ? (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            contentContainerStyle={styles.messagesContainer}
          >
            <View style={styles.noMessagesContainer}>
              <Text style={styles.noMessagesText}>
                Be the first to start the conversation
              </Text>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={true}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            contentContainerStyle={styles.messagesContainer}
          >
            {messages.map((message, index) => (
              <Message
                message={message}
                user={user}
                profileDetails={profileDetails}
                key={index}
                sender={message.sender}
                navigation={navigation}
              >
                {message.message}
              </Message>
            ))}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            placeholderTextColor="#080A0B"
            style={styles.commentInput}
            placeholder="Add a message "
            multiline
            value={messageText}
            onChangeText={setMessageText}
          />
          <Pressable
            onPress={sendMessage}
            style={{
              backgroundColor: "#4A3AFF",
              width: screenWidth * 0.25,
              height: screenHeight * 0.04,
              justifyContent: "center",
              borderRadius: 10,
            }}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const Message = ({ sender, children, message, user, navigation }) => {
  const date = new Date(message.created_at);
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

  const messageStyle =
    sender === user.user_id ? styles.userMessage : styles.businessMessage;

  return (
    <Pressable onLongPress={() => console.log("Hello")}>
      <View style={[styles.messageContainer, messageStyle]}>
        <Text
          style={
            sender === user.user_id ? styles.userText : styles.businessText
          }
        >
          {children}
        </Text>
        <Text
          style={
            sender === user.user_id ? styles.userText : styles.businessText
          }
        >
          {formattedDate}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 20,
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noMessagesText: {
    fontSize: 16,
  },
  commentInput: {
    alignSelf: "center",
    paddingLeft: 8,
    borderColor: "black",
    borderWidth: 0.3,
    borderRadius: 12,
    backgroundColor: "#F3F3F9",
    width: 250,
    height: 40,
    fontSize: 13,
    paddingTop: 12,
    justifyContent: "center",
  },
  messageContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    width: 300,
  },
  userMessage: {
    backgroundColor: "#e0e0e0",
    alignSelf: "flex-end",
  },
  businessMessage: {
    backgroundColor: "#4A3AFF",
    alignSelf: "flex-start",
  },
  userText: {
    color: "black",
    fontWeight: "600",
    marginBottom: 5,
  },
  businessText: {
    color: "white",
    fontWeight: "600",
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "white",
  },
  sendButton: {},
  sendButtonText: {
    color: "white",
    fontWeight: "800",
    alignSelf: "center",
  },
});
