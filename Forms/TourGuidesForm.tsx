import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from '@expo/vector-icons';
import ImageInput from "../components/ImageInput";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { auth } from "../firebaseConfig";

type TourGuidesFormProps = NativeStackScreenProps<RootStackParamList, 'TourGuidesForm'>;

const TourGuidesForm: React.FC<TourGuidesFormProps> = ({ navigation }) => {
  const [guideType, setGuideType] = useState("Cultural");
  const [name, setName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // Form validation function
  const validateForm = (): string | null => {
    const contactNoPattern = /^\+94(\d{9}|(\s\d{3}\s\d{3}\s\d{3}))$/; // Matches +94XXXXXXXXX or +94 XXX XXX XXX
    const pricePattern = /^\d+$/; // Ensures price is numeric

    if (name.trim().length < 3) {
      return "Name must include a minimum of three characters.";
    }

    if (!contactNo.trim().match(contactNoPattern)) {
      return "Contact number must follow the format +94 XXX XXX XXX.";
    }

    if (description.trim() === "") {
      return "Description cannot be empty.";
    }

    if (!pricePerDay.trim().match(pricePattern)) {
      return "Price per day must be a numeric value.";
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
      Alert.alert("Error", "You must be logged in to submit tour guide data.");
      return;
    }

    try {
      const tourGuideCollectionRef = collection(db, "tourGuides");
      await addDoc(tourGuideCollectionRef, {
        uid: currentUser.uid, // Include user's UID
        guideType,
        name,
        contactNo,
        description,
        pricePerDay,
        images,
        timestamp: new Date(),
      });

      Alert.alert("Success", "Tour guide details submitted successfully!");

      // Reset form fields
      setGuideType("Cultural");
      setName("");
      setContactNo("");
      setDescription("");
      setPricePerDay("");
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
        <Text style={styles.title}>Tour Guide</Text>
        <Text style={styles.subtitle}>Register your tour guide services</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          {/* Form Sections */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            {/* Guide Type */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                <Ionicons name="person-outline" size={18} color="#24BAEC" />
                {" "}Guide Type
              </Text>
              <View style={styles.dropdownContainer}>
                <Picker
                  selectedValue={guideType}
                  onValueChange={(itemValue) => setGuideType(itemValue)}
                  mode="dropdown"
                  style={styles.picker}
                >
                  <Picker.Item label="Cultural" value="Cultural" />
                  <Picker.Item label="Wildlife" value="Wildlife" />
                  <Picker.Item label="Adventure" value="Adventure" />
                  <Picker.Item label="Cuisine" value="Cuisine" />
                </Picker>
              </View>
            </View>

            {/* Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                <Ionicons name="person-circle-outline" size={18} color="#24BAEC" />
                {" "}Guide Name
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter guide's full name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

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
            <Text style={styles.sectionTitle}>Service Details</Text>

            {/* Description */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                <Ionicons name="document-text-outline" size={18} color="#24BAEC" />
                {" "}Description
              </Text>
              <TextInput
                style={styles.textAreaInput}
                placeholder="Describe your services, experience, languages spoken, etc."
                multiline={true}
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#999"
              />
            </View>

            {/* Price */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                <Ionicons name="cash-outline" size={18} color="#24BAEC" />
                {" "}Price Per Day
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Rs XXXX"
                keyboardType="numeric"
                value={pricePerDay}
                onChangeText={setPricePerDay}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Images */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Profile Images</Text>
            <ImageInput onImagesChange={(uris) => setImages(uris)} />
            <Text style={styles.helperText}>
              <Ionicons name="information-circle-outline" size={14} color="#666666" />
              {" "}Upload at least one professional photo of yourself
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            activeOpacity={0.8} 
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Register Tour Guide</Text>
          </TouchableOpacity>
        </View>
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
  textAreaInput: {
    minHeight: 120,
    borderColor: "rgba(36, 186, 236, 0.15)",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    textAlignVertical: "top",
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
});

export default TourGuidesForm;