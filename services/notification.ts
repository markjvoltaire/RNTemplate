import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { supabase } from "./supabase";
import { useUser } from "../context/UserContext";
import { getNoti } from "./user";

export async function registerForPushNotificationsAsync() {
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

    console.log("EXISITING STATUS", existingStatus);
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.easConfig?.projectId,
      })
    ).data;
    if (existingStatus === "granted") {
      await getNoti(token);
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}

// Can use this function below or use Expo's Push Notification Tool from: https://expo.dev/notifications
export async function sendPushNotification(
  title: string,
  body: string,
  tokenCode: string
) {
  const message = {
    to: tokenCode,
    sound: "default",
    title: "Tizly",
    body: title,
    data: { someData: "goes here" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

const getUser = async (user: any) => {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.user_id)
    .single();
  return data?.expo_push_token;
};

export const notifyUserAboutNewComment = async (
  user: any,
  comment: string,
  tokenCode: string
) => {
  const token = await getUser(user.user_id);
  const body = `${user.username} commented: ${comment}`;
  sendPushNotification(token, body, tokenCode);
};

export const notifyUserAboutNewRequest = async (
  user: any,
  tokenCode: string
) => {
  const token = await getUser(user.user_id);
  const body = `${user.username} sent you a friend request`;
  sendPushNotification(token, body, tokenCode);
};

export const notifyUserAboutNewFriend = async (
  user: any,
  tokenCode: string
) => {
  const token = await getUser(user.user_id);
  const body = `${user.username} accepted your friend request`;
  sendPushNotification(token, body, tokenCode);
};

export const notifyUserAboutNewReaction = async (
  user: any,
  tokenCode: string
) => {
  const token = await getUser(user.user_id);
  const body = `${user.username} reacted to your post`;
  sendPushNotification(token, body, tokenCode);
};

export const setNotification = async (tokenCode: string) => {
  // const { data } = await supabase
  //   .from("profiles")
  //   .select("*")
  //   .eq("id", user.user_id)
  //   .single();
  // return data?.expo_push_token;
};
