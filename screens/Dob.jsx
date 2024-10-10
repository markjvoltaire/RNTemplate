import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Image,
} from "react-native";

export default function Dob({ navigation, route }) {
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  const { selectedMCC: mcc } = route.params;
  const userInfo = route.params.route.params;

  console.log("userInfo", userInfo);
  console.log("mcc", mcc);

  const handleDateChange = (type, value) => {
    const numericValue = value.replace(/[^0-9]/g, "");

    switch (type) {
      case "month":
        if (numericValue.length <= 2) setMonth(numericValue);
        break;
      case "day":
        if (numericValue.length <= 2) setDay(numericValue);
        break;
      case "year":
        if (numericValue.length <= 4) setYear(numericValue);
        break;
      default:
        break;
    }
  };

  const calculateAge = (dob) => {
    const [month, day, year] = [
      parseInt(dob.substring(0, 2)),
      parseInt(dob.substring(2, 4)),
      parseInt(dob.substring(4, 8)),
    ];
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleSubmit = () => {
    if (month.length === 2 && day.length === 2 && year.length === 4) {
      const dob = `${month}${day}${year}`;
      const age = calculateAge(dob);

      if (age >= 13 && age <= 120) {
        setError("");
        navigation.navigate("PaymentIntro", {
          mcc,
          userInfo,
          dob,
          month,
          year,
          day,
        });
      } else {
        setError("You must be between 13 and 120 years old.");
      }
    } else {
      setError("Please enter a complete date.");
    }
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea} />
      <View style={styles.container}>
        <View style={styles.backButtonContainer}>
          <Pressable onPress={() => navigation.goBack()}>
            <Image
              style={styles.backButtonImage}
              source={require("../assets/WhiteBack.png")}
            />
          </Pressable>
        </View>

        <Text style={styles.heading}>Enter Your Date of Birth</Text>

        <View style={styles.dateInputContainer}>
          <TextInput
            style={styles.dateInput}
            value={month}
            onChangeText={(value) => handleDateChange("month", value)}
            placeholder="MM"
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={styles.separator}>/</Text>
          <TextInput
            style={styles.dateInput}
            value={day}
            onChangeText={(value) => handleDateChange("day", value)}
            placeholder="DD"
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={styles.separator}>/</Text>
          <TextInput
            style={styles.dateInput}
            value={year}
            onChangeText={(value) => handleDateChange("year", value)}
            placeholder="YYYY"
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#4A3AFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#4A3AFF",
    padding: 20,
  },
  backButtonContainer: {
    marginBottom: 20,
  },
  backButtonImage: {
    aspectRatio: 1,
    height: 30,
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    color: "white",
    fontWeight: "800",
    marginBottom: 30,
    textAlign: "center",
  },
  dateInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  dateInput: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    width: 70,
    textAlign: "center",
    fontSize: 18,
    marginHorizontal: 5,
  },
  separator: {
    fontSize: 18,
    color: "white",
    margin: 15,
  },
  submitButton: {
    backgroundColor: "black",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
});
