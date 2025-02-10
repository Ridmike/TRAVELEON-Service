import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Text, Alert, TextInput, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../firebaseConfig'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const Profile = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null); 
  const [isEditing, setIsEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState<any>({});

  // Request permission to access the media library
  const requestPermission = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      alert("You need to enable permission to access the library...");
    }
  };

  // Fetch user details from Firestore
  const fetchUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "usersLocal", userId)); 
      if (userDoc.exists()) {
        setUserData(userDoc.data());
        setUpdatedData(userDoc.data());
      } else {
        console.log("No user data found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Could not fetch user details.");
    }
  };

  // Update user data in Firestore
  const handleSave = async () => {
    if (!auth.currentUser) return;

    try {
      await updateDoc(doc(db, "usersLocal", auth.currentUser.uid), updatedData);
      setUserData(updatedData);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Could not update profile.");
    }
  };

  // Handle profile image selection
  const selectProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
      });

      if (!result.canceled && result.assets) {
        const selectedUri = result.assets[0].uri;
        setProfileImage(selectedUri);
        setUpdatedData({ ...updatedData, profileImage: selectedUri });
      }
    } catch (error) {
      console.log("Error selecting image:", error);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchUserData(auth.currentUser.uid);
    }
    requestPermission();
  }, []);

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={selectProfileImage}>
          <Image
            source={{
              uri: profileImage || userData?.profileImage || "https://via.placeholder.com/150",
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={updatedData.name}
            onChangeText={(text) => setUpdatedData({ ...updatedData, name: text })}
          />
        ) : (
          <Text style={styles.name}>{userData?.name || "N/A"}</Text>
        )}
        <Text style={styles.email}>{userData?.email || "N/A"}</Text>
      </View>

      {/* Profile Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Phone:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={updatedData.contactNo}
              onChangeText={(text) => setUpdatedData({ ...updatedData, contactNo: text })}
            />
          ) : (
            <Text style={styles.detailValue}>{userData?.contactNo || "N/A"}</Text>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {isEditing ? (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={[styles.actionText, { color: "white" }]}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.actionButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.actionText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={() => {
            auth.signOut().then(() => {
              Alert.alert('Logged Out', 'You have successfully logged out.');
            }).catch((error) => {
              console.error("Error logging out:", error);
            });
          }}
        >
          <Text style={[styles.actionText, { color: "white" }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#00aaff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  detailsContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  detailValue: {
    fontSize: 16,
    color: "#666",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    fontSize: 16,
    color: "#333",
    paddingVertical: 5,
    flex: 1,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#00aaff",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ff9900",
  },
  logoutButton: {
    backgroundColor: "#ff4d4d",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
