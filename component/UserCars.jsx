import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import LottieView from "lottie-react-native";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";

export default function UserCars({ navigation, city, state }) {
  const [uploadComplete, setUploadComplete] = useState(false);
  const [addingCarModal, setAddingCarModal] = useState(false);
  const [description, setDescription] = useState("");
  const [addCarModal, setAddCarModal] = useState(false);
  const [licensePlate, setLicensePlate] = useState("");
  const [carList, setCarList] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const { user } = useUser();
  const screenWidth = Dimensions.get("window").width;

  async function deleteCar(item) {
    try {
      // Delete the car
      const deleteResult = await supabase
        .from("cars")
        .delete()
        .eq("id", item.id);

      if (deleteResult.error) {
        throw new Error("Error deleting car: " + deleteResult.error.message);
      }

      // Retrieve updated list of cars for the current user
      const userId = supabase.auth.currentUser?.id;
      const { data: cars, error } = await supabase
        .from("cars")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        throw new Error("Error retrieving cars: " + error.message);
      }

      setCarList(cars);
    } catch (error) {
      console.error(error.message);
    }
  }

  const createTwoButtonAlert = (item) =>
    Alert.alert("Delete this car", "This can not be undone", [
      {
        text: "Cancel",
        onPress: () => null,
        style: "cancel",
      },
      {
        style: "destructive",
        text: "Delete Car",
        onPress: () => deleteCar(item),
      },
    ]);

  async function uploadNewCar() {
    setUploadComplete(false);
    const userId = supabase.auth.currentUser.id;
    try {
      //   setAddingCarModal(true);
      const newCar = {
        user_id: userId,
        licensePlate,
        description,
      };
      const resp = await supabase.from("cars").insert([newCar]);
      carList.push(resp.body[0]);

      setAddCarModal(false);
      setLicensePlate("");
      setDescription("");

      return resp;
    } catch (error) {
      console.error("Error submitting comment:", error);
      throw error;
    }
  }

  useEffect(() => {
    const fetchUsersCars = async () => {
      try {
        const userId = supabase.auth.currentUser?.id;
        if (!userId) return;

        setLoading(true); // Set loading state to true when fetching data
        const { data: cars, error } = await supabase
          .from("cars")
          .select("*")
          .eq("user_id", userId);

        setCarList(cars);
        setLoading(false); // Set loading state to false after fetching data
      } catch (error) {
        setLoading(false); // Set loading state to false in case of error
        console.error("Error fetching user data:", error);
      }
    };

    fetchUsersCars();
  }, []);

  return (
    <View>
      {loading ? ( // Render loading indicator when data is being fetched
        <View style={styles.loadingIndicator}></View>
      ) : (
        <>
          <View style={{ paddingBottom: 5, top: 40 }}>
            {carList.map((item) => (
              <Pressable
                onPress={() => navigation.navigate("TaskSearch", { city })}
                key={item.id}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: 358,
                    height: 72,
                    backgroundColor: "white",
                    alignSelf: "center",
                    borderRadius: 16,
                    marginBottom: 20,
                    elevation: 5, // Add elevation for drop shadow
                    shadowColor: "#000", // Shadow color
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                  }}
                >
                  <View style={{ marginLeft: 20 }}>
                    <Image
                      style={{ height: 24, width: 24 }}
                      source={require("../assets/car.png")}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 20 }}>
                    <Text style={{ fontFamily: "gilroy", paddingBottom: 3 }}>
                      {item.licensePlate}
                    </Text>
                    <Text>{item.description}</Text>
                  </View>

                  <Pressable onPress={() => createTwoButtonAlert(item)}>
                    <View style={{ marginRight: 20 }}>
                      <Image
                        style={{ height: 25, width: 25 }}
                        source={require("../assets/info.png")}
                      />
                    </View>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>

          {carList.length > 1 ? null : (
            <Pressable onPress={() => setAddCarModal(true)}>
              <View
                style={{
                  top: 40,
                  flexDirection: "row",
                  alignItems: "center",
                  width: 358,
                  height: 72,
                  backgroundColor: "white",
                  alignSelf: "center",
                  borderRadius: 16,
                  marginBottom: 20,
                  elevation: 5, // Add elevation for drop shadow
                  shadowColor: "#000", // Shadow color
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                }}
              >
                <View style={{ marginLeft: 20 }}>
                  <Image
                    style={{ height: 24, width: 24 }}
                    source={require("../assets/add-circle.png")}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 20 }}>
                  <Text style={{ fontFamily: "gilroy" }}>Add car</Text>
                  <Text>add a car to your profile</Text>
                </View>
              </View>
            </Pressable>
          )}
        </>
      )}
      <Modal animationType="slide" visible={addCarModal}>
        <SafeAreaView>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Car Details</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="grey"
              placeholder="License Plate"
              onChangeText={(text) => setLicensePlate(text)}
            />
            <TextInput
              style={styles.descriptionInput}
              placeholderTextColor="grey"
              placeholder="Enter Car Description"
              onChangeText={(text) => setDescription(text)}
            />
            <TouchableOpacity
              onPress={() =>
                licensePlate === "" && description === ""
                  ? noInput()
                  : uploadNewCar()
              }
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Save Car</Text>
            </TouchableOpacity>

            <Button
              title="Not Yet"
              onPress={() => setAddCarModal(false)}
              color="grey"
            />
          </View>
        </SafeAreaView>
        <Modal visible={addingCarModal} animationType="slide">
          <LottieView
            style={[
              styles.lottieView,
              {
                height: uploadComplete ? 300 : 530,
                top: uploadComplete ? 200 : 80,
              },
            ]}
            source={
              uploadComplete
                ? require("../assets/lottie/#4A3AFFCheck.json")
                : require("../assets/lottie/airplaneLoading.json")
            }
            autoPlay
          />
        </Modal>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignSelf: "center",
    top: 35,
  },
  addCarImage: {
    resizeMode: "contain",
    height: Dimensions.get("window").height * 0.084,
    marginBottom: 30,
  },
  modalContent: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    height: 50,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 10,
    fontFamily: "alata",
    borderWidth: 1,
    borderColor: "#BBBBBB",
    backgroundColor: "#F3F3F9",
  },
  descriptionInput: {
    height: 140,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 30,
    paddingHorizontal: 10,
    fontFamily: "alata",
    borderWidth: 1,
    borderColor: "#BBBBBB",
    backgroundColor: "#F3F3F9",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "stretch",
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",

    textAlign: "center",
  },
  lottieView: {
    width: 530,
    alignSelf: "center",
  },
});
