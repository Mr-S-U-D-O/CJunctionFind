import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { Item } from '../../lib/types';
import SearchBar from '../../components/SearchBar';
import ItemCard from '../../components/ItemCard';

const C = Colors.light;

export default function FindScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchItems = useCallback(async (searchQuery: string, isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      let q = supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (searchQuery.trim()) {
        const term = `%${searchQuery.trim()}%`;
        q = q.or(
          `name.ilike.${term},long_code.ilike.${term},short_code.ilike.${term},barcode.ilike.${term},colour.ilike.${term},size.ilike.${term}`
        );
      }

      const { data, error: fetchError } = await q;

      if (fetchError) throw fetchError;
      setItems(data as Item[] || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch items');
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch when debounced query changes
  useEffect(() => {
    fetchItems(debouncedQuery);
  }, [debouncedQuery, fetchItems]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItems(debouncedQuery, true);
  };

  const handleScanPress = () => {
    Alert.alert('Coming soon', 'Barcode scanner will open here.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <SearchBar 
          value={query} 
          onChangeText={setQuery} 
        />
        
        <TouchableOpacity style={styles.scanBtn} onPress={handleScanPress} activeOpacity={0.85}>
          <Text style={styles.scanBtnText}>Scan Barcode</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptyBody}>
                {query.trim() 
                  ? 'Try a different search term or scan a barcode.' 
                  : 'Start searching or add new items to the inventory.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => <ItemCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  scanBtn: {
    height: 48,
    backgroundColor: C.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FFE3E3',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.error,
  },
  errorText: {
    color: C.error,
    fontSize: 14,
    fontWeight: '500',
  },
  empty: {
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
