import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function LoginScreen() {
  const router = useRouter();

  // Mock login function
  const handleLogin = () => {
    // We navigate to complete-profile to mock an incomplete profile user flow
    router.replace('/(auth)/complete-profile');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CJunctionFind</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      
      <Link href="/(auth)/signup" asChild>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Create an account</Text>
        </TouchableOpacity>
      </Link>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: Colors.light.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    padding: 16,
    alignItems: 'center',
  },
  linkText: {
    color: Colors.light.accent,
    fontSize: 16,
  },
});
