import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Mock Auth Check - replace with real Supabase session check later
    setTimeout(() => {
      setIsAuthenticated(false); // Defaulting to false to show login screen
      setIsProfileComplete(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated) {
      if (!isProfileComplete && (segments as string[])[1] !== 'complete-profile') {
        router.replace('/(auth)/complete-profile');
      } else if (isProfileComplete && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isProfileComplete, segments]);

  if (isAuthenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="item/[id]" 
        options={{ 
          presentation: 'modal', 
          headerShown: true, 
          title: 'Item Details',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.primary,
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
});
