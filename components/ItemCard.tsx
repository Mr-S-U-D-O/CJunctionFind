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
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        </View>

        <View style={styles.codesRow}>
          {item.short_code && <Text style={styles.codeText}>Short: {item.short_code}</Text>}
          {item.long_code && <Text style={styles.codeText}>Long: {item.long_code}</Text>}
          {item.barcode && <Text style={styles.codeText}>Bar: {item.barcode}</Text>}
        </View>

        <View style={styles.metaRow}>
          {[item.size, item.colour, item.department].filter(Boolean).map((meta, idx) => (
            <View key={idx} style={styles.metaChip}>
              <Text style={styles.metaChipText}>{meta}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerRow}>
          <View style={styles.badges}>
            {item.is_on_flash && (
              <View style={[styles.badge, { backgroundColor: C.accent }]}>
                <Text style={styles.badgeText}>FLASH</Text>
              </View>
            )}
            {item.is_marked_down && (
              <View style={[styles.badge, { backgroundColor: C.error }]}>
                <Text style={styles.badgeText}>MARKED DOWN</Text>
              </View>
            )}
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>R{item.price?.toFixed(2) ?? 'N/A'}</Text>
            {item.is_marked_down && item.original_price && (
              <Text style={styles.originalPrice}>R{item.original_price.toFixed(2)}</Text>
            )}
          </View>
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
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
  },
  header: {
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    lineHeight: 22,
  },
  codesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 12,
    color: C.textMuted,
    fontFamily: 'monospace',
    backgroundColor: C.background,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  metaChip: {
    backgroundColor: C.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  metaChipText: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
    paddingRight: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: C.primary,
  },
  originalPrice: {
    fontSize: 13,
    color: C.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
});
