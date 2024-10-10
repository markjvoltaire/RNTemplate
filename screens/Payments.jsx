import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Animated,
} from "react-native";
import { useUser } from "../context/UserContext";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../services/supabase";

export default function BillingScreen() {
  const { user, setUser } = useUser();
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [error, setError] = useState(null);
  const [accountLinkCreatePending, setAccountLinkCreatePending] =
    useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState(
    user.stripeAccountId
  );

  const [email, setEmail] = useState("");
  const [onBoard, setOnBoard] = useState(user.businessOnBoardComplete);
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  async function getUser() {
    try {
      const resp = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.user_id)
        .single()
        .limit(1);

      return resp.body ?? null;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      const fetchData = async () => {
        try {
          const resp = await getUser();
          if (isMounted) {
            console.log("resp", resp);
            resp.businessOnBoardComplete ? null : setOnBoard(null);
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      };

      fetchData();

      return () => {
        isMounted = false;
      };
    }, [setUser])
  );

  useEffect(() => {
    // Simulate a loading period then fade in
    setTimeout(() => {
      setIsLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1000);
  }, [fadeAnim]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const createAccount = async () => {
    if (!email || !validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setAccountCreatePending(true);
    setError(null);

    try {
      const response = await fetch(
        "https://tizlyexpress.onrender.com/yooaccount",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            userId: user.user_id,
            username: user.username,
            email: user.email,
          }),
        }
      );

      if (!response.ok) {
        console.log("response", response);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const json = await response.json();

        if (json.account) {
          setConnectedAccountId(json.account);
        }

        if (json.error) {
          setError(json.error);
        }
      } else {
        const text = await response.text();
        console.warn("Received non-JSON response:", text);
        setError("Unexpected response format.");
      }

      setAccountCreatePending(false);
    } catch (error) {
      console.error("Error creating account:", error);
      setError(error.message);
      setAccountCreatePending(false);
    }
  };

  const addInformation = async () => {
    setAccountLinkCreatePending(true);
    setError(null);

    try {
      const response = await fetch(
        "https://tizlyexpress.onrender.com/accountLink",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account: connectedAccountId,
            userId: user.user_id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const json = await response.json();

      if (json.accountLink.url) {
        console.log(json.accountLink.url);
        Linking.openURL(json.accountLink.url);
      }

      if (json.stepsLeft === 0) {
        const resp = await getUser();
        setUser(resp);
        setOnBoard(true);
      }

      if (json.error) {
        setError(json.error);
      }

      setAccountLinkCreatePending(false);
    } catch (error) {
      console.error("Error creating account link:", error);
      setError(error.message);
      setAccountLinkCreatePending(false);
    }
  };

  const CustomButton = ({ title, onPress, disabled }) => (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="grey" />
        </View>
      ) : (
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={require("../assets/introImage.png")}
            />
          </View>
          <View style={styles.formContainer}>
            {!connectedAccountId && (
              <>
                <Text style={styles.title}>
                  Enter your business email to continue.
                </Text>
                <TextInput
                  autoCapitalize="none"
                  style={styles.input}
                  placeholder="Email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <CustomButton
                  title="Continue"
                  onPress={createAccount}
                  disabled={accountCreatePending}
                />
                {accountCreatePending && (
                  <ActivityIndicator size="large" color="#4A3AFF" />
                )}
              </>
            )}
            {connectedAccountId && (
              <>
                {onBoard === true ? (
                  <>
                    <Text style={styles.title}>
                      You can now start accepting payments.
                    </Text>
                    <Text style={styles.description}>
                      Tizly partners with Stripe to help you receive payments
                      and keep your personal bank and details secure.
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.title}>
                      Almost there! Just a few steps left to begin posting your
                      services and start accepting payments!
                    </Text>
                    <Text style={styles.description}>
                      Tizly partners with Stripe to help you receive payments
                      and keep your personal bank and details secure.
                    </Text>
                  </>
                )}
                <CustomButton
                  title={
                    onBoard === true
                      ? "Edit Payment Information"
                      : "Review Form"
                  }
                  onPress={addInformation}
                  disabled={accountLinkCreatePending}
                />
                {accountLinkCreatePending && (
                  <ActivityIndicator size="large" color="#4A3AFF" />
                )}
              </>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  imageContainer: {
    marginVertical: 20,
  },
  image: {
    height: 200,
    width: 200,
  },
  formContainer: {
    paddingHorizontal: 20,
    width: "100%",
  },
  title: {
    fontSize: 19,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  description: {
    marginBottom: 20,
    color: "grey",
    alignSelf: "center",
    fontSize: 15,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
  statusContainer: {
    marginTop: 20,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
  },
  boldText: {
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    backgroundColor: "#4A3AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
