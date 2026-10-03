"use client";

import { Item } from '../lib/types';
import Link from 'next/link';

export default function ItemCard({ item }: { item: Item }) {
  const isSale = item.is_marked_down || item.is_on_flash;
  const image = item.photos && item.photos.length > 0 ? item.photos[0] : null;

  return (
    <Link href={`/item/${item.id}`} style={{
      display: 'flex',
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '12px',
      marginBottom: '16px',
      gap: '12px'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '12px',
        backgroundColor: 'var(--border)',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {image ? (
          <img src={image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '10px', textAlign: 'center' }}>No image</div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.name}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          {item.barcode || item.short_code || item.long_code || 'No code'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSale && item.original_price ? (
            <>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--error)' }}>
                R{item.price?.toFixed(2)}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                R{item.original_price?.toFixed(2)}
              </span>
            </>
          ) : (
            <span style={{ fontSize: '15px', fontWeight: 800 }}>
              R{item.price?.toFixed(2) || '0.00'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
