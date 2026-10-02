import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { Item } from '../../lib/types';
import SearchBar from '../../components/SearchBar';
import ItemCard from '../../components/ItemCard';
import BarcodeScanner from '../../components/BarcodeScanner';
import FilterModal, { FilterOptions } from '../../components/FilterModal';
import Skeleton from '../../components/Skeleton';

const C = Colors.light;

export default function FindScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({ department: null, size: null, colour: null });
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [scannerVisible, setScannerVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchItems = useCallback(async (searchQuery: string, activeFilters: FilterOptions, isRefresh = false) => {
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
          `name.ilike.${term},long_code.ilike.${term},short_code.ilike.${term},barcode.ilike.${term}`
        );
      }

      if (activeFilters.department) q = q.eq('department', activeFilters.department);
      if (activeFilters.size) q = q.eq('size', activeFilters.size);
      if (activeFilters.colour) q = q.eq('colour', activeFilters.colour);

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

  // Fetch when query or filters change
  useEffect(() => {
    fetchItems(debouncedQuery, filters);
  }, [debouncedQuery, filters, fetchItems]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItems(debouncedQuery, filters, true);
  };

  const handleScan = async (barcode: string) => {
    setScannerVisible(false);
    
    // Check if barcode exists in database
    try {
      const { data, error } = await supabase
        .from('items')
        .select('id')
        .eq('barcode', barcode)
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Item found, navigate to detail
        router.push(`/item/${data[0].id}`);
      } else {
        // Not found, offer to add
        Alert.alert(
          'Item Not Found',
          `Barcode ${barcode} isn't in the inventory. Would you like to add it?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Add Item', 
              style: 'default',
              onPress: () => {
                router.push({
                  pathname: '/add-item',
                  params: { barcode }
                });
              }
            }
          ]
        );
      }
    } catch (err) {
      console.error('Error scanning barcode:', err);
      Alert.alert('Error', 'Failed to search for barcode');
    }
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>Inventory</Text>
          <TouchableOpacity 
            style={styles.scanBtn} 
            onPress={() => setScannerVisible(true)} 
            activeOpacity={0.8}
          >
            <Ionicons name="barcode-outline" size={20} color={C.surface} style={{ marginRight: 6 }} />
            <Text style={styles.scanBtnText}>Scan</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar 
              value={query} 
              onChangeText={setQuery} 
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => setFiltersVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="options-outline" 
              size={22} 
              color={activeFilterCount > 0 ? C.surface : C.text} 
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.list}>
          {[1, 2, 3, 4, 5].map((key) => (
            <View key={key} style={styles.skeletonCard}>
              <Skeleton width={80} height={80} borderRadius={16} />
              <View style={styles.skeletonContent}>
                <Skeleton width="80%" height={20} style={{ marginBottom: 8 }} />
                <Skeleton width="40%" height={16} style={{ marginBottom: 16 }} />
                <Skeleton width="30%" height={24} borderRadius={6} />
              </View>
            </View>
          ))}
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
              <View style={styles.emptyIconWrap}>
                <Ionicons name="search-outline" size={40} color={C.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptyBody}>
                {query.trim() || activeFilterCount > 0
                  ? 'Try a different search term, clear filters, or scan a barcode.' 
                  : 'Start searching or add new items to the inventory.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => <ItemCard item={item} />}
        />
      )}

      <BarcodeScanner 
        visible={scannerVisible} 
        onClose={() => setScannerVisible(false)} 
        onScan={handleScan} 
      />

      <FilterModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        filters={filters}
        onApply={setFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 16,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.8,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  scanBtnText: {
    color: C.surface,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: C.accent,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.surface,
  },
  filterBadgeText: {
    color: C.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FEF2F2',
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
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
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 15,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
