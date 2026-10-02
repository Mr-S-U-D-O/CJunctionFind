import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Item } from '../lib/types';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const C = Colors.light;

export default function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/item/${item.id}`} asChild>
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
        </View>

        <View style={styles.contentRow}>
          <View style={styles.metaCol}>
            {item.barcode && <Text style={styles.barcodeText}>{item.barcode}</Text>}
            <View style={styles.chipsRow}>
              {[item.size, item.colour, item.department].filter(Boolean).map((meta, idx) => (
                <View key={idx} style={styles.metaChip}>
                  <Text style={styles.metaChipText}>{meta}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.priceCol}>
            <Text style={styles.price}>R{item.price?.toFixed(2) ?? 'N/A'}</Text>
            {item.is_marked_down && item.original_price && (
              <Text style={styles.originalPrice}>R{item.original_price.toFixed(2)}</Text>
            )}
          </View>
        </View>

        {(item.is_on_flash || item.is_marked_down) && (
          <View style={styles.badgesRow}>
            {item.is_on_flash && (
              <View style={[styles.badge, { backgroundColor: C.accent }]}>
                <Ionicons name="flash" size={10} color={C.primary} style={{ marginRight: 2 }} />
                <Text style={[styles.badgeText, { color: C.primary }]}>FLASH SALE</Text>
              </View>
            )}
            {item.is_marked_down && (
              <View style={[styles.badge, { backgroundColor: C.error }]}>
                <Ionicons name="pricetag" size={10} color="#FFF" style={{ marginRight: 2 }} />
                <Text style={styles.badgeText}>MARKDOWN</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
    lineHeight: 24,
    paddingRight: 12,
    letterSpacing: -0.3,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  metaCol: {
    flex: 1,
    paddingRight: 16,
  },
  barcodeText: {
    fontSize: 13,
    color: C.textMuted,
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    backgroundColor: C.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  metaChipText: {
    fontSize: 12,
    color: C.text,
    fontWeight: '600',
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: C.primary,
    letterSpacing: -0.5,
  },
  originalPrice: {
    fontSize: 14,
    color: C.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
