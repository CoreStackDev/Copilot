import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const CopilotEmbed = dynamic(() => import('../components/CopilotEmbed'), {
  ssr: false,
  loading: () => (
    <div className="chat-loading">
      <div className="spinner" />
      <p>Loading AI Assistant…</p>
    </div>
  ),
});

interface UserInfo {
  name: string;
  email: string;
  token: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('sso_token');
    const name = sessionStorage.getItem('user_name');
    const email = sessionStorage.getItem('user_email');

    if (!token || !name || !email) {
      router.replace('/');
      return;
    }

    setUser({ name, email, token });
    setReady(true);
  }, [router]);

  function handleSignOut() {
    sessionStorage.clear();
    router.push('/');
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  if (!ready || !user) {
    return (
      <div className="chat-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>AI Assistant — {user.name}</title>
      </Head>
      <div className="chat-layout">
        <header className="chat-header">
          <div className="chat-header-brand">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="#6366f1"/>
              <path d="M14 24C14 18.477 18.477 14 24 14C29.523 14 34 18.477 34 24C34 29.523 29.523 34 24 34C18.477 34 14 29.523 14 24Z" fill="white" fillOpacity="0.2"/>
              <path d="M20 24L23 27L28 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="chat-header-title">AI Assistant</span>
          </div>
          <div className="chat-header-user">
            <div className="user-avatar">{getInitials(user.name)}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <button className="sign-out-btn" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </header>

        <main className="chat-main">
          <CopilotEmbed ssoToken={user.token} userName={user.name} userEmail={user.email} />
        </main>
      </div>
    </>
  );
}
