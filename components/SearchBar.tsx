import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const C = Colors.light;

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ 
  value, 
  onChangeText, 
  placeholder = 'Search items by name, barcode, or code' 
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={C.textMuted} style={styles.icon} />
      <TextInput 
        style={styles.input} 
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity 
          style={styles.clearBtn} 
          onPress={() => onChangeText('')}
          activeOpacity={0.6}
        >
          <Ionicons name="close-circle" size={20} color={C.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.background,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    height: 48,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: C.text,
  },
  clearBtn: {
    padding: 8,
    marginRight: -8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
