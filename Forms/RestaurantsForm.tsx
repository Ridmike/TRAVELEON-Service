import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from '@expo/vector-icons';
import ImageInput from "../components/ImageInput";
import * as Location from "expo-location";
import * as Device from "expo-device";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type RestaurantsFormProps = NativeStackScreenProps<RootStackParamList, 'RestaurantsForm'>;

const RestaurantsForm: React.FC<RestaurantsFormProps> = ({ navigation }) => {
  const [restaurantType, setRestaurantType] = useState("Chinese");
  const [name, setName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [location, setLocation] = useState("");
  const [averagePrice, setAveragePrice] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // Location fetching logic
    async function fetchLocation() {
      if (Platform.OS === 'android' && !Device.isDevice) {
        setErrorMsg('Oops, this will not work on Snack in an Android Emulator. Try it on your device!');
        return;
      }
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        let reverseGeocode = await Location.reverseGeocodeAsync(location.coords);
        if (reverseGeocode.length > 0) {
          const { street, subregion, city, district } = reverseGeocode[0];
          const formattedAddress = `${street || 'Unknown Street'}, ${subregion || city || district || 'Unknown Area'}, ${city || district || 'Unknown City'}`;
          setCurrentAddress(formattedAddress);
        } else {
          setErrorMsg('Could not fetch the address.');
        }
      } catch (error) {
        setErrorMsg('An error occurred while fetching location.');
        console.error(error);
      }
    }

    fetchLocation();
  }, []);

  const handleConfirmLocation = () => {
    if (currentAddress) {
      setLocation(currentAddress);
    } else {
      Alert.alert('Error', 'No location available to confirm.');
    }
  };

  const validateForm = (): string | null => {
    const contactNoPattern = /^\+94(\d{9}|(\s\d{3}\s\d{3}\s\d{3}))$/; // Matches +94XXXXXXXXX or +94 XXX XXX XXX
    const pricePattern = /^\d+$/; // Ensures price is numeric

    if (name.trim().length < 3) {
      return "Name must include a minimum of three characters.";
    }

    if (!contactNo.trim().match(contactNoPattern)) {
      return "Contact number must follow the format +94 XXX XXX XXX.";
    }

    if (location.trim() === "") {
      return "Location cannot be empty.";
    }

    if (averagePrice.trim() !== "" && !averagePrice.trim().match(pricePattern)) {
      return "Average price must be a numeric value.";
    }

    if (images.length === 0) {
      return "Please upload at least one image.";
    }

    return null; // No validation errors
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert("Validation Error", validationError);
      return;
    }

    const currentUser = auth.currentUser; // Get the current user
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to submit restaurant data.");
      return;
    }

    try {
      const restaurantCollectionRef = collection(db, "restaurants");
      await addDoc(restaurantCollectionRef, {
        uid: currentUser.uid, // Include user's UID
        restaurantType,
        name,
        contactNo,
        location,
        averagePrice: averagePrice.trim() !== "" ? averagePrice : "0",
        images,
        timestamp: new Date(),
      });

      Alert.alert("Success", "Your restaurant data has been submitted!");

      // Reset form fields
      setRestaurantType("Chinese");
      setName("");
      setContactNo("");
      setLocation("");
      setAveragePrice("");
      setImages([]);
      navigation.replace("Home");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "There was an error submitting your data.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Restaurant</Text>
        <Text style={styles.subtitle}>List your restaurant for travelers</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          {/* Form Sections */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            {/* Restaurant Type */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                <Ionicons name="restaurant-outline" size={18} color="#24BAEC" />
                {" "}Restaurant Type
              </Text>
              <View style={styles.dropdownContainer}>
                <Picker
                  selectedValue={restaurantType}
                  onValueChange={(itemValue) => setRestaurantType(itemValue)}
                  mode="dropdown"
                  style={styles.picker}
                >
                  <Picker.Item label="Chinese" value="Chinese" />
                  <Picker.Item label="Casual Dining" value="Casual Dining" />
                  <Picker.Item label="Fine Dining" value="Fine Dining" />
                  <Picker.Item label="Street Food" value="Street Food" />
                  <Picker.Item label="Cafe" value="Cafe" />
                  <Picker.Item label="Indian" value="Indian" />
                </Picker>
              </View>
            </View>

            {/* Restaurant Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                <Ionicons name="business-outline" size={18} color="#24BAEC" />
                {" "}Restaurant Name
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter restaurant name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Contact Details</Text>

            {/* Contact Number */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                <Ionicons name="call-outline" size={18} color="#24BAEC" />
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

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Location & Pricing</Text>

            {/* Location */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                <Ionicons name="location-outline" size={18} color="#24BAEC" />
                {" "}Location
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

            {/* Average Price */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                <Ionicons name="cash-outline" size={18} color="#24BAEC" />
                {" "}Average Price Per Person
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Rs XXXX"
                keyboardType="numeric"
                value={averagePrice}
                onChangeText={setAveragePrice}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Images */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Restaurant Images</Text>
            <ImageInput onImagesChange={(uris) => setImages(uris)} />
            <Text style={styles.helperText}>
              <Ionicons name="information-circle-outline" size={14} color="#666666" />
              {" "}Upload at least one image of your restaurant
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            activeOpacity={0.8} 
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>List Restaurant</Text>
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
    backgroundColor: "#24BAEC",
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
    borderColor: "rgba(36, 186, 236, 0.15)",
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
    borderColor: "rgba(36, 186, 236, 0.15)",
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
    borderColor: "rgba(36, 186, 236, 0.15)",
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
    backgroundColor: "#24BAEC",
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
    backgroundColor: "#24BAEC",
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

export default RestaurantsForm;