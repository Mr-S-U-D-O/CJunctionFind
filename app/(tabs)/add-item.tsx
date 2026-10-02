import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function AddItemScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Item</Text>
      <Text style={styles.subtitle}>Scan barcode or take a photo to begin.</Text>
      {/* Placeholder for PhotoUploader and BarcodeScanner */}
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
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textLight,
  }
});
