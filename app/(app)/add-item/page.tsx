"use client";

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { DEPARTMENTS, SIZES, COMMON_COLORS } from '../../../constants/Options';
import { Camera, Upload, X, CheckCircle, AlertCircle, ScanBarcode } from 'lucide-react';
import BarcodeScanner from '../../../components/BarcodeScanner';
import SearchableSelect from '../../../components/SearchableSelect';

export default function AddItemScreen() {
  const router = useRouter();
  
  // Form state
  const [name, setName] = useState('');
  const [longCode, setLongCode] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [size, setSize] = useState('');
  const [colour, setColour] = useState('');
  const [department, setDepartment] = useState('');
  const [price, setPrice] = useState('');
  
  const [showScanner, setShowScanner] = useState(false);
  
  // Images
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetForm = () => {
    setName('');
    setLongCode('');
    setShortCode('');
    setBarcode('');
    setSize('');
    setColour('');
    setDepartment('');
    setPrice('');
    setImages([]);
    setImagePreviews(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return [];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !department) {
      showToast('Please fill in required fields (Name, Price, Department).', 'error');
      return;
    }

    setLoading(true);
    
    try {
      // 1. Check for duplicates
      let query = supabase.from('items').select('id, name');
      
      if (barcode) {
        query = query.or(`barcode.eq.${barcode}`);
      } else if (longCode && shortCode) {
        query = query.or(`long_code.eq.${longCode},short_code.eq.${shortCode}`);
      } else if (longCode) {
        query = query.or(`long_code.eq.${longCode}`);
      } else if (shortCode) {
        query = query.or(`short_code.eq.${shortCode}`);
      }

      const { data: existingItems, error: duplicateError } = await query;
      
      if (duplicateError) throw duplicateError;
      
      // If an existing item matches the barcode or codes, it's a duplicate
      if (existingItems && existingItems.length > 0) {
        throw new Error(`Duplicate item found! An item already exists with this code/barcode.`);
      }

      // 2. Upload images
      const uploadedUrls: string[] = [];
      
      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('inventory-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('inventory-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      // 3. Get User Profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('primary_store')
        .eq('id', user.id)
        .single();

      // 4. Generate Semantic Embedding
      let search_embedding = null;
      try {
        const itemDescription = `[Name: ${name}] [Department: ${department}] [Color: ${colour || ''}] [Size: ${size || ''}]`;
        const embedRes = await fetch('/api/embed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: itemDescription }),
        });
        const embedData = await embedRes.json();
        if (embedData.vector) {
          search_embedding = embedData.vector;
        }
      } catch (e) {
        console.error("Failed to generate semantic embedding", e);
      }

      // 5. Insert Item
      const { error: insertError } = await supabase.from('items').insert({
        name,
        long_code: longCode || null,
        short_code: shortCode || null,
        barcode: barcode || null,
        size: size || null,
        colour: colour || null,
        department,
        price: parseFloat(price),
        is_marked_down: false,
        is_on_flash: false,
        photos: uploadedUrls,
        added_by: user.id,
        store_added: profile?.primary_store || 'Unknown',
        search_embedding: search_embedding,
      });

      if (insertError) throw insertError;

      // 5. Success
      showToast('Item successfully added to inventory!', 'success');
      resetForm();

    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to add item', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--background)', paddingBottom: '40px' }}>
      <div style={{ padding: '16px 20px', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px' }}>Add Item</h1>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', top: '80px', left: '20px', right: '20px', zIndex: 100,
          backgroundColor: toast.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${toast.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {toast.type === 'success' ? <CheckCircle color="var(--success)" /> : <AlertCircle color="var(--error)" />}
          <p style={{ color: toast.type === 'success' ? 'var(--success)' : 'var(--error)', fontWeight: 600, fontSize: '15px' }}>
            {toast.message}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Image Picker */}
        <div>
          <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', display: 'block' }}>Photos (Optional, multiple allowed)</label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {imagePreviews.map((preview, idx) => (
              <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden' }}>
                <img src={preview} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  onClick={() => removeImage(idx)}
                  style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '12px', padding: '4px' }}
                >
                  <X size={14} color="#FFF" />
                </button>
              </div>
            ))}
            
            <label style={{
              width: '80px', height: '80px', borderRadius: '12px', border: '1px dashed var(--border)', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backgroundColor: 'var(--surface)'
            }}>
              <Camera size={24} color="var(--text-muted)" />
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImagePick} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
        </div>

        {/* Basic Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Item Name *</label>
            <input type="text" className="input-base" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. LDS S/S CRINKLE MAXI DRESS" disabled={loading} />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price (R) *</label>
              <input type="number" step="0.01" className="input-base" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" disabled={loading} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department *</label>
              <SearchableSelect 
                options={DEPARTMENTS} 
                value={department} 
                onChange={setDepartment} 
                disabled={loading} 
              />
            </div>
          </div>
        </div>

        {/* Codes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Identification Codes</h3>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Barcode</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input type="text" className="input-base" style={{ flex: 1 }} value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Type barcode" disabled={loading} />
              <button 
                type="button"
                onClick={() => setShowScanner(true)}
                style={{ 
                  padding: '12px 16px', 
                  backgroundColor: 'var(--text)', 
                  color: 'var(--background)', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <ScanBarcode size={20} />
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Scan</span>
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Short Code</label>
              <input type="text" className="input-base" value={shortCode} onChange={e => setShortCode(e.target.value)} placeholder="e.g. FC7025" disabled={loading} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Long Code</label>
              <input type="text" className="input-base" value={longCode} onChange={e => setLongCode(e.target.value)} placeholder="e.g. 300630001" disabled={loading} />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Size</label>
            <SearchableSelect 
              options={SIZES} 
              value={size} 
              onChange={setSize} 
              placeholder="Optional"
              disabled={loading} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Colour</label>
            <SearchableSelect 
              options={COMMON_COLORS} 
              value={colour} 
              onChange={setColour} 
              placeholder="Optional"
              disabled={loading} 
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '16px', borderRadius: '12px' }} disabled={loading}>
          {loading ? 'Saving to Database...' : 'Add Item'}
        </button>
      </form>

      {showScanner && (
        <BarcodeScanner
          onScan={(text) => {
            setBarcode(text);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
