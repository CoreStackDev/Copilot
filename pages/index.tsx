import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Employee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      sessionStorage.setItem('sso_token', data.token);
      sessionStorage.setItem('user_name', name);
      sessionStorage.setItem('user_email', email);
      router.push('/chat');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>SSO Copilot Demo — Sign In</title></Head>
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: '20px',
      }}>
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '48px 40px',
          width: '100%', maxWidth: '420px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px', background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: '700', color: '#1a1a2e' }}>Welcome back</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>Sign in to access your AI Assistant</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. James Anderson" required
                style={{
                  width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb',
                  borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s', background: '#f9fafb', color: '#111',
                }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="james@company.com" required
                style={{
                  width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb',
                  borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s', background: '#f9fafb', color: '#111',
                }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Role
              </label>
              <select value={role} onChange={e => setRole(e.target.value)}
                style={{
                  width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb',
                  borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  background: '#f9fafb', color: '#111', cursor: 'pointer',
                }}
              >
                <option>Employee</option>
                <option>Manager</option>
                <option>Admin</option>
                <option>Guest</option>
              </select>
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px',
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px', background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px',
                fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s', letterSpacing: '0.3px',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#9ca3af' }}>
            Demo mode — enter any name and email to continue.
          </p>
        </div>
      </div>
    </>
  );
}