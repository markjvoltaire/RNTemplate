import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
  Modal,
  SafeAreaView,
  TextInput,
  ScrollView,
} from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useUser } from "../context/UserContext";
import LottieView from "lottie-react-native";
import { supabase } from "../services/supabase";
import { getUser } from "../services/user";

export default function ConfirmBooking({ route, navigation }) {
  const { selectedDate, selectedTime } = route.params;
  const service = route.params.service;
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [hours, setHours] = useState(1); // Default to 1 hour
  const stripe = useStripe();
  const { user } = useUser();
  const [sellerBlob, setSellerBlob] = useState();

  // Function to calculate only the Stripe fee
  const calculateStripeFee = (price, hours) => {
    const serviceTotal = price * hours;
    const stripeFee = serviceTotal * 0.029 + 0.3; // 2.9% fee + $0.30 fixed fee
    return stripeFee;
  };

  // Function to calculate the total price including Stripe fee
  const calculateTotalPrice = (price, hours) => {
    const serviceTotal = price * hours;
    const stripeFee = calculateStripeFee(price, hours);
    return serviceTotal + stripeFee;
  };
  // Convert selectedDate to a readable format
  const formattedDate = new Date(selectedDate).toLocaleDateString();

  const sendNotification = async (body, title, tokenCode) => {

    // notification message
    const message = {
      to: tokenCode,
      sound: "default",
      title: title,
      body: body,
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        host: "exp.host",
        accept: "application/json",
        "accept-encoding": "gzip, deflate",
        "content-type": "application/json",
      },
      body: JSON.stringify(message),
    });
  };

  async function uploadOrder() {
    const resp = await getUser(service);
    const tokenCode = resp.body.expo_push_token;
    const body = `🎉 Great news! You've been booked.`;
    const title = "Tizly";
    try {
      const newOrder = {
        seller_id: route.params.service.user_id,
        purchaserId: user.user_id,
        orderStatus: "incomplete",
        date: selectedDate,
        time: selectedTime,
        serviceId: service.id,
        serviceTitle: service.title,
      };
      const resp = await supabase.from("orders").insert([newOrder]);

      await sendNotification(body, title, tokenCode);
      return resp;
    } catch (error) {
      console.error("Error submitting comment:", error);
      throw error;
    }
  }

  const handlePayPress = async () => {
    setLoading(true); // Set loading state to true
    setProcessing(true);
    const sellerStripeId = sellerBlob.stripeAccountId;
    try {
      const response = await fetch("https://tizlyexpress.onrender.com/pay", {
        method: "POST",
        body: JSON.stringify({
          servicePrice: service.price * hours,
          sellerStripeId: sellerStripeId,
        }), // Multiply price by hours if byHour is true
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("data", data);
      if (!response.ok) {
        Alert.alert(data.message);
        setLoading(false); // Set loading state to false
        setProcessing(false);
        return;
      }
      const clientSecret = data.clientSecret;
      const initSheet = await stripe.initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        returnURL: null,
      });
      if (initSheet.error) {
        Alert.alert(initSheet.error.message);
        setLoading(false); // Set loading state to false
        setProcessing(false);
        return;
      }
      const presentSheet = await stripe.presentPaymentSheet({
        clientSecret,
      });
      if (presentSheet.error) {
        console.log("presentSheet", presentSheet);
        setLoading(false); // Set loading state to false
        setProcessing(false);
        return;
      }
      const order = await uploadOrder();
      Alert.alert("Payment complete, thank you!");

      navigation.navigate("OrderConfirmation", { order });

      return order;
    } catch (err) {
      console.error(err);
      Alert.alert("Something went wrong, try again later!");
    } finally {
      setLoading(false); // Ensure loading state is set to false in the finally block
      setProcessing(false);
    }
  };

  useEffect(() => {
    const getSellerBlob = async () => {
      const resp = await getUser(service);
      setSellerBlob(resp.body);
      setLoading(false);
    };
    getSellerBlob();
  }, []);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.serviceDetailsContainer}>
        <Image style={styles.thumbnail} source={{ uri: service.thumbnail }} />
        <View style={styles.serviceTextContainer}>
          <Text style={styles.serviceTitle}>{service.title}</Text>

          <Text style={styles.serviceAddress}>
            7683 Thornton Avenue, Newark, Cali...
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>{formattedDate}</Text>
        <Text style={styles.infoText}>{selectedTime}</Text>
      </View>

      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>{service.title}</Text>
          <Text style={styles.priceValue}>${service.price}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Processing Fee</Text>
          <Text style={styles.priceValue}>
            ${calculateStripeFee(service.price, hours).toFixed(2)}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.totalValue}>
            ${calculateTotalPrice(service.price, hours).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.discountContainer}>
        <Text style={styles.sectionTitle}>Discount code</Text>
        <View style={styles.discountInputRow}>
          <TextInput
            style={styles.discountInput}
            placeholder="Enter discount code"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handlePayPress}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>

      <Modal visible={processing} animationType="fade">
        <SafeAreaView style={styles.modalContainer}>
          <LottieView
            style={styles.animation}
            source={require("../assets/lottie/3Dots.json")}
            autoPlay
          />
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  serviceDetailsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  serviceTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  serviceRating: {
    fontSize: 16,
    marginVertical: 4,
  },
  serviceAddress: {
    fontSize: 14,
    color: "#666",
  },
  infoContainer: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoText: {
    fontSize: 16,
    color: "#333",
  },
  priceContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 16,
  },
  priceValue: {
    fontSize: 16,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
  },
  discountContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  discountInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  discountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginLeft: 10,
    borderRadius: 5,
  },
  applyButtonText: {
    fontWeight: "bold",
  },
  paymentContainer: {
    marginBottom: 20,
  },
  paymentInfo: {
    fontSize: 16,
    color: "#333",
  },
  confirmButton: {
    backgroundColor: "#000",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    backgroundColor: "#000",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: 200,
    height: 200,
  },
});
