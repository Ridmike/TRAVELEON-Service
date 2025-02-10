import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type Props = NativeStackScreenProps<RootStackParamList, "AdPost">;

const AdPost: React.FC<Props> = ({ navigation }) => {
  const categories = [
    { id: 1, name: "Vehicle Rent", icon: "🚗", route: "VehicleRentForm" },
    { id: 2, name: "Accommodation", icon: "🏠", route: "AccommodationForm" },
    { id: 3, name: "Restaurants", icon: "🍴", route: "RestaurantsForm" },
    { id: 4, name: "Tour Guides", icon: "🧭", route: "TourGuidesForm" },
    { id: 5, name: "Adventure", icon: "🏄", route: "AdventureForm" },
  ] as const;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#24BAEC" />
      <View style={styles.header}>
        <Text style={styles.title}>Select Category</Text>
        <Text style={styles.subtitle}>Choose a service to list</Text>
      </View>
      
      <View style={styles.formContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryButton}
            activeOpacity={0.8}
            onPress={() => {
              // Handle specific parameters for routes
              if (category.route === "VehicleRentForm") {
                navigation.navigate("VehicleRentForm", { location: undefined });
              } else {
                navigation.navigate(category.route);
              }
            }}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
            </View>
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default AdPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#24BAEC",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: 8,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(36, 186, 236, 0.15)",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(36, 186, 236, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  }
});