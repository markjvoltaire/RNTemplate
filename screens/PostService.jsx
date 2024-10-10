import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Alert,
  Modal,
  Dimensions,
  Switch,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";
import { useFocusEffect } from "@react-navigation/native";
import LottieView from "lottie-react-native";

export default function PostService({ navigation }) {
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageData, setImageData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [byHour, setByHour] = useState(false);
  const { user, setUser } = useUser();
  const height = Dimensions.get("window").height;
  const width = Dimensions.get("window").width;
  const [onBoard, setOnBoard] = useState(user.stripeAccountId);

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
            resp.stripeAccountId ? null : setOnBoard(null);
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

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("You've refused to allow this app to access your photos!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setThumbnail(result.assets[0].uri);

      const newFile = {
        uri: result.assets[0].uri,
        type: `image/${result.assets[0].uri.split(".").pop()}`,
        name: `image.${result.assets[0].uri.split(".").pop()}`,
      };

      console.log("newFile", newFile);
      setImageData(newFile);
    }
  };

  const handleXHR = async (serviceData) => {
    setModalVisible(true);

    const data = new FormData();
    data.append("file", imageData);
    data.append("upload_preset", "TizlyUpload");

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "https://api.cloudinary.com/v1_1/debru0cpu/image/upload",
      true
    );

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        handleUploadResponse(xhr, serviceData);
      } else {
        handleUploadError(xhr);
      }
    };

    xhr.onerror = () => handleUploadError(xhr);

    xhr.send(data);
  };

  const handleUploadResponse = async (xhr, serviceData) => {
    if (xhr.status === 200) {
      const resp = JSON.parse(xhr.responseText);
      const userId = supabase.auth.currentUser.id;

      const { data, error } = await supabase.from("services").insert([
        {
          user_id: userId,
          description: description,
          city: user.city,
          state: user.state,
          title: title,
          thumbnail: resp.secure_url,
          price: price,
          byHour: byHour,
          latitude: user.latitude,
          longitude: user.longitude,
        },
      ]);

      console.log("data", data);
      console.log("error", error);

      Alert.alert("Your Service Was Added");
      setModalVisible(false);
      setDescription("");
      setThumbnail(null);
      setPrice("");
      setTitle("");
      setImageData(null);
      setByHour(false);
      return data;
    } else {
      console.log("Upload to Cloudinary failed.");
      handleUploadFailure();
      setModalVisible(false);
    }
  };

  const handleUploadError = () => {
    console.log("An error occurred during the upload to Cloudinary.");
    handleUploadFailure();
    setModalVisible(false);
  };

  const handleUploadFailure = () => {
    Alert.alert("An error occurred during the upload");
    setModalVisible(false);
  };

  const handleClear = () => {
    console.log("CLEAR");
    setDescription("");
    setImageData(null);
    setPrice("");
    setThumbnail(null);
    setTitle("");
    setByHour(false);
  };

  const handleSubmit = async () => {
    const serviceData = {
      title,
      thumbnail,
      description,
      price,
      byHour,
    };

    if (!description || !imageData || !title || !thumbnail || !price) {
      Alert.alert("Please fill all fields.");
      return;
    }

    await handleXHR(serviceData);

    Keyboard.dismiss();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const LoadingModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <LottieView
              autoPlay
              style={{ height: 300, width: 300, alignSelf: "center" }}
              source={require("../assets/lottie/3Dots.json")}
            />
          </View>
        </View>
      </Modal>
    );
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

  if (!onBoard) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <Image
          style={{ height: 250, width: 250, alignSelf: "center" }}
          source={require("../assets/postNeedOnBoard.png")}
        />
        <View
          style={{
            width: width * 0.97,
            alignSelf: "center",
          }}
        >
          <Text style={{ alignSelf: "center", fontSize: 19, marginBottom: 10 }}>
            Before you post a service, we’d love to get to know your business
            better.
          </Text>

          <Text
            style={{
              marginBottom: 20,
              color: "grey",
              alignSelf: "center",
              fontSize: 15,
            }}
          >
            Provide your business details to verify your account and start
            posting services.
          </Text>
          <CustomButton
            onPress={() => navigation.navigate("AuthName")}
            title="Get Started"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={dismissKeyboard}
        >
          <View>
            <Text style={styles.label}>Service Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter service name"
            />

            <Text style={styles.label}>Service Thumbnail</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {thumbnail ? (
                <Image source={{ uri: thumbnail }} style={styles.image} />
              ) : (
                <Text style={{ color: "grey" }}>Select an Image</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Service Description</Text>
            <TextInput
              style={styles.inputDescription}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your service in detail, highlighting key features, benefits, and any unique aspects."
              multiline
            />

            <Text style={styles.label}>Service Price</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter the price of the service"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Charge by the hour</Text>
              <Switch value={byHour} onValueChange={setByHour} />
            </View>

            <View style={{ paddingBottom: 50 }}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={{
                  backgroundColor: "#4A3AFF",
                  width: width * 0.8,
                  height: height * 0.06,
                  padding: 12,
                  alignSelf: "center",
                  borderRadius: 13,
                  top: 20,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins-SemiBold",
                    alignSelf: "center",
                    fontSize: 18,
                    color: "white",
                  }}
                >
                  Post Service
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 450 }}>
              <TouchableOpacity
                onPress={handleClear}
                style={{
                  backgroundColor: "black",
                  width: width * 0.8,
                  height: height * 0.06,
                  padding: 12,
                  alignSelf: "center",
                  borderRadius: 13,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins-SemiBold",
                    alignSelf: "center",
                    fontSize: 18,
                    color: "white",
                  }}
                >
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <LoadingModal />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
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
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  inputDescription: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
    height: 170,
    backgroundColor: "#F3F3F9",
    color: "black",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#F3F3F9",
    marginBottom: 12,
  },
  imagePicker: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F3F9",
    height: 200,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4A3AFF",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
  },
});
