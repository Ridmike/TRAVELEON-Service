import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';

type RootStackParamList = {
  Home: undefined;
};

const Profile = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState<any>({});

  const requestPermission = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      alert("You need to enable permission to access the library...");
    }
  };

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Navigate to home screen after successful logout
      navigation.navigate('Home');
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Image */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.imageContainer} onPress={selectProfileImage}>
            <Image
              source={{
                uri: profileImage || userData?.profileImage || "https://via.placeholder.com/150",
              }}
              style={styles.profileImage}
            />
            <View style={styles.editImageBadge}>
              <Text style={styles.editImageText}>Edit</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Name and Email */}
        <View style={styles.nameContainer}>
          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={updatedData.name}
              onChangeText={(text) => setUpdatedData({ ...updatedData, name: text })}
              placeholder="Enter your name"
              placeholderTextColor="#777"
            />
          ) : (
            <Text style={styles.name}>{userData?.name || "N/A"}</Text>
          )}
          <Text style={styles.email}>{userData?.email || "N/A"}</Text>
        </View>

        {/* Contact No */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Phone Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={updatedData.contactNo}
                onChangeText={(text) => setUpdatedData({ ...updatedData, contactNo: text })}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.detailValue}>{userData?.contactNo || "Not provided"}</Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setUpdatedData(userData);
                  setIsEditing(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    marginTop: Platform.OS === 'ios' ? 50 : 10,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 10,
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  editImageBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00aaff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editImageText: {
    color: 'white',
    fontSize: 12,
  },
  nameContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: "#333",
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  nameInput: {
    fontSize: 20,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    width: "80%",
    textAlign: "center",
    marginBottom: 4,
    paddingVertical: 4,
  },
  detailsContainer: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 20,
    borderRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "#333",
  },
  detailItem: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: "#777",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#444",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    fontSize: 16,
    color: "#333",
    paddingVertical: 5,
  },
  actionContainer: {
    paddingHorizontal: 20,
  },
  saveButton: {
    backgroundColor: "#00aaff",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#888",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#00aaff",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#ff4d4d",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#ff4d4d",
    fontSize: 16,
    fontWeight: "bold",
  },
});
