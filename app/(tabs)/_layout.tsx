import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const C = Colors.light;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: C.background,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: C.text,
          fontSize: 18,
          fontWeight: '700',
          letterSpacing: -0.5,
        },
        headerTintColor: C.primary,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopWidth: 1,
          borderTopColor: C.border,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Find',
          headerTitle: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-item"
        options={{
          title: 'Add Item',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});
