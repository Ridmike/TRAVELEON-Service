import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { auth } from '../firebaseConfig'; // Import Firebase auth instance
import { signInWithEmailAndPassword } from 'firebase/auth';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    if (email === 'admin@gmail.com' && password === 'Admin1234') {
      Alert.alert('Success', 'Logged in as Admin!', [
        { text: 'OK', onPress: () => navigation.replace('Admin') },
      ]);
      return;
    }
  
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Logged in successfully!', [
        { text: 'OK', onPress: () => navigation.replace('Home') },
      ]);
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';
  
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/invalid-credential': 
          errorMessage = 'Invalid credentials provided. Please try again.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred.';
          break;
      }
  
      Alert.alert('Login Error', errorMessage);
    }
  };
  
  
  return (
    <View style={styles.mainouter}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

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
      </View>

      <Text style={styles.forgotpasswoard}>Forgot password?</Text>
      <TouchableOpacity style={styles.loginOuter} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
      <View style={styles.RegOuter}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('Register')}>
          <Text style={styles.RegText}>Register Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  mainouter: {
    padding: 20,
    backgroundColor: '#BAD9CE',
    height: '100%',
  },
  mainText: {
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: '',
    color: '#0F328D',
    marginBottom: 50,
  },
  logo: {
    width: 140,
    height: 140,
    alignSelf: 'center',
  },
  inputField: {
    height: 38,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 8,
    marginBottom: 16,
    borderRadius: 10,
  },
  inputPasswoardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
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
    paddingLeft: 5,
  },
  forgotpasswoard: {
    textAlign: 'right',
  },
  loginOuter: {
    backgroundColor: '#0F328D',
    height: 30,
    width: 120,
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginTop: 80,
    marginBottom: 12,
  },
  loginText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  RegOuter: {
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  RegText: {
    fontWeight: 'bold',
    color: '#0F328D',
  },
});
