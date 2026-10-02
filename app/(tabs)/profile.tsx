import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      
      <View style={styles.infoSection}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>Store Associate</Text>
        
        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>Main Street Branch</Text>
      </View>
      
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: Colors.light.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    color: Colors.light.textLight,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 16,
  },
  logoutButton: {
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  logoutText: {
    color: Colors.light.error,
    fontWeight: '600',
    fontSize: 16,
  }
});
