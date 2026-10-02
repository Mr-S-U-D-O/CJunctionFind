import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const C = Colors.light;

interface DropdownPickerProps {
  label: string;
  value: string;
  onValueChange: (val: string) => void;
  options: string[];
  searchable?: boolean;
  placeholder?: string;
  allowCustom?: boolean;
}

export default function DropdownPicker({
  label,
  value,
  onValueChange,
  options,
  searchable = false,
  placeholder = 'Select an option',
  allowCustom = false,
}: DropdownPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const lowerQuery = searchQuery.toLowerCase();
    return options.filter(opt => opt.toLowerCase().includes(lowerQuery));
  }, [options, searchQuery]);

  const handleSelect = (val: string) => {
    onValueChange(val);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleCustomSubmit = () => {
    if (searchQuery.trim()) {
      handleSelect(searchQuery.trim());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        activeOpacity={0.7} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectorText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={C.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>

            {searchable && (
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={C.textMuted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor={C.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
              </View>
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.optionItem, value === item && styles.optionItemActive]} 
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[styles.optionText, value === item && styles.optionTextActive]}>
                    {item}
                  </Text>
                  {value === item && (
                    <Ionicons name="checkmark-circle" size={20} color={C.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  {allowCustom && searchQuery.trim() ? (
                    <TouchableOpacity style={styles.customBtn} onPress={handleCustomSubmit}>
                      <Ionicons name="add-circle-outline" size={20} color={C.primary} style={{ marginRight: 8 }} />
                      <Text style={styles.customBtnText}>Add "{searchQuery.trim()}"</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.emptyText}>No options found</Text>
                  )}
                </View>
              )}
              ListFooterComponent={() => {
                // If they searched but there ARE results, still let them add the custom one if they want exact match
                if (allowCustom && searchQuery.trim() && filteredOptions.length > 0 && !filteredOptions.some(o => o.toLowerCase() === searchQuery.trim().toLowerCase())) {
                  return (
                    <TouchableOpacity style={[styles.customBtn, { marginTop: 16 }]} onPress={handleCustomSubmit}>
                      <Ionicons name="add-circle-outline" size={20} color={C.primary} style={{ marginRight: 8 }} />
                      <Text style={styles.customBtnText}>Add "{searchQuery.trim()}"</Text>
                    </TouchableOpacity>
                  );
                }
                return null;
              }}
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  selectorText: {
    fontSize: 15,
    color: C.text,
    flex: 1,
  },
  placeholderText: {
    color: C.textMuted,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: C.background,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  closeBtn: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: C.text,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  optionItemActive: {
    backgroundColor: '#FAFAFA',
  },
  optionText: {
    fontSize: 16,
    color: C.text,
  },
  optionTextActive: {
    fontWeight: '700',
    color: C.primary,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: C.textMuted,
  },
  customBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  customBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.primary,
  },
});
