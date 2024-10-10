import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { useUser } from "../context/UserContext";
import { supabase } from "../services/supabase";

const timeOptions = [
  "None", // Option to clear the time
  "7:00 AM",
  "7:30 AM",
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
];
const MyHours = () => {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const { user, setUser } = useUser();

  const initialState = {
    mondayFrom: user.mondayfrom || null,
    mondayTo: user.mondayto || null,
    tuesdayFrom: user.tuesdayfrom || null,
    tuesdayTo: user.tuesdayto || null,
    wednesdayFrom: user.wednesdayfrom || null,
    wednesdayTo: user.wednesdayto || null,
    thursdayFrom: user.thursdayfrom || null,
    thursdayTo: user.thursdayto || null,
    fridayFrom: user.fridayfrom || null,
    fridayTo: user.fridayto || null,
    saturdayFrom: user.saturdayfrom || null,
    saturdayTo: user.saturdayto || null,
    sundayFrom: user.sundayfrom || null,
    sundayTo: user.sundayto || null,
  };

  const [state, setState] = useState(initialState);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const openModal = (day, type) => {
    setSelectedDay(day);
    setSelectedType(type);
    setModalVisible(true);
  };

  const updateTime = async (column, time) => {
    console.log("time", time);
    const resp = await supabase
      .from("profiles")
      .update({ [column]: time })
      .eq("user_id", user.user_id);

    setUser(resp.body[0]);

    return resp;
  };

  const handleTimeSelect = (time) => {
    const column = `${selectedDay}${selectedType}`;
    setState((prevState) => ({
      ...prevState,
      [`${selectedDay}${
        selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
      }`]: time,
    }));

    updateTime(column, time);
    setModalVisible(false);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const renderDayInput = (day, from, to) => (
    <View key={day} style={styles.dayContainer}>
      <Text style={styles.dayLabel}>
        {day.charAt(0).toUpperCase() + day.slice(1)}
      </Text>
      <View style={styles.timeContainer}>
        <TouchableOpacity
          style={styles.timeInput}
          onPress={() => openModal(day, "from")}
        >
          <Text>{from || "From"}</Text>
        </TouchableOpacity>
        <Text style={styles.timeSeparator}>-</Text>
        <TouchableOpacity
          style={styles.timeInput}
          onPress={() => openModal(day, "to")}
        >
          <Text>{to || "To"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {renderDayInput("monday", state.mondayFrom, state.mondayTo)}
        {renderDayInput("tuesday", state.tuesdayFrom, state.tuesdayTo)}
        {renderDayInput("wednesday", state.wednesdayFrom, state.wednesdayTo)}
        {renderDayInput("thursday", state.thursdayFrom, state.thursdayTo)}
        {renderDayInput("friday", state.fridayFrom, state.fridayTo)}
        {renderDayInput("saturday", state.saturdayFrom, state.saturdayTo)}
        {renderDayInput("sunday", state.sundayFrom, state.sundayTo)}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 500 }}
                >
                  {timeOptions.map((time, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        paddingVertical: 15,
                        flex: 1,
                        alignItems: "center",
                        width: screenWidth * 0.68,
                        borderBottomWidth: 1,
                        borderBottomColor: "#ccc",
                      }}
                      onPress={() => handleTimeSelect(time)}
                    >
                      <Text>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  dayContainer: {
    marginBottom: 15,
  },
  dayLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeInput: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  timeSeparator: {
    fontSize: 20,
    marginHorizontal: 10,
  },
  saveButton: {
    backgroundColor: "blue",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOption: {
    paddingVertical: 15,
    flex: 1,
    alignItems: "center",
    width: 300,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default MyHours;
