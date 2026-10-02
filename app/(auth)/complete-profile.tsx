import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function CompleteProfileScreen() {
  const router = useRouter();

  const handleComplete = () => {
    // In real flow, this saves to Supabase then user goes to tabs
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Profile</Text>
      <Text style={styles.subtitle}>Let us know which store you work at.</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleComplete}>
        <Text style={styles.buttonText}>Save Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textLight,
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.light.accent,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: Colors.light.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
