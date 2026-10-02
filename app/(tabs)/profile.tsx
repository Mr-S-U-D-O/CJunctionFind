import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../lib/types';
import { Ionicons } from '@expo/vector-icons';

const C = Colors.light;

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      setProfile(data as Profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color={C.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.displayName}>{profile?.full_name || 'Store Associate'}</Text>
          <Text style={styles.storeName}>
            Primary Store: {profile?.primary_store || 'Unassigned'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="id-card-outline" size={20} color={C.textMuted} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>Employee Number</Text>
            </View>
            <Text style={styles.rowValue}>{profile?.employee_number || 'N/A'}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="storefront-outline" size={20} color={C.textMuted} style={styles.rowIcon} />
              <Text style={styles.rowLabel}>Primary Store</Text>
            </View>
            <Text style={styles.rowValue}>{profile?.primary_store || 'N/A'}</Text>
          </View>
          {profile?.secondary_stores && profile.secondary_stores.length > 0 && (
            <>
              <View style={styles.separator} />
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Ionicons name="business-outline" size={20} color={C.textMuted} style={styles.rowIcon} />
                  <Text style={styles.rowLabel}>Secondary Stores</Text>
                </View>
                <Text style={styles.rowValue}>{profile.secondary_stores.join(', ')}</Text>
              </View>
            </>
          )}
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={C.error} style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: C.surface,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
    color: C.textMuted,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  section: {
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 12,
  },
  separator: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
  },
  rowLabel: {
    fontSize: 15,
    color: C.text,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  signOutBtn: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 16,
    color: C.error,
    fontWeight: '700',
  },
});
