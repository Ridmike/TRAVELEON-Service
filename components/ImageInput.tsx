import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';

interface ImageInputProps {
  onImagesChange: (uris: string[]) => void; // Callback to notify parent of image changes
}

const ImageInput: React.FC<ImageInputProps> = ({ onImagesChange }) => {
  const [imagesUri, setImagesUri] = useState<string[]>([]);

  // Function to select images using ImagePicker
  const selectImages = async () => {
    if (imagesUri.length >= 5) {
      Alert.alert('Limit Reached', 'You can only select up to 5 images.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true, // Allow multiple image selection
        quality: 0.5, // Reduce image quality to save memory
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => asset.uri);
        const combinedImages = [...imagesUri, ...newImages].slice(0, 5);

        setImagesUri(combinedImages);
        onImagesChange(combinedImages); // Notify parent of the updated image list
      }
    } catch (error) {
      console.error('Error selecting images:', error);
    }
  };

  // Function to handle long press for image removal
  const handleLongPress = (uri: string) => {
    const filteredImages = imagesUri.filter((imageUri) => imageUri !== uri);
    setImagesUri(filteredImages);
    onImagesChange(filteredImages); // Notify parent of the updated image list
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.imageContainer}>
        {/* Display selected images */}
        {imagesUri.map((uri, index) => (
          <TouchableOpacity key={index} onLongPress={() => handleLongPress(uri)}>
            <Image source={{ uri }} style={styles.image} />
          </TouchableOpacity>
        ))}

        {/* Add new images */}
        {imagesUri.length < 5 && (
          <TouchableOpacity style={styles.iconContainer} onPress={selectImages}>
            <FontAwesome name="camera" size={40} color="#888" />
            <Text style={styles.iconText}>Add Images</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  imageContainer: {
    flexDirection: 'row',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
  },
  iconText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ImageInput;