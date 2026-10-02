import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Dimensions, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { Item } from '../../lib/types';
import Skeleton from '../../components/Skeleton';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = Colors.light;
const { width } = Dimensions.get('window');

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchItem();
    setRefreshing(false);
  }, [id]);

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          profiles:added_by (full_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setItem(data as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={C.text} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.imageContainer}>
            <Skeleton width={width - 48} height={width - 48} borderRadius={24} />
          </View>
          <View style={styles.detailsContainer}>
            <Skeleton width={width * 0.6} height={32} style={{ marginBottom: 12 }} />
            <Skeleton width={width * 0.3} height={32} style={{ marginBottom: 24 }} />
            <View style={styles.divider} />
            <Skeleton width={120} height={16} style={{ marginBottom: 16 }} />
            <View style={styles.bentoGrid}>
              <Skeleton width="30%" height={80} borderRadius={12} />
              <Skeleton width="30%" height={80} borderRadius={12} />
              <Skeleton width="30%" height={80} borderRadius={12} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push(`/item/edit/${id}`)} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        
        {/* Photos */}
        <View style={styles.imageContainer}>
          {item.photos && item.photos.length > 0 ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              {item.photos.map((url, idx) => (
                <View key={idx} style={styles.photoWrapper}>
                  <Image source={{ uri: url }} style={styles.cardPhoto} resizeMode="cover" />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noPhotoContainer}>
              <Ionicons name="image-outline" size={48} color={C.border} />
              <Text style={styles.noPhotoText}>No photos available</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsContainer}>
          
          <View style={styles.headerRow}>
            <Text style={styles.name}>{item.name}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>R{item.price?.toFixed(2) ?? 'N/A'}</Text>
            {item.is_marked_down && item.original_price && (
              <Text style={styles.originalPrice}>R{item.original_price.toFixed(2)}</Text>
            )}
            <View style={{ flex: 1 }} />
            {item.is_on_flash && (
              <View style={[styles.badge, { backgroundColor: C.accent }]}>
                <Ionicons name="flash" size={12} color={C.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { color: C.primary }]}>FLASH SALE</Text>
              </View>
            )}
            {item.is_marked_down && (
              <View style={[styles.badge, { backgroundColor: C.error, marginLeft: 8 }]}>
                <Text style={styles.badgeText}>MARKDOWN</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.bentoGrid}>
            <View style={styles.bentoCell}>
              <Text style={styles.cellLabel}>Size</Text>
              <Text style={styles.cellValue}>{item.size || 'N/A'}</Text>
            </View>
            <View style={styles.bentoCell}>
              <Text style={styles.cellLabel}>Colour</Text>
              <Text style={styles.cellValue}>{item.colour || 'N/A'}</Text>
            </View>
            <View style={styles.bentoCell}>
              <Text style={styles.cellLabel}>Department</Text>
              <Text style={styles.cellValue}>{item.department || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.codesCard}>
            <View style={styles.codeRow}>
              <Text style={styles.codeLabel}>Barcode</Text>
              <Text style={styles.codeValue}>{item.barcode || 'N/A'}</Text>
            </View>
            <View style={styles.codeRow}>
              <Text style={styles.codeLabel}>Short Code</Text>
              <Text style={styles.codeValue}>{item.short_code || 'N/A'}</Text>
            </View>
            <View style={[styles.codeRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={styles.codeLabel}>Long Code</Text>
              <Text style={styles.codeValue}>{item.long_code || 'N/A'}</Text>
            </View>
          </View>

          {item.notes ? (
            <>
              <Text style={styles.sectionTitle}>Notes</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{item.notes}</Text>
              </View>
            </>
          ) : null}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Metadata</Text>
          <View style={styles.metaInfoRow}>
            <Ionicons name="storefront-outline" size={16} color={C.textMuted} />
            <Text style={styles.metaInfoText}>Added at {item.store_added}</Text>
          </View>
          <View style={styles.metaInfoRow}>
            <Ionicons name="person-outline" size={16} color={C.textMuted} />
            <Text style={styles.metaInfoText}>Added by {(item as any).profiles?.full_name || 'Unknown User'}</Text>
          </View>
          <View style={styles.metaInfoRow}>
            <Ionicons name="time-outline" size={16} color={C.textMuted} />
            <Text style={styles.metaInfoText}>On {new Date(item.created_at).toLocaleDateString()}</Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.background,
  },
  errorText: {
    fontSize: 16,
    color: C.textMuted,
  },
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: C.background,
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  headerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerBtnText: {
    color: C.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  imageContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    alignItems: 'center',
  },
  photoScroll: {
    width: width - 48,
    height: width - 48,
    borderRadius: 24,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  photoWrapper: {
    width: width - 48,
    height: width - 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPhoto: {
    width: '100%',
    height: '100%',
  },
  noPhotoContainer: {
    width: width - 48,
    height: width - 48,
    borderRadius: 24,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  noPhotoText: {
    marginTop: 12,
    color: C.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  detailsContainer: {
    padding: 24,
  },
  headerRow: {
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: C.primary,
    letterSpacing: -1,
  },
  originalPrice: {
    fontSize: 16,
    color: C.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: 8,
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    height: 24,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: C.textMuted,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  bentoCell: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  cellLabel: {
    fontSize: 11,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cellValue: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  codesCard: {
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  codeLabel: {
    fontSize: 14,
    color: C.textMuted,
  },
  codeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    fontFamily: 'monospace',
  },
  notesCard: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#92400E',
  },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaInfoText: {
    fontSize: 14,
    color: C.textMuted,
    marginLeft: 8,
  },
});
