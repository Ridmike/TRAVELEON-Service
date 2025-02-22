import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust according to your project setup
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type EditAdScreenProps = NativeStackScreenProps<RootStackParamList, "EditScreen">;

const EditAdScreen: React.FC<EditAdScreenProps> = ({ route, navigation }) => {
  const { adData } = route.params; // Get the ad details from navigation
  const [name, setName] = useState(adData.name || "");
  const [location, setLocation] = useState(adData.location || "");
  const [price, setPrice] = useState(String(adData.pricePerNight || adData.pricePerDay || adData.pricePerPerson || ""));
  const [contactNo, setContactNo] = useState(adData.contactNo || "");

  const handleUpdate = async () => {
    if (!name || !location || !price || !contactNo) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (!/^\d{10}$/.test(contactNo)) {
      Alert.alert("Error", "Enter a valid 10-digit contact number.");
      return;
    }

    try {
      await updateDoc(doc(db, adData.collectionName, adData.id), {
        name,
        location,
        pricePerNight: adData.pricePerNight !== undefined ? Number(price) : undefined,
        pricePerDay: adData.pricePerDay !== undefined ? Number(price) : undefined,
        pricePerPerson: adData.pricePerPerson !== undefined ? Number(price) : undefined,
        contactNo: adData.contactNo !== undefined ? contactNo : undefined,
      });

      Alert.alert("Success", "Ad updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating ad:", error);
      Alert.alert("Error", "Failed to update ad.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Your Ad</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ad Name"
      />

      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Location"
      />

      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Price"
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        value={contactNo}
        onChangeText={setContactNo}
        placeholder="Contact Number"
        keyboardType="phone-pad"
        maxLength={10}
      />

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update Ad</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  updateButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditAdScreen;
