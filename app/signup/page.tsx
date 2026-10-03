"use client";

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push('/complete-profile');
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ marginBottom: '64px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Sign up</h1>
        <p style={{ color: 'var(--text-muted)' }}>Create a new account to continue.</p>
      </div>

      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
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
            {loading ? 'Signing up...' : 'Create account'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Already have an account? <span style={{ color: 'var(--text)', fontWeight: 600 }}>Log in</span>
        </Link>
      </div>
    </div>
  );
}
