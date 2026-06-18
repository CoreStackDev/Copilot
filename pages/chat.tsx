import { useEffect, useState, CSSProperties } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const CopilotEmbed = dynamic(() => import('../components/CopilotEmbed'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '16px' }}>
      <div className='spin-loader' style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#667eea', borderRadius: '50%' }} />
      <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Loading AI Assistant...</p>
    </div>
  ),
});

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem('sso_token');
    const n = sessionStorage.getItem('user_name');
    const em = sessionStorage.getItem('user_email');
    if (!t) { router.replace('/'); return; }
    setToken(t);
    setUser({ name: n || 'User', email: em || '' });
  }, []);

  const handleSignOut = () => { sessionStorage.clear(); router.push('/'); };
  const initials = user?.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const headerStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', flexShrink: 0,
    boxShadow: '0 2px 12px rgba(102,126,234,0.4)',
  };

  const btnStyle: CSSProperties = {
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff', padding: '7px 16px', borderRadius: '8px', fontSize: '13px',
    fontWeight: 600, cursor: 'pointer',
  };

  return (
    <>
      <Head><title>AI Assistant</title></Head>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f3f4f6' }}>
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/>
              </svg>
            </div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '17px' }}>AI Assistant</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{user.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{user.email}</div>
              </div>
            )}
            <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>{initials}</div>
            <button onClick={handleSignOut} style={btnStyle}>Sign out</button>
          </div>
        </header>
        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {token && user && <CopilotEmbed ssoToken={token} userName={user.name} userEmail={user.email} />}
        </main>
      </div>
    </>
  );
}