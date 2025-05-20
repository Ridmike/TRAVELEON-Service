import React, { useState } from 'react';
import { Text, Button, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';



const AddImage = () => {
  
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  

  const handleSubmit = async() => {

    try {
        const addLocationsRef = collection(db, "images");
        const newDoc = await addDoc(addLocationsRef, {
            id: "",
            image,
        });

        await updateDoc(doc(db, "images", newDoc.id), { id: newDoc.id });

        Alert.alert("Success", "Location data submitted successfully!");

        setImage(null);

    } catch (error) {
        Alert.alert("Error", "An error occurred while submitting the data.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>      

      {image && <Image source={{ uri: image }} style={styles.previewImage} />}

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>{image ? "Change Image" : "Pick an Image"}</Text>
      </TouchableOpacity>

      <Button title="Submit Location" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  imagePicker: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 15,
  },
});

export default AddImage;
