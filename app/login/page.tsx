"use client";

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ marginBottom: '64px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Log in</h1>
        <p style={{ color: 'var(--text-muted)' }}>Enter your details to continue.</p>
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <input 
              type="email" 
              className="input-base" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoCapitalize="none"
            />
          </div>
          <div>
            <input 
              type="password" 
              className="input-base" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {errorMsg ? (
          <div style={{ padding: '16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
            <p style={{ color: 'var(--error)', fontSize: '14px', fontWeight: 500 }}>• {errorMsg}</p>
          </div>
        ) : null}

        <div style={{ marginTop: '16px' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Continue'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Link href="/signup" style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Don't have an account? <span style={{ color: 'var(--text)', fontWeight: 600 }}>Sign up</span>
        </Link>
      </div>
    </div>
  );
}
