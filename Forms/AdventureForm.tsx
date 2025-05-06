import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import ImageInput from "../components/ImageInput";
import * as Location from "expo-location";
import * as Device from "expo-device";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { Ionicons } from '@expo/vector-icons';

type AdventureFormProps = NativeStackScreenProps<RootStackParamList, 'AdventureForm'>;

const AdventureForm: React.FC<AdventureFormProps> = ({ navigation }) => {
  const [adventureType, setAdventureType] = useState("Hiking");
  const [name, setName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerPerson, setPricePerPerson] = useState("");
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchLocation = async () => {
      if (Platform.OS === "android" && !Device.isDevice) {
        setErrorMsg("Location services are not supported on Android Emulators.");
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
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
          setErrorMsg("Unable to fetch address.");
        }
      } catch (error) {
        setErrorMsg("An error occurred while fetching the location.");
        console.error(error);
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
      Alert.alert("Error", "You must be logged in to submit adventure data.");
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Adventure Experience</Text>
        <Text style={styles.subtitle}>Share your adventure with travelers</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          {/* Adventure Type Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Adventure Details</Text>
            
            {/* Adventure Type */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                <Ionicons name="compass-outline" size={18} color="#00aaff" />
                {" "}Adventure Type
              </Text>
              <View style={styles.dropdownContainer}>
                <Picker
                  selectedValue={adventureType}
                  onValueChange={(itemValue) => setAdventureType(itemValue)}
                  mode="dropdown"
                  style={styles.picker}
                >
                  <Picker.Item label="Hiking" value="Hiking" />
                  <Picker.Item label="Air Adventures" value="Air Adventures" />
                  <Picker.Item label="Diving" value="Diving" />
                  <Picker.Item label="Safari" value="Safari" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Contact Details Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            {/* Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                <Ionicons name="person-outline" size={18} color="#00aaff" />
                {" "}Guide Name
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>

            {/* Contact Number */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                <Ionicons name="call-outline" size={18} color="#00aaff" />
                {" "}Contact Number
              </Text>
              <TextInput
                style={styles.input}
                placeholder="+94 XXX XXX XXX"
                keyboardType="phone-pad"
                value={contactNo}
                onChangeText={setContactNo}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Location & Pricing Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Location & Pricing</Text>
            
            {/* Location */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                <Ionicons name="location-outline" size={18} color="#00aaff" />
                {" "}Adventure Location
              </Text>
              <TextInput
                style={styles.locationInput}
                placeholder="Select your location"
                value={location}
                editable={false}
                multiline={true}
                scrollEnabled={true}
                placeholderTextColor="#999"
              />
              <TouchableOpacity 
                style={styles.locationButton} 
                onPress={handleConfirmLocation}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="navigate" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Use Current Location</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Price */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                <Ionicons name="cash-outline" size={18} color="#00aaff" />
                {" "}Price Per Person
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Rs XXXX"
                keyboardType="numeric"
                value={pricePerPerson}
                onChangeText={setPricePerPerson}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Images Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Adventure Images</Text>
            <ImageInput onImagesChange={(uris) => setImages(uris)} />
            <Text style={styles.helperText}>
              <Ionicons name="information-circle-outline" size={14} color="#666666" />
              {" "}Upload at least one image of your adventure
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            activeOpacity={0.8} 
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Adventure</Text>
          </TouchableOpacity>
        </View>

        {errorMsg && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#00aaff",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  formSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  fieldContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: 52,
    borderColor: "rgba(0, 170, 255, 0.15)",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  locationInput: {
    minHeight: 52,
    maxHeight: 80,
    borderColor: "rgba(0, 170, 255, 0.15)",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "rgba(0, 170, 255, 0.15)",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  picker: {
    height: 52,
  },
  locationButton: {
    backgroundColor: "#00aaff",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 8,
  },
  helperText: {
    fontSize: 13,
    color: "#666666",
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: "#00aaff",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  errorContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "rgba(255,59,48,0.9)",
    borderRadius: 10,
  },
  errorText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 14,
  },
});

export default AdventureForm;