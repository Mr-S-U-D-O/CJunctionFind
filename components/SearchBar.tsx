import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface SearchBarProps {
  placeholder?: string;
}

export default function SearchBar({ placeholder = 'Search...' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input} 
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  input: {
    fontSize: 16,
    color: Colors.light.text,
  }
});
