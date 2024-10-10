import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../services/supabase";

// Generate array with both whole hours and half hours in 12-hour format (AM/PM)
const generateHoursOfDay = () => {
  const hoursOfDay = [];
  for (let hour = 7; hour < 24; hour++) {
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    hoursOfDay.push(`${displayHour}:00 ${period}`);
    hoursOfDay.push(`${displayHour}:30 ${period}`);
  }
  return hoursOfDay;
};

export default function SelectTime({ route, navigation }) {
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoursOfDay, setHoursOfDay] = useState(null);
  const [bookedTimes, setBookedTimes] = useState([]);
  const service = route.params.serviceBlob;

  const getBookedTimes = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("seller_id", service.user_id);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return null;
    }
  };

  const getProfileService = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "mondayfrom, mondayto, tuesdayfrom, tuesdayto, wednesdayfrom, wednesdayto, thursdayfrom, thursdayto, fridayfrom, fridayto, saturdayfrom, saturdayto, sundayfrom, sundayto"
        )
        .eq("user_id", service.user_id);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("No profile data found");
      }

      return data[0];
    } catch (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return null;
    }
  };

  const parseTime = (timeString) => {
    const [time, period] = timeString.split(" ");
    let [hour, minute] = time.split(":").map(Number);

    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    return { hour, minute };
  };

  const filterAvailableTimes = (profileData, selectedDay) => {
    const fromKey = `${selectedDay}from`;
    const toKey = `${selectedDay}to`;

    if (!profileData[fromKey] || !profileData[toKey]) {
      return [];
    }

    const fromTime = parseTime(profileData[fromKey]);
    const toTime = parseTime(profileData[toKey]);

    const filteredTimes = generateHoursOfDay().filter((time) => {
      const { hour: hour24, minute } = parseTime(time);
      const timeValue = hour24 * 60 + minute;
      const fromValue = fromTime.hour * 60 + fromTime.minute;
      const toValue = toTime.hour * 60 + toTime.minute;

      return timeValue >= fromValue && timeValue <= toValue;
    });

    return filteredTimes;
  };

  const filterBookedTimes = (bookedTimes, selectedDate) => {
    return bookedTimes
      .filter(
        (order) =>
          new Date(order.date).toDateString() === selectedDate.toDateString()
      )
      .map((order) => order.time);
  };

  useEffect(() => {
    const getUserInfo = async () => {
      const profileData = await getProfileService();
      const bookedTimesData = await getBookedTimes();

      if (profileData) {
        const timestamp = route.params.selectedDate;
        const selectedDate = new Date(timestamp);
        const selectedDay = selectedDate
          .toLocaleString("en-US", {
            weekday: "long",
          })
          .toLowerCase();

        const availableTimes = filterAvailableTimes(profileData, selectedDay);
        const bookedTimesForSelectedDate = filterBookedTimes(
          bookedTimesData,
          selectedDate
        );

        setBookedTimes(bookedTimesForSelectedDate);
        setHoursOfDay(availableTimes);
      } else {
        setHoursOfDay([]);
      }
      setLoading(false);
    };
    getUserInfo();
  }, []);

  const timestamp = route.params.selectedDate;
  const selectedDate = new Date(timestamp);

  const currentDateTime = new Date();
  const isSameDay =
    selectedDate.toDateString() === currentDateTime.toDateString();

  const handleTimeSelect = (time) => {
    if (isTimeInThePast(time) || isTimeBooked(time)) {
      return; // Do nothing if the time is in the past or already booked
    }
    setSelectedTime(time);

    // Pass selectedTime back to the previous screen via navigation
    navigation.navigate("ConfirmBooking", {
      selectedDate: selectedDate.toISOString(),
      selectedTime: time,
      timestamp,
      service,
    });
  };

  const isTimeInThePast = (time) => {
    if (!isSameDay) {
      return false; // If not the same day, none of the times are in the past
    }

    const { hour: hour24, minute } = parseTime(time);
    const timeDate = new Date(selectedDate);
    timeDate.setHours(hour24, minute, 0, 0);

    return timeDate < currentDateTime;
  };

  const isTimeBooked = (time) => {
    return bookedTimes.includes(time);
  };

  if (loading) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hoursOfDay === null || hoursOfDay.length === 0 ? (
        <Text style={styles.unavailableText}>This day is not available</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollView}>
          {hoursOfDay.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeItem,
                selectedTime === time && styles.selectedTimeItem,
                (isTimeInThePast(time) || isTimeBooked(time)) &&
                  styles.disabledTimeItem,
              ]}
              onPress={() => handleTimeSelect(time)}
              disabled={isTimeInThePast(time) || isTimeBooked(time)}
            >
              <Text style={styles.timeText}>{time}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  unavailableText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  scrollView: {
    flexGrow: 1,
  },
  timeItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    alignItems: "center",
  },
  selectedTimeItem: {
    backgroundColor: "#4A3AFF",
  },
  disabledTimeItem: {
    backgroundColor: "#ccc",
  },
  timeText: {
    fontSize: 18,
    color: "#333",
  },
});
