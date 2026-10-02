import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const C = Colors.light;

export interface FilterOptions {
  department: string | null;
  size: string | null;
  colour: string | null;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
}

const DEPARTMENTS = ['Ladies', 'Mens', 'Kids', 'Accessories', 'Shoes'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'One Size'];
const COLOURS = ['Black', 'White', 'Red', 'Blue', 'Navy', 'Green', 'Yellow', 'Brown', 'Grey', 'Pink', 'Purple', 'Orange'];

export default function FilterModal({ visible, onClose, filters, onApply }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  // Sync when opened
  React.useEffect(() => {
    if (visible) setLocalFilters(filters);
  }, [visible, filters]);

  const toggleFilter = (key: keyof FilterOptions, val: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: prev[key] === val ? null : val
    }));
  };

  const clearAll = () => {
    setLocalFilters({ department: null, size: null, colour: null });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const renderSection = (title: string, key: keyof FilterOptions, options: string[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipsRow}>
        {options.map(opt => {
          const isSelected = localFilters[key] === opt;
          return (
            <TouchableOpacity 
              key={opt}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => toggleFilter(key, opt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          {renderSection('Department', 'department', DEPARTMENTS)}
          <View style={styles.divider} />
          {renderSection('Size', 'size', SIZES)}
          <View style={styles.divider} />
          {renderSection('Colour', 'colour', COLOURS)}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.8}>
            <Text style={styles.applyBtnText}>Show Results</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  closeBtn: {
    padding: 4,
    marginLeft: -4,
  },
  clearBtn: {
    padding: 4,
    marginRight: -4,
  },
  clearBtnText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 24,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipSelected: {
    backgroundColor: C.text,
    borderColor: C.text,
  },
  chipText: {
    fontSize: 14,
    color: C.textMuted,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: C.surface,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 24,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  applyBtn: {
    backgroundColor: C.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
