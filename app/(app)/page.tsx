"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Item } from '../../lib/types';
import SearchBar from '../../components/SearchBar';
import ItemCard from '../../components/ItemCard';
import BarcodeScanner from '../../components/BarcodeScanner';
import { Search, Filter, ScanBarcode } from 'lucide-react';

export default function InventoryScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchItems = useCallback(async (searchQuery: string) => {
    setLoading(true);
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

      const { data, error: fetchError } = await q;

      if (fetchError) throw fetchError;
      setItems(data as Item[] || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(debouncedQuery);
  }, [debouncedQuery, fetchItems]);

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--background)' }}>
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px' }}>Inventory</h1>
          <button 
            onClick={() => setShowScanner(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--text)',
              padding: '10px 16px',
              borderRadius: '24px',
              color: 'var(--background)'
            }}
          >
            <ScanBarcode size={20} style={{ marginRight: '6px' }} />
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Scan</span>
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SearchBar value={query} onChangeText={setQuery} />
          
          <button style={{
            width: '48px',
            height: '48px',
            borderRadius: '24px',
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Filter size={20} color="var(--text)" />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#FEF2F2', margin: '20px', borderRadius: '12px', border: '1px solid #FECACA' }}>
          <p style={{ color: 'var(--error)', fontSize: '14px', fontWeight: 500 }}>{error}</p>
        </div>
      )}

      <div style={{ padding: '20px' }}>
        {loading ? (
          <div>Loading...</div> // Will replace with skeleton later
        ) : items.length === 0 ? (
          <div style={{ paddingTop: '80px', textAlign: 'center', padding: '80px 40px 0' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Search size={40} color="var(--text-muted)" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No items found</h2>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '22px' }}>
              {query.trim() ? 'Try a different search term or scan a barcode.' : 'Start searching or add new items to the inventory.'}
            </p>
          </div>
        ) : (
          items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))
        )}
      </div>

      {showScanner && (
        <BarcodeScanner
          onScan={(text) => {
            setQuery(text);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
