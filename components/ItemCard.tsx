import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Item } from '../lib/types';
import { Colors } from '../constants/Colors';

export default function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/item/${item.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.store}>{item.store_location}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <Text style={styles.condition}>{item.condition}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  store: {
    fontSize: 14,
    color: Colors.light.textLight,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.accent,
  },
  condition: {
    fontSize: 12,
    color: Colors.light.textLight,
    marginTop: 4,
  }
});
