"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, PlusSquare, User } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();
        
      if (!profile) {
        router.push('/complete-profile');
        return;
      }
      
      setLoading(false);
    };
    
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--background)' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid var(--border)', borderTopColor: 'var(--text)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  const tabs = [
    { name: 'Find', path: '/', icon: Search },
    { name: 'Add', path: '/add-item', icon: PlusSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '70px' }}>
        {children}
      </main>
      
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        zIndex: 40
      }}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <Link 
              key={tab.path}
              href={tab.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                color: isActive ? 'var(--text)' : 'var(--text-muted)'
              }}
            >
              <Icon size={24} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
