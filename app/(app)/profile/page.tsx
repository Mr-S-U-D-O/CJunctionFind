"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Profile } from '../../../lib/types';
import { useRouter } from 'next/navigation';
import { LogOut, Store, User as UserIcon, BadgeCheck } from 'lucide-react';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      setProfile(data as Profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut();
      router.replace('/login');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--background)' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid var(--border)', borderTopColor: 'var(--text)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--background)' }}>
      <div style={{ padding: '16px 20px', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.8px' }}>Profile</h1>
      </div>
      
      <div style={{ padding: '32px 20px 24px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 150px)' }}>
        
        <div style={{ alignItems: 'center', marginBottom: '40px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--background)' }}>
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: '4px' }}>
            {profile?.full_name || 'Store Associate'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Primary Store: {profile?.primary_store || 'Unassigned'}
          </p>
        </div>

        <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', marginLeft: '4px' }}>Account Information</h3>
        
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BadgeCheck size={20} color="var(--text-muted)" style={{ marginRight: '12px' }} />
              <span style={{ fontSize: '15px', fontWeight: 500 }}>Employee Number</span>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 600 }}>{profile?.employee_number || 'N/A'}</span>
          </div>
          
          <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0 16px' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Store size={20} color="var(--text-muted)" style={{ marginRight: '12px' }} />
              <span style={{ fontSize: '15px', fontWeight: 500 }}>Primary Store</span>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 600 }}>{profile?.primary_store || 'N/A'}</span>
          </div>

        </div>

        <div style={{ flex: 1 }} />

        <button 
          onClick={handleSignOut}
          style={{ 
            marginTop: '40px',
            display: 'flex', 
            height: '52px', 
            backgroundColor: '#FEF2F2', 
            border: '1px solid #FECACA', 
            borderRadius: '12px', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <LogOut size={20} color="var(--error)" style={{ marginRight: '8px' }} />
          <span style={{ fontSize: '16px', color: 'var(--error)', fontWeight: 700 }}>Sign out</span>
        </button>
      </div>
    </div>
  );
}
