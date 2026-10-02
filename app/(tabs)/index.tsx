import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../../constants/Colors';
import SearchBar from '../../components/SearchBar';
import ItemCard from '../../components/ItemCard';
import { Item } from '../../lib/types';

// Mock data
const mockItems: Partial<Item>[] = [
  { id: '1', name: 'Vintage Leather Jacket', price: 85.00, store_location: 'Main Street Branch', condition: 'Good' },
  { id: '2', name: 'Denim Jeans', price: 40.00, store_location: 'Downtown Plaza', condition: 'Like New' },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchBar placeholder="Search by barcode or name..." />
      </View>
      
      <FlatList
        data={mockItems}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <ItemCard item={item as Item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No items found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  listContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.light.textLight,
    marginTop: 40,
  }
});
