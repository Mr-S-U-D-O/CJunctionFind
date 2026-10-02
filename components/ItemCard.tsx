import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Item } from '../lib/types';
import { Colors } from '../constants/Colors';

const C = Colors.light;

export default function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/item/${item.id}`} asChild>
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.store}>{item.store_added}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>R{item.price?.toFixed(2) ?? 'N/A'}</Text>
          <Text style={styles.condition}>{item.department}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: C.border,
  },
  info: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  store: {
    fontSize: 13,
    color: C.textMuted,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  condition: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 4,
  }
});
