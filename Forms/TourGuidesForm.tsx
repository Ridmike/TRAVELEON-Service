import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,} from "react-native";
import { Picker } from "@react-native-picker/picker";
// import ImageInput from "../components/ImageInput";
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
  const [languages, setLanguages] = useState("");
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
      return "Contact number must follow the format +94XXXXXXXXX or +94 XXX XXX XXX.";
    }

    if (languages.trim() === "") {
      return "Languages cannot be empty.";
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
          Alert.alert("Error", "You must be logged in to submit accommodation data.");
          return;
        }

    try {
      const tourGuideCollectionRef = collection(db, "tourGuides");
      await addDoc(tourGuideCollectionRef, {
        uid: currentUser.uid, // Include user's UID
        guideType,
        name,
        contactNo,
        languages,
        pricePerDay,
        images,
        timestamp: new Date(),
      });

      Alert.alert("Success", "Tour guide details submitted successfully!");

      // Reset form fields
      setGuideType("Cultural");
      setName("");
      setContactNo("");
      setLanguages("");
      setPricePerDay("");
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
        <Text style={styles.title}>Tour Guide Form</Text>
        <View style={styles.formContainer}>
          {/* Dropdown for Guide Type */}
          <Text style={styles.label}>Guide Type</Text>
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={guideType}
              onValueChange={(itemValue) => setGuideType(itemValue)}
            >
              <Picker.Item label="English" value="English" />
              <Picker.Item label="German" value="German" />
              <Picker.Item label="French" value="French" />
              <Picker.Item label="Wildlife" value="Wildlife" />
            </Picker>
          </View>

          {/* Other Input Fields */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter guide's name"
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

          <Text style={styles.label}>Description </Text>
          <TextInput
            style={styles.inputDescription}
            multiline = {true}
            numberOfLines = {4}
            placeholder="E.g., Explain type of tours, experience, etc."
            value={languages}
            onChangeText={setLanguages}
          />

          <Text style={styles.label}>Price Per Day</Text>
          <TextInput
            style={styles.input}
            placeholder="Rs XXXX"
            keyboardType="numeric"
            value={pricePerDay}
            onChangeText={setPricePerDay}
          />

          {/* Image Input */}
          <Text style={styles.label}>Upload Images</Text>
          {/* <ImageInput onImagesChange={(uris) => setImages(uris)} /> */}

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default TourGuidesForm;


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
  inputDescription: {
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
});
