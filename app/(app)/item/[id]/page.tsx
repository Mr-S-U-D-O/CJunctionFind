"use client";

import { useEffect, useState, use } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Item, Profile } from '../../../../lib/types';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Trash2, Edit3, Tag, Store, Clock, User, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ItemDetailsScreen({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [item, setItem] = useState<Item | null>(null);
  const [addedByProfile, setAddedByProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();
        
      if (itemError) throw itemError;
      setItem(itemData as Item);
      
      if (itemData.added_by) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', itemData.added_by)
          .single();
          
        if (profileData) {
          setAddedByProfile(profileData as Profile);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Navigate back after deletion
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Failed to delete item.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--background)' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid var(--border)', borderTopColor: 'var(--text)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ flex: 1, backgroundColor: 'var(--background)', padding: '24px', textAlign: 'center', paddingTop: '100px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Item not found</h2>
        <button onClick={() => router.back()} style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Go back</button>
      </div>
    );
  }

  const isSale = item.is_marked_down || item.is_on_flash;

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--background)', paddingBottom: '40px' }}>
      
      {/* Header */}
      <div style={{ padding: '16px 20px', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', color: 'var(--text)' }}>
          <ChevronLeft size={24} />
          <span style={{ fontSize: '15px', fontWeight: 600, marginLeft: '4px' }}>Back</span>
        </button>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={20} color="var(--error)" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#FEF2F2', padding: '12px', borderRadius: '40px' }}>
                <AlertTriangle size={24} color="var(--error)" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Delete Item?</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '22px', marginBottom: '24px' }}>
              Are you sure you want to remove <strong>{item.name}</strong> from the inventory? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                disabled={isDeleting}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                disabled={isDeleting}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', backgroundColor: 'var(--error)', color: '#FFF', fontWeight: 600, border: 'none' }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery */}
      <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
        {item.photos && item.photos.length > 0 ? (
          <>
            <img src={item.photos[currentImageIndex]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            
            {item.photos.length > 1 && (
              <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {item.photos.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{ 
                      width: '8px', height: '8px', borderRadius: '4px', 
                      backgroundColor: idx === currentImageIndex ? 'var(--text)' : 'var(--border)',
                      transition: 'background-color 0.2s'
                    }} 
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No images available
          </div>
        )}
      </div>

      <div style={{ padding: '24px 20px' }}>
        
        {/* Basic Info */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
            {item.department}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, lineHeight: '30px', marginBottom: '12px' }}>{item.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            {isSale && item.original_price ? (
              <>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--error)' }}>
                  R{item.price?.toFixed(2)}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  R{item.original_price?.toFixed(2)}
                </span>
              </>
            ) : (
              <span style={{ fontSize: '28px', fontWeight: 800 }}>
                R{item.price?.toFixed(2) || '0.00'}
              </span>
            )}
            
            {item.is_on_flash && (
              <span style={{ backgroundColor: 'var(--accent)', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>FLASH</span>
            )}
          </div>
        </div>

        {/* Variants */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <div style={{ flex: 1, padding: '16px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Size</p>
            <p style={{ fontSize: '16px', fontWeight: 600 }}>{item.size || 'N/A'}</p>
          </div>
          <div style={{ flex: 1, padding: '16px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Colour</p>
            <p style={{ fontSize: '16px', fontWeight: 600 }}>{item.colour || 'N/A'}</p>
          </div>
        </div>

        {/* Identification */}
        <div style={{ marginBottom: '32px', backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Tag size={18} color="var(--text-muted)" />
            <span style={{ fontSize: '15px', fontWeight: 600 }}>Identification</span>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Barcode</span>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>{item.barcode || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Short Code</span>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>{item.short_code || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Long Code</span>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>{item.long_code || '-'}</span>
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={18} color="var(--text-muted)" />
            <span style={{ fontSize: '15px', fontWeight: 600 }}>History</span>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Store size={18} color="var(--text-muted)" style={{ marginTop: '2px' }} />
              <div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '2px' }}>Added at store</p>
                <p style={{ fontSize: '15px', fontWeight: 500 }}>{item.store_added}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <User size={18} color="var(--text-muted)" style={{ marginTop: '2px' }} />
              <div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '2px' }}>Added by</p>
                <p style={{ fontSize: '15px', fontWeight: 500 }}>
                  {addedByProfile ? addedByProfile.full_name : 'Unknown User'} 
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '6px' }}>
                    ({new Date(item.created_at).toLocaleDateString()})
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
