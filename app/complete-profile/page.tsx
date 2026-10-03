"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { STORES } from '../../constants/Stores';
import { Check, Store, ChevronRight } from 'lucide-react';

export default function CompleteProfileScreen() {
  const [fullName, setFullName] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [primaryStore, setPrimaryStore] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [storeSearch, setStoreSearch] = useState('');

  const router = useRouter();

  useEffect(() => {
    // Check if logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !employeeNumber || !primaryStore) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          employee_number: employeeNumber,
          primary_store: primaryStore,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      // Successfully saved profile
      router.push('/');
    } catch (e: any) {
      setErrorMsg(e.message || 'Error saving profile');
      setLoading(false);
    }
  };

  const filteredStores = STORES.filter(store => 
    store.toLowerCase().includes(storeSearch.toLowerCase())
  );

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ marginTop: '32px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Complete Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>We need a few details before you can start managing inventory.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <input 
              type="text" 
              className="input-base" 
              placeholder="Full Name (e.g. Jane Doe)" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <input 
              type="text" 
              className="input-base" 
              placeholder="Employee Number (e.g. EMP12345)" 
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border)',
              padding: '12px 0',
              cursor: 'pointer'
            }}
            onClick={() => setShowStoreModal(true)}
          >
            <span style={{ color: primaryStore ? 'var(--text)' : 'var(--text-muted)' }}>
              {primaryStore || 'Select Primary Store'}
            </span>
            <ChevronRight size={20} color="var(--text-muted)" />
          </div>
        </div>

        {errorMsg ? (
          <div style={{ padding: '16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
            <p style={{ color: 'var(--error)', fontSize: '14px', fontWeight: 500 }}>• {errorMsg}</p>
          </div>
        ) : null}

        <div style={{ marginTop: '16px' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </div>
      </form>

      {/* Store Selection Modal */}
      {showStoreModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'var(--background)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            padding: '20px', 
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <button onClick={() => setShowStoreModal(false)} style={{ color: 'var(--text)', fontSize: '16px', fontWeight: 600 }}>
              Cancel
            </button>
            <input 
              type="text"
              placeholder="Search stores..."
              style={{
                flex: 1,
                background: 'var(--border)',
                border: 'none',
                color: 'var(--text)',
                padding: '10px 16px',
                borderRadius: '8px',
                outline: 'none'
              }}
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
              autoFocus
            />
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredStores.map(store => (
              <div 
                key={store}
                onClick={() => {
                  setPrimaryStore(store);
                  setShowStoreModal(false);
                  setStoreSearch('');
                }}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Store size={20} color="var(--text-muted)" />
                  <span style={{ fontSize: '15px' }}>{store}</span>
                </div>
                {primaryStore === store && <Check size={20} color="var(--text)" />}
              </div>
            ))}
            {filteredStores.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No stores found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
