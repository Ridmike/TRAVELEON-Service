import React, { useState } from 'react';
import { Text, Button, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const AddImage = () => {
  const [images, setImages] = useState<string[]>([]);

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can only upload up to 5 images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleSubmit = async () => {
    try {
      const addLocationsRef = collection(db, 'images');
      const newDoc = await addDoc(addLocationsRef, {
        id: '',
        images, // Array of image URIs
      });

      await updateDoc(doc(db, 'images', newDoc.id), { id: newDoc.id });

      Alert.alert('Success', 'Images submitted successfully!');
      setImages([]);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while submitting the data.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imagesWrapper}>
        {images.map((img, index) => (
          <Image key={index} source={{ uri: img }} style={styles.previewImage} />
        ))}
      </View>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>
          {images.length > 0 ? `Add Image (${images.length}/5)` : 'Pick an Image'}
        </Text>
      </TouchableOpacity>

      <Button title="Submit Images" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  imagesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
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
    width: '48%',
    height: 150,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default AddImage;
