import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../services/supabase";
import { useUser } from "../context/UserContext";

const AddDate = ({ route, navigation }) => {
  const { user, setUser } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const serviceBlob = route.params.serviceInfo;

  const getDaysInMonth = useCallback((year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, []);

  const renderDateItem = ({ item }) => {
    const isPastDate = item < new Date().setHours(0, 0, 0, 0); // Set to start of current day

    const handleDateSelection = () => {
      if (!isPastDate) {
        setSelectedDate(item);
        setSelectedTime(null);
        navigation.navigate("SelectTime", {
          selectedDate: item.getTime(),
          serviceDetails: route.params.item,
          serviceBlob,
        }); // Pass timestamp instead of Date object
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.dateItem,
          selectedDate &&
            selectedDate.toDateString() === item.toDateString() &&
            styles.selectedItem,
          isPastDate && styles.disabledItem,
        ]}
        onPress={handleDateSelection}
        disabled={isPastDate}
      >
        <Text style={styles.dateText}>{item.getDate()}</Text>
        <Text style={styles.dayText}>
          {item.toLocaleString("default", { weekday: "short" })}
        </Text>
      </TouchableOpacity>
    );
  };

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.monthContainer}>
        <Button
          title="Prev"
          onPress={() => changeMonth(-1)}
          disabled={
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear()
          }
        />
        <Text style={styles.monthText}>
          {currentDate.toLocaleString("default", { month: "long" })}{" "}
          {currentDate.getFullYear()}
        </Text>
        <Button title="Next" onPress={() => changeMonth(1)} />
      </View>

      <FlatList
        key={"dates"}
        data={getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())}
        renderItem={renderDateItem}
        keyExtractor={(item) => item.toISOString()}
        numColumns={7}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  header: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "300",
    paddingHorizontal: 10,
  },
  monthContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "500",
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
  },
  dateItem: {
    flex: 1,
    paddingVertical: 15,
    margin: 3,
    backgroundColor: "#f9f9f9",
    borderRadius: 155,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    minWidth: 44, // Ensures double-digit numbers fit
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dayText: {
    fontSize: 12,
    textAlign: "center",
  },
  selectedItem: {
    backgroundColor: "#cce5ff",
    padding: 5,
  },
  disabledItem: {
    backgroundColor: "#e0e0e0",
  },
  itemText: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 16,
    width: "100%",
  },
  loadingContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
});

export default AddDate;
