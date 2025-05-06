import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './app/Home';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AdPost from './screens/AdPost';
import VehicleRentForm from './Forms/VehicleRentForm';
import Accommodation from './Forms/AccommodationForm';
import TourGuidesForm from './Forms/TourGuidesForm';
import AdventureForm from './Forms/AdventureForm';
import RestaurantsForm from './Forms/RestaurantsForm';
import Profile from './components/Profile';
import AddLocation from './components/AddLocation';
import Admin from './app/Admin';
import ChatRoomListScreen from './components/ChatRoomList';
import SellerChatScreen from './screens/SellerChatScreen';
import EditScreen from './screens/EditScreen';
import ForgotPasswordScreen from './screens/ForgotPassword';



export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  AdPost: undefined;
  AccommodationForm: undefined;
  RestaurantsForm: undefined;
  TourGuidesForm: undefined;
  AdventureForm: undefined;
  Profile: undefined;
  VehicleRentForm: { location?: string };
  LocationInput: undefined;
  AddLocation: undefined;
  Admin: undefined;
  ChatRoomListScreen: undefined;
  SellerChatScreen: { chatRoomId: string, buyerName: string };
  EditScreen: { adData: any };
  ForgotPassword: undefined;
};


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}  />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="AdPost" component={AdPost} options={{ headerShown: false }} />
          <Stack.Screen name="VehicleRentForm" component={VehicleRentForm} options={{ headerShown: false }} />
          <Stack.Screen name="AccommodationForm" component={Accommodation} options={{ headerShown: false }} />
          <Stack.Screen name="RestaurantsForm" component={RestaurantsForm} options={{ headerShown: false }} />
          <Stack.Screen name="TourGuidesForm" component={TourGuidesForm} options={{ headerShown: false }} />
          <Stack.Screen name="AdventureForm" component={AdventureForm} options={{ headerShown: false }} />
          <Stack.Screen name="AddLocation" component={AddLocation}/>
          <Stack.Screen name="Admin" component={Admin}/>
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="ChatRoomListScreen"
            component={ChatRoomListScreen}
            options={{ title: "Your Chats" }}
          />
          <Stack.Screen
            name="SellerChatScreen"
            component={SellerChatScreen}
            options={{ title: "Chat" }}
          />
          <Stack.Screen name="EditScreen" component={EditScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
