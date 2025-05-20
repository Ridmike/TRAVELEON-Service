import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const locationTypes = [
  "Mountain", "Beach", "Safari", "Surfing", "Hill Station", "Historical Fort",
  "Cultural City", "City", "Island", "Historical Site", "Whale Watching",
  "Ancient Ruins", "Elephant Orphanage", "National Park"
];

const AddLocation = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState(locationTypes[0]);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [latitude, setLatitude] = useState('7.8731'); 
  const [longitude, setLongitude] = useState('80.7718'); 

  // Convert strings to numbers safely
  const parsedLat = parseFloat(latitude) || 7.8731; 
  const parsedLng = parseFloat(longitude) || 80.7718; 

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

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Allow location access to use this feature.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLatitude(location.coords.latitude.toString());
    setLongitude(location.coords.longitude.toString());
  };

  const handleMapPress = (event: MapPressEvent) => {
    setLatitude(event.nativeEvent.coordinate.latitude.toString());
    setLongitude(event.nativeEvent.coordinate.longitude.toString());
  };

  const handleSubmit = async() => {
    if (!name || !description || !latitude || !longitude) {
      Alert.alert("Error", "Please fill in all fields and select a location.");
      return;
    }

    try {
        const addLocationsRef = collection(db, "locations");
        const newDoc = await addDoc(addLocationsRef, {
            id: "",
            name,
            type,
            description,
            image,
            latitude: parsedLat,
            longitude: parsedLng,
        });

        await updateDoc(doc(db, "locations", newDoc.id), { id: newDoc.id });

        Alert.alert("Success", "Location data submitted successfully!");

        setName('');
        setType(locationTypes[0]);
        setDescription('');
        setImage(null);
        setLatitude('7.1614');
        setLongitude('80.5471');

    } catch (error) {
        Alert.alert("Error", "An error occurred while submitting the data.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Location Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter location name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Type:</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={type} onValueChange={(itemValue) => setType(itemValue)}>
          {locationTypes.map((locType, index) => (
            <Picker.Item key={index} label={locType} value={locType} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Description:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter location description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Latitude:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter latitude"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Longitude:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter longitude"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Select Location on Map:</Text>
      <MapView
        style={styles.map}
        region={{
          latitude: parsedLat,
          longitude: parsedLng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress}
      >
        <Marker coordinate={{ latitude: parsedLat, longitude: parsedLng }} />
      </MapView>

      <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
        <Text style={styles.locationButtonText}>Use Current Location</Text>
      </TouchableOpacity>

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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  map: {
    width: '100%',
    height: 300,
    marginBottom: 15,
  },
  locationButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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

export default AddLocation;
