import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'

type AdminScreenProps = NativeStackScreenProps<RootStackParamList, 'Admin'> 

const Admin : React.FC<AdminScreenProps> = ({ navigation }) => {
  return (
    <ScrollView>
      <Text style={styles.adminText}>Hello, Admin</Text>
      <View style={styles.locationOuter}>
        <TouchableOpacity style={styles.locationItem} onPress={() => navigation.navigate('AddLocation')} >
          <Text style={styles.textLocation}>Add Locations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.locationItem} onPress={() => navigation.navigate('AddLocation')} >
          <Text style={styles.textLocation}>Add Locations</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default Admin

const styles = StyleSheet.create({
    locationOuter: {
      margin: 10,
    },
    adminText: {
      textAlign: 'left',
      fontSize: 24,
      margin: 15,
    },
    locationItem: {
      padding: 10,
      borderRadius: 10,
      backgroundColor: "red",
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
      alignSelf: 'flex-start', 
    },
    textLocation: {
      fontSize: 18,
    },

})