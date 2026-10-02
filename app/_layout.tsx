import { useEffect, useState, createContext } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Colors } from '../constants/Colors';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

export const AuthContext = createContext({
  refreshProfile: async () => {},
});

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const segments = useSegments();
  const router = useRouter();

  const checkProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    setHasProfile(!!data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) await checkProfile(session.user.id);
      else setHasProfile(null);
      setIsInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) await checkProfile(session.user.id);
        else setHasProfile(null);
        setIsInitializing(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (session?.user) await checkProfile(session.user.id);
  };

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === '(auth)';
    const currentSegments = segments as string[];

    if (!session) {
      if (!inAuthGroup) router.replace('/(auth)/login');
    } else {
      if (hasProfile === false && currentSegments.join('/') !== '(auth)/complete-profile') {
        router.replace('/(auth)/complete-profile');
      } else if (hasProfile === true && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [session, hasProfile, isInitializing, segments]);

  if (isInitializing || !fontsLoaded) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="small" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ refreshProfile }}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="item/[id]"
          options={{
            headerShown: true,
            title: 'Item',
            headerStyle: { backgroundColor: Colors.light.background },
            headerTintColor: Colors.light.primary,
            headerShadowVisible: false,
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
});
