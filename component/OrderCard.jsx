import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function OrderCard({ item, user, navigation }) {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);


  async function getUser(post) {
    const resp = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", item.seller_id)
      .single()
      .limit(1);

    return resp.body;
  }

  useEffect(() => {
    const getSeller = async () => {
      const res = await getUser();
      setProfile(res);
    };
    getSeller();
  }, []);

  if (!loading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => navigation.navigate("OrderDetails", { profile, item })}
    >
      <View
        style={{
          borderRadius: 10,
          width: screenWidth * 0.98,
          elevation: 5, // Add elevation for drop shadow
        }}
      >
        <View
          style={{
            alignSelf: "center",
            borderRadius: 10,
            backgroundColor: "white",
            width: screenWidth * 0.95,
            elevation: 5, // Add elevation for drop shadow
            shadowColor: "#000", // Shadow color
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            marginBottom: 25, // Adjust margin to accommodate drop shadow
            paddingHorizontal: 15, // Padding for inner content
            paddingVertical: 10, // Padding for inner content
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              style={{
                height: 80,
                width: 80,
                borderRadius: 10,
                backgroundColor: "grey",
              }}
              source={{ uri: profile.profileimage }}
            />

            <View style={{ marginLeft: 15 }}>
              <Text
                style={{
                  fontSize: 16,
                  paddingBottom: 5,
                }}
              >
                {profile.displayName}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#888",
                  marginBottom: 10,
                  width: screenWidth * 0.7,
                }}
              >
                2 hour Photo Shoot
              </Text>

              <Text
                style={{ fontSize: 14, paddingRight: 30, fontWeight: "600" }}
              >
                $220
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  title: {
    textAlign: "center",
    fontSize: 20,
    margin: 10,
  },
  list: {
    padding: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
