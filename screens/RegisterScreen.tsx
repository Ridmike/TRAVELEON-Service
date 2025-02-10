import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { createUserWithEmailAndPassword } from "firebase/auth"; 
import { auth, db } from "../firebaseConfig"; 
import { collection, setDoc, doc } from "firebase/firestore";

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(''); 
  const [contactNo, setContactNo] = useState(''); 
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleRegister = async () => {

    if (!name.trim()) {
      Alert.alert("Invalid Name", "Name is required.");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters long.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const usersRef = collection(db, "usersLocal");
      await setDoc(doc(usersRef, user.uid), {
        email: user.email,
        name: name.trim(),
        password: password,
        contactNo: contactNo || null, 
        createdAt: new Date(),
      });

      Alert.alert("Success", "Registration successful!", [
        { text: "OK", onPress: () => navigation.replace("Home") },
      ]);
    } catch (error: any) {
      console.error("Error during registration:", error.code, error.message);

      let errorMessage = "Registration failed. Please try again.";
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already in use. Please use a different email.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address format.";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak. Please use a stronger password.";
          break;
        default:
          errorMessage = error.message || "An unexpected error occurred.";
          break;
      }
      Alert.alert("Registration Error", errorMessage);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.mainouter}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />

        <View>
          <Text>Name</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View>
          <Text>Email</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View>
          <Text>Contact Number</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Enter your contact number"
            keyboardType="phone-pad"
            value={contactNo}
            onChangeText={setContactNo}
          />
        </View>

        <View>
          <Text>Password</Text>
          <View style={styles.inputPasswoardContainer}>
            <TextInput
              style={styles.inputpasswoard}
              placeholder="Password"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.icon}>
              <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="grey" />
            </TouchableOpacity>
          </View>

          <Text>Confirm Password</Text>
          <View style={styles.inputPasswoardContainer}>
            <TextInput
              style={styles.inputpasswoard}
              placeholder="Confirm Password"
              secureTextEntry={!isPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.icon}>
              <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="grey" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.registerOuter} onPress={handleRegister}>
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>

        <View style={styles.LogOuter}>
          <Text>Have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.LogText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  mainouter: {
    padding: 20,
    backgroundColor: '#BAD9CE',
    height: '100%',
  },
  mainText: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: '',
    color: '#0E6973',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
  },
  inputField: {
    height: 38,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderWidth: 1,
    paddingLeft: 8,
    marginBottom: 16,
    borderRadius: 10,
  },
  inputPasswoardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 8,
    paddingRight: 8,
    marginBottom: 16,
  },
  inputpasswoard: {
    flex: 1,
    height: 38,
  },
  icon: {
    paddingRight: 5,
  },
  registerOuter: {
    backgroundColor: '#F2BB16',
    height: 34,
    width: 130,
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginTop: 20,
    marginBottom: 12,
  },
  registerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  LogOuter: {
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  LogText: {
    fontWeight: 'bold',
    color: '#0E6973',
  },
});
