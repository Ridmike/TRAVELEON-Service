import React, { useState, useEffect } from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform,} from "react-native";
import { Picker } from "@react-native-picker/picker";
import ImageInput from "../components/ImageInput";
import * as Location from "expo-location";
import * as Device from "expo-device";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { auth } from "../firebaseConfig";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type AdventureFormFormProps = NativeStackScreenProps<RootStackParamList, 'AdventureForm'>;

const AdventureForm: React.FC<AdventureFormFormProps> = ({ navigation }) => {
  const [adventureType, setAdventureType] = useState("Hiking");
  const [name, setName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerPerson, setPricePerPerson] = useState("");
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchLocation = async () => {
      if (Platform.OS === "android" && !Device.isDevice) {
        Alert.alert(
          "Error",
          "Location services are not supported on Android Emulators."
        );
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Error", "Permission to access location was denied.");
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        let reverseGeocode = await Location.reverseGeocodeAsync(
          location.coords
        );
        if (reverseGeocode.length > 0) {
          const { street, subregion, city, district } = reverseGeocode[0];
          const formattedAddress = `${street || "Unknown Street"}, ${
            subregion || city || district || "Unknown Area"
          }, ${city || district || "Unknown City"}`;
          setCurrentAddress(formattedAddress);
        } else {
          Alert.alert("Error", "Unable to fetch address.");
        }
      } catch (error) {
        Alert.alert("Error", "An error occurred while fetching the location.");
      }
    };

    fetchLocation();
  }, []);

  const validateForm = (): string | null => {
    const contactNoPattern = /^\+94(\d{9}|(\s\d{3}\s\d{3}\s\d{3}))$/; // Matches +94XXXXXXXXX or +94 XXX XXX XXX
    const pricePattern = /^\d+$/; // Ensures price is numeric

    if (name.trim().length < 3) {
      return "Name must include a minimum of three characters.";
    }

    if (!contactNo.trim().match(contactNoPattern)) {
      return "Contact number must follow the format +94XXXXXXXXX or +94 XXX XXX XXX.";
    }

    if (location.trim() === "") {
      return "Location cannot be empty.";
    }

    if (!pricePerPerson.trim().match(pricePattern)) {
      return "Price per person must be a numeric value.";
    }

    if (images.length === 0) {
      return "Please upload at least one image.";
    }

    return null; // No validation errors
  };

  const handleConfirmLocation = () => {
    if (currentAddress) {
      setLocation(currentAddress);
    } else {
      Alert.alert("Error", "No location available to confirm.");
    }
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert("Validation Error", validationError);
      return;
    }

    const currentUser = auth.currentUser; // Get the current user
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to submit accommodation data.");
      return;
    }

    try {
      const adventureCollectionRef = collection(db, "adventures");
      await addDoc(adventureCollectionRef, {
        uid: currentUser.uid,
        adventureType,
        name,
        contactNo,
        location,
        pricePerPerson,
        images,
        timestamp: new Date(),
      });

      Alert.alert("Success", "Adventure data submitted successfully!");

      // Reset form fields
      setAdventureType("Hiking");
      setName("");
      setContactNo("");
      setLocation("");
      setPricePerPerson("");
      setImages([]);

      navigation.replace("Home");

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while submitting the data.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Adventure Form</Text>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Adventure Type</Text>
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={adventureType}
              onValueChange={(itemValue) => setAdventureType(itemValue)}
            >
              <Picker.Item label="Hiking" value="Hiking" />
              <Picker.Item label="Air Adventures" value="Air Adventures" />
              <Picker.Item label="Diving" value="Diving" />
              <Picker.Item label="Safari" value="Safari" />
            </Picker>
          </View>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Contact No</Text>
          <TextInput
            style={styles.input}
            placeholder="+94 XX XXX XXX"
            keyboardType="phone-pad"
            value={contactNo}
            onChangeText={setContactNo}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.inputL}
            placeholder="Select your location"
            value={location}
            editable={false}
            multiline={true}
          />
          <TouchableOpacity style={styles.locationButton} onPress={handleConfirmLocation}>
            <Text style={styles.locationButtonText}>Select Location</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Price Per Person</Text>
          <TextInput
            style={styles.input}
            placeholder="Rs XXXX"
            keyboardType="numeric"
            value={pricePerPerson}
            onChangeText={setPricePerPerson}
          />

          <Text style={styles.label}>Upload Images</Text>
          <ImageInput onImagesChange={(uris) => setImages(uris)} />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default AdventureForm;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#00aaff",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  formContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputL: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: "#00aaff",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  locationButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  locationButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
