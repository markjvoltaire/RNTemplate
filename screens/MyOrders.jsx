import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useCallback, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";
import LottieView from "lottie-react-native";
import { getUser } from "../services/user";

export default function MyOrders({ navigation }) {
  const { user } = useUser();
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const getOffers = async () => {
    try {
      const userId = user?.user_id;
      if (!userId) {
        console.error("User ID is not defined.");
        return [];
      }
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .or(`seller_id.eq.${userId},purchaserId.eq.${userId}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching offers:", error);
      return [];
    }
  };

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const orders = await getOffers();
    setOrderList(orders);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [user])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const NoOrders = () => (
    <View style={styles.noOrdersContainer}>
      <Text style={styles.noOrdersText}>NO ORDERS</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {orderList.length === 0 ? (
        <NoOrders />
      ) : (
        orderList.map((order) => (
          <ServiceItem key={order.id} service={order} navigation={navigation} />
        ))
      )}
    </ScrollView>
  );
}

const ServiceItem = ({ service, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({});
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  async function getUser(service) {
    const resp = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", service.seller_id)
      .single()
      .limit(1);

    return resp.body;
  }

  useEffect(() => {
    const getUserInfo = async () => {
      const resp = await getUser(service);

      setUserInfo(resp);
      setLoading(false);
    };
    getUserInfo();
  }, []);

  if (loading) {
    return (
      <View
        style={[
          styles.serviceItem,
          {
            width: screenWidth * 0.98,
            height: screenHeight * 0.13,
            justifyContent: "center",
          },
        ]}
      >
        <LottieView
          style={{
            height: 50,
            width: 50,
            alignSelf: "center",
          }}
          source={require("../assets/lottie/greyCircle.json")}
          autoPlay
        />
      </View>
    );
  }

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <Pressable onPress={() => navigation.navigate("OrderDetails", { service })}>
      <View style={[styles.serviceItem, { width: screenWidth * 0.98 }]}>
        <View style={{ flexDirection: "row" }}>
          <Image
            style={{
              height: 70,
              width: 70,
              borderRadius: 10,
              marginRight: 10,
              backgroundColor: "grey",
            }}
            source={{ uri: userInfo.profileimage }}
          />
          <View>
            <Text
              style={{
                width: screenWidth * 0.9,
                fontWeight: "700",
              }}
            >
              {service.serviceTitle}
            </Text>

            <Text>{formatDate(service.date)}</Text>

            <Text>{service.time}</Text>
            {service.orderStatus === "complete" ? (
              <Text style={{ fontWeight: "700", color: "green" }}>
                Complete
              </Text>
            ) : (
              <Text style={{ fontWeight: "700", color: "grey" }}>
                Incomplete
              </Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    backgroundColor: "white",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: Dimensions.get("window").height * 0.8,
    backgroundColor: "white",
  },
  noOrdersText: {
    fontSize: 18,
    color: "gray",
  },
  loginContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loginTitle: {
    fontSize: 30,
    marginBottom: 20,
  },
  loginSubtitle: {
    fontSize: 15,
    marginBottom: 10,
    color: "#717171",
  },
  loginDescription: {
    fontSize: 20,
    marginBottom: 20,
    color: "#717171",
  },
  loginButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "stretch",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  modalContainer: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    top: 200,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "#F3F3F9",
  },
  modalButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "stretch",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  modalOptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  modalOptionText: {
    marginRight: 5,
  },
  modalOptionButton: {
    marginBottom: 10,
    marginBottom: 20,
  },
  modalOptionButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
  serviceItem: {
    backgroundColor: "white",
    alignSelf: "center",
    borderRadius: 10,
    marginBottom: 1,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    borderWidth: 3,
    borderColor: "#f5f5f5",
    padding: 10,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#313131",
  },
  servicePay: {
    fontSize: 16,
    marginBottom: 15,
    color: "#313131",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  serviceText: {
    fontSize: 14,
    color: "#313131",
  },
});
