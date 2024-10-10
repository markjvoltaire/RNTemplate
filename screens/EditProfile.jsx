import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from "react-native";
import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { supabase } from "../services/supabase";
import * as ImagePicker from "expo-image-picker";

export default function EditProfile({ navigation }) {
  // Use user context to get current user and setUser function
  const { user, setUser } = useUser();
  // Initialize state variables for image preview, image data, name, account type, and switch state
  const [imagePreview, setImagePreview] = useState(user.profileimage);
  const [imageData, setImageData] = useState(null);
  const [name, setName] = useState(user.username);
  const [isBusinessAccount, setIsBusinessAccount] = useState(
    user.accountType === "business"
  );
  const [isEnabled, setIsEnabled] = useState(user.type === "business");

  // Function to toggle account type switch
  const toggleSwitch = async () => {
    setIsEnabled((previousState) => !previousState);
    await updateAccountType();
  };

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

  // Function to open image picker and select an image
  const pickImage = async () => {
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [9, 16],
      quality: 0.1,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      const newFile = {
        uri: selectedImage.uri,
        type: `image/${selectedImage.uri.split(".").pop()}`,
        name: `image.${selectedImage.uri.split(".").pop()}`,
      };

      setImagePreview(newFile.uri);
      setImageData(newFile);
    }
  };

  // Function to handle upload response from Cloudinary
  const handleUploadResponse = async (xhr) => {
    if (xhr.status === 200) {
      const resp = JSON.parse(xhr.responseText);
      const userId = supabase.auth.currentUser.id;
      const res = await supabase
        .from("profiles")
        .update({
          profileimage: resp.secure_url,
          username: name,
          type: isBusinessAccount ? "business" : "personal",
        })
        .eq("user_id", userId);

      if (res.error) {
        console.log("ERROR", res.error);
        Alert.alert("Something Went Wrong");
      } else {
        setUser(res.data[0]);
      }
    } else {
      console.log("Upload to Cloudinary failed.");
      handleUploadFailure();
    }
  };

  // Function to handle upload error to Cloudinary
  const handleUploadError = () => {
    console.log("An error occurred during the upload to Cloudinary.");
    handleUploadFailure();
  };

  // Function to handle upload failure
  const handleUploadFailure = () => {
    Alert.alert("An error occurred during the upload");
  };

  // Function to handle the XHR request to upload the image to Cloudinary
  const handleXHR = async () => {
    const data = new FormData();
    data.append("file", imageData);
    data.append("upload_preset", "TizlyUpload");
    data.append("cloud_name", "doz01gvsj");

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "https://api.cloudinary.com/v1_1/debru0cpu/image/upload",
      true
    );

    xhr.onload = () => handleUploadResponse(xhr);
    xhr.onerror = handleUploadError;

    xhr.send(data);
  };

  // Function to handle profile update
  const editProfile = async () => {
    if (!imageData) {
      // Check if there is any change in username or account type
      if (
        user.username === name &&
        user.accountType === (isBusinessAccount ? "business" : "personal")
      ) {
        Alert.alert("No change was made");
      } else {
        if (user.username !== name) {
          await editUsername();
        }
        await updateAccountType();
        Alert.alert("Your changes were saved");
        navigation.goBack();
      }
    } else {
      await handleXHR();
      if (user.username !== name) {
        await editUsername();
      }
      Alert.alert("Your changes were saved");
      navigation.goBack();
    }
  };

  // Function to handle username update
  const editUsername = async () => {
    const userId = supabase.auth.currentUser.id;
    const res = await supabase
      .from("profiles")
      .update({ username: name })
      .eq("user_id", userId);

    if (res.error) {
      console.log("ERROR", res.error);
      Alert.alert("Something Went Wrong");
    } else {
      setUser(res.data[0]);
    }
  };

  return (
    <View style={{ padding: 16, backgroundColor: "white", flex: 1 }}>
      {/* Image picker and preview */}
      <TouchableOpacity onPress={pickImage} style={{ alignItems: "center" }}>
        <Image source={{ uri: imagePreview }} style={styles.profileImage} />
        <Text style={{ fontSize: 13, fontWeight: "400", color: "#313131" }}>
          Change Profile Image
        </Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      {/* Name input */}
      <Text style={styles.optionText}>
        {user.type === "business" ? "Business Name" : "Name"}
      </Text>
      <TextInput
        placeholder="Enter your name"
        placeholderTextColor="grey"
        style={styles.textInput}
        value={name}
        onChangeText={setName}
      />

      {/* Update profile button */}
      <TouchableOpacity onPress={editProfile} style={styles.button}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 100,
    marginBottom: 20,
    backgroundColor: "grey",
    borderWidth: 1,
    borderColor: "#4A3AFF",
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
  },
  optionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#313131",
    marginBottom: 10,
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
    marginBottom: 50,
  },
  toggleLabel: {
    fontSize: 18,
    color: "#313131",
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
  },
});
