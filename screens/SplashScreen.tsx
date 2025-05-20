import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onFinish(); // navigate after splash
    }, 3000); // show for 3 seconds

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')} 
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>Traveleon</Text>
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C6F6D5', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: 180,
    width: 180,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#4A5568',
    marginTop: 10,
  },
});
