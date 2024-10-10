import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";

const ProfileScreen = ({ route, navigation }) => {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const [bookingCount, setBookingCount] = useState(0);
  const [ratingAverage, setRatingAverage] = useState(0);

  const { user } = useUser();
  const [listOfServices, setListOfServices] = useState([]);
  const [listOfMedia, setListOfMedia] = useState([]); // New state for media
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Services"); // Track active tab
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility
  const [selectedImageUri, setSelectedImageUri] = useState(null); // Selected image for the modal
  const profile = route.params.item;

  async function getProfileService() {
    const resp = await supabase
      .from("services")
      .select("*")
      .eq("user_id", profile.user_id)
      .eq("deactivated", false);

    return resp;
  }

  async function getProfileMedia() {
    const resp = await supabase
      .from("portfolio")
      .select("*")
      .eq("userId", profile.user_id);

    return resp;
  }

  async function getBookingCount() {
    const res = await supabase
      .from("orders")
      .select("*")
      .eq("orderStatus", "complete")
      .eq("seller_id", profile.user_id);

    setBookingCount(res.body.length);

    return res.body;
  }

  async function getRatings() {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("rating")
        .eq("orderStatus", "complete")
        .eq("seller_id", profile.user_id);

      if (error) {
        console.error("Error fetching ratings:", error.message);
        return null; // or handle the error as needed
      }

      if (!data || data.length === 0) {
        console.log("No ratings found.");
        return null; // or handle the case where no ratings are found
      }

      // Calculate the average rating
      const totalRatings = data.reduce((sum, record) => sum + record.rating, 0);
      const averageRating = totalRatings / data.length;

      setRatingAverage(averageRating);

      return { averageRating };
    } catch (err) {
      console.error("Unexpected error:", err.message);
      return null; // or handle the error as needed
    }
  }

  useEffect(() => {
    const getUserInfo = async () => {
      if (!user) return;

      const resp = await getProfileService();
      if (resp.error) {
        console.log("Error:", resp.error.message);
      } else {
        setListOfServices(resp.data);
      }
      const res = await getBookingCount();
      const average = await getRatings();

      console.log("res", res);
      console.log("average", average);

      setRatingAverage(average);
      setBookingCount(res);

      const mediaResp = await getProfileMedia();
      if (mediaResp.error) {
        console.log("Error fetching media:", mediaResp.error.message);
      } else {
        setListOfMedia(mediaResp.data); // Set media data
      }

      setLoading(false);
    };
    getUserInfo();
  }, [user]);

  const openImageModal = (uri) => {
    setSelectedImageUri(uri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImageUri(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: profile.profileimage }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{profile.username}</Text>

        <View style={styles.profileStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {ratingAverage?.averageRating ?? 0}
            </Text>
            <Text style={styles.statLabel}>ratings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{bookingCount.length}</Text>
            <Text style={styles.statLabel}>bookings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{listOfMedia.length}</Text>
            <Text style={styles.statLabel}>media</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate("InboxDetails", { profileDetails: profile })
        }
        style={{
          backgroundColor: "black",
          width: screenWidth * 0.6,
          height: screenHeight * 0.05,
          justifyContent: "center",
          alignSelf: "center",
          borderRadius: 13,
          marginBottom: 15,
        }}
      >
        <Text
          style={{
            fontFamily: "Poppins-SemiBold",
            alignSelf: "center",
            fontSize: 15,
            color: "white",
          }}
        >
          Send Message
        </Text>
      </TouchableOpacity>

      {/* Tab Section */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setActiveTab("Services")}>
          <Text
            style={
              activeTab === "Services" ? styles.activeTab : styles.inactiveTab
            }
          >
            Services
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("Media")}>
          <Text
            style={
              activeTab === "Media" ? styles.activeTab : styles.inactiveTab
            }
          >
            Portfolio
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Rendering Based on Active Tab */}
      {activeTab === "Services" ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={listOfServices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              {/* Thumbnail */}
              <Pressable
                onPress={() => navigation.push("ServiceDetails", { item })}
              >
                <Image
                  source={{ uri: item.thumbnail }}
                  style={styles.cardThumbnail}
                />
              </Pressable>

              {/* Card Content */}
              <View style={styles.cardContent}>
                <Pressable
                  onPress={() => navigation.push("ServiceDetails", { item })}
                >
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardModerator}>
                      starting from ${item.price}
                    </Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardStats}>
                      {item.city}, {item.state}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          )}
        />
      ) : (
        <>
          {listOfMedia.length === 0 ? (
            <Text style={{ alignSelf: "center", fontWeight: "600", top: 20 }}>
              No Media Uploaded
            </Text>
          ) : (
            <FlatList
              data={listOfMedia}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3} // Set number of columns for grid
              key={"mediaGrid"} // To ensure proper grid layout rendering
              renderItem={({ item }) => (
                <Pressable onPress={() => openImageModal(item.uri)}>
                  <View style={styles.gridItem}>
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.mediaImageGrid}
                    />
                  </View>
                </Pressable>
              )}
            />
          )}
        </>
      )}

      {/* Modal for viewing image */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <Pressable style={styles.modalContainer} onPress={closeModal}>
            {selectedImageUri && (
              <>
                <View
                  style={{ justifyContent: "center", position: "absolute" }}
                >
                  <ActivityIndicator size="large" />
                </View>
                <Image
                  source={{ uri: selectedImageUri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </>
            )}
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileSection: {
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 0.1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  profileStats: {
    flexDirection: "row",
    marginTop: 10,
  },
  statItem: {
    alignItems: "center",
    marginHorizontal: 20,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#888",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  activeTab: {
    fontWeight: "bold",
    color: "black",
    borderBottomWidth: 2, // Adds a border to highlight the active tab
    borderBottomColor: "black",
  },
  inactiveTab: {
    color: "#888",
  },
  cardContainer: {
    flexDirection: "row",
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "grey",
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitleContainer: {
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardModerator: {
    fontSize: 14,
    color: "#888",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cardStats: {
    fontSize: 14,
    color: "#888",
  },
  gridItem: {
    flex: 1,
    margin: 1,
  },
  mediaImageGrid: {
    width: Dimensions.get("window").width / 3 - 2, // Divide screen width into three columns
    height: Dimensions.get("window").width / 3 - 2, // Make height equal to width for a square
    borderRadius: 5,
    backgroundColor: "grey",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "90%",
    height: "90%",
  },
});

export default ProfileScreen;
