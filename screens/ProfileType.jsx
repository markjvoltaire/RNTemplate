import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useState } from "react";

export default function ProfileType({ navigation }) {
  const [selectedType, setSelectedType] = useState(null);

  const handleSelect = (type) => {
    setSelectedType(type);

    type === "personal"
      ? navigation.navigate("AddCity", { type })
      : navigation.navigate("Name", { type });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Are You Joining as a Business or an Individual?
      </Text>
      <View style={{ marginBottom: 40 }}>
        <TouchableOpacity
          style={[
            styles.option,
            selectedType === "personal" && styles.selected,
          ]}
          onPress={() => handleSelect("personal")}
        >
          <Text style={styles.optionText}>Individual</Text>
          <Text style={styles.subText}>
            Looking to book services that fit your needs? A Personal account is
            perfect for you!
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 40 }}>
        <TouchableOpacity
          style={[
            styles.option,
            selectedType === "business" && styles.selected,
          ]}
          onPress={() => handleSelect("business")}
        >
          <Text style={styles.optionText}>Business</Text>
          <Text style={styles.subText}>
            Ready to reach more clients and showcase your services? A Business
            account is your gateway to success!
          </Text>
        </TouchableOpacity>
      </View>
      {/* Go Back Button */}
      <TouchableOpacity
        style={styles.goBackButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.goBackText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4A3AFF",
    padding: 10,
    paddingBottom: 180,
  },
  header: {
    fontSize: 20,
    marginBottom: 40,
    color: "white",
    fontWeight: "800",
  },
  option: {
    width: "90%",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ddd",
  },

  optionText: {
    fontSize: 20,
    color: "white",
    fontWeight: "800",
  },
  subText: {
    fontSize: 15,
    color: "white",
    fontWeight: "400",
    marginTop: 5,
    textAlign: "center",
  },
  goBackButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
  },
  goBackText: {
    fontSize: 20,
    color: "white",
    fontWeight: "700",
  },
});
