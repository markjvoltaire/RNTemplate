import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { supabase } from "../services/supabase";

export default function UploadProfilePhoto() {
  const [selectedImage, setSelectedImage] = useState(null);

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
      const newFile = {
        uri: result.assets[0].uri,
        type: `image/${result.assets[0].uri.split(".").pop()}`,
        name: `image.${result.assets[0].uri.split(".").pop()}`,
      };

      console.log("newFile", newFile);
      setSelectedImage(newFile);
    }
  };

  const resetImage = () => {
    setSelectedImage(null);
  };

  const handleUploadResponse = async (xhr, serviceData) => {
    if (xhr.status === 200) {
      const resp = JSON.parse(xhr.responseText);
      console.log("resp", resp);
      const userId = supabase.auth.currentUser.id;

      const { data, error } = await supabase.from("portfolio").insert([
        {
          userId: userId,
          type: resp.resource_type,
          uri: resp.secure_url,
        },
      ]);

      resetImage();
      Alert.alert("Image Added To Your Profile");
      return data;
    } else {
      console.log("Upload to Cloudinary failed.");
      Alert.alert("Upload Failed", "There was an issue uploading the image.");
    }
  };

  const handleUploadError = () => {
    console.log("An error occurred during the upload to Cloudinary.");
    Alert.alert("Upload Error", "An error occurred while uploading the image.");
  };

  const handleXHR = async () => {
    const data = new FormData();
    data.append("file", selectedImage);
    data.append("upload_preset", "TizlyUpload");

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "https://api.cloudinary.com/v1_1/debru0cpu/image/upload",
      true
    );

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        handleUploadResponse(xhr, selectedImage);
      } else {
        handleUploadError(xhr);
      }
    };

    xhr.onerror = () => handleUploadError(xhr);

    xhr.send(data);
  };

  const uploadImage = async () => {
    // Logic to upload the image goes here
    await handleXHR();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload a photo to your portfolio</Text>
      <Text style={styles.subtitle}>Upload from your library.</Text>

      <View style={styles.iconContainer}>
        {/* Display the selected image, or a placeholder */}
        {selectedImage ? (
          <Image source={{ uri: selectedImage.uri }} style={styles.image} />
        ) : (
          <View style={styles.iconPlaceholder}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
        )}
      </View>

      {!selectedImage ? (
        <TouchableOpacity style={styles.libraryButton} onPress={pickImage}>
          <Text style={styles.buttonText}>ADD FROM LIBRARY</Text>
        </TouchableOpacity>
      ) : (
        <View>
          <TouchableOpacity style={styles.uploadButton} onPress={uploadImage}>
            <Text style={styles.buttonText}>UPLOAD</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeButton} onPress={resetImage}>
            <Text
              style={{
                color: "black",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              REMOVE IMAGE
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconPlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: "#F0F0F0",
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    fontSize: 50,
    color: "#D9D9D9",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  libraryButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  uploadButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 15, // Space between buttons
  },
  removeButton: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
  },
});
