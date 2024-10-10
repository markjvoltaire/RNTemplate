import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getRandomUser } from "../services/user";
import GigCard from "../component/GigCard";

export default function TaskSearch({ route, navigation }) {
  const [businessList, setBusinessList] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("route", route.params);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await getRandomUser();
        setBusinessList(resp);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          backgroundColor: "white",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <FlatList
        showsVerticalScrollIndicator={false}
        style={{}}
        data={businessList}
        renderItem={({ item }) => (
          <GigCard navigation={navigation} item={item} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
