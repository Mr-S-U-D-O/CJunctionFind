import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Item } from '../../lib/types';

const C = Colors.light;

// Placeholder data — replace with real Supabase query later
const MOCK_ITEMS: Item[] = [
  {
    id: '1',
    name: 'LDS S/S CHOC SIDE RUCHED CRINKLE BODYCON MAXI DRESS',
    long_code: '300630001',
    short_code: 'FC7025',
    barcode: '2000001291962',
    size: '10',
    colour: 'Chocolate',
    department: 'Ladies',
    price: 299,
    original_price: 399,
    is_marked_down: true,
    is_on_flash: false,
    photos: [],
    notes: null,
    added_by: '',
    store_added: 'Clothing Junction - The Glen',
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    name: 'MNS SLIM FIT STRETCH CHINO TROUSER',
    long_code: '300420088',
    short_code: 'MC3201',
    barcode: '2000001384458',
    size: '32',
    colour: 'Khaki',
    department: 'Mens',
    price: 349,
    original_price: null,
    is_marked_down: false,
    is_on_flash: true,
    photos: [],
    notes: null,
    added_by: '',
    store_added: 'Clothing Junction - Festival Mall',
    created_at: '',
    updated_at: '',
  },
];

function ItemRow({ item }: { item: Item }) {
  return (
    <Link href={`/item/${item.id}`} asChild>
      <TouchableOpacity style={styles.row} activeOpacity={0.7}>
        {/* Colour swatch placeholder */}
        <View style={styles.swatch} />

        <View style={styles.rowBody}>
          <Text style={styles.rowName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.rowMeta}>
            {item.short_code && (
              <Text style={styles.code}>{item.short_code}</Text>
            )}
            {item.size && (
              <Text style={styles.metaChip}>{item.size}</Text>
            )}
            {item.department && (
              <Text style={styles.metaChip}>{item.department}</Text>
            )}
          </View>
        </View>

        <View style={styles.rowRight}>
          {item.is_on_flash && (
            <View style={styles.flashBadge}>
              <Text style={styles.flashText}>FLASH</Text>
            </View>
          )}
          <Text style={styles.price}>R{item.price}</Text>
          {item.is_marked_down && item.original_price && (
            <Text style={styles.originalPrice}>R{item.original_price}</Text>
          )}
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export default function FindScreen() {
  const [query, setQuery] = React.useState('');

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Barcode, code, or name..."
          placeholderTextColor={C.textMuted}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Results */}
      <FlatList
        data={MOCK_ITEMS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No items</Text>
            <Text style={styles.emptyBody}>Search by barcode, short code, or item name.</Text>
          </View>
        }
        renderItem={({ item }) => <ItemRow item={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  searchBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  searchInput: {
    height: 40,
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: C.text,
  },
  list: {
    paddingBottom: 24,
  },
  separator: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: C.surface,
    gap: 12,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.border,
  },
  rowBody: {
    flex: 1,
  },
  rowName: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    lineHeight: 18,
    marginBottom: 5,
  },
  rowMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  code: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: C.textMuted,
    backgroundColor: C.background,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  metaChip: {
    fontSize: 11,
    color: C.textMuted,
    backgroundColor: C.background,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  rowRight: {
    alignItems: 'flex-end',
    minWidth: 56,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  originalPrice: {
    fontSize: 12,
    color: C.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  flashBadge: {
    backgroundColor: C.accent,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginBottom: 4,
  },
  flashText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  empty: {
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
