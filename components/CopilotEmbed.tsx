import { useEffect, useRef, useState } from 'react';

interface Props {
  ssoToken: string;
  userName: string;
  userEmail: string;
}

interface UserContext {
  userName: string;
  userEmail: string;
  userId: string;
  userRole: string;
  firstName: string;
  lastName: string;
}

interface TokenResponse {
  directLineToken: string;
  conversationId?: string;
  userContext: UserContext;
}

export default function CopilotEmbed({ ssoToken, userName, userEmail }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let cleanup: (() => void) | undefined;

    async function init() {
      try {
        // 1. Exchange SSO token for Direct Line token (server-side validation)
        setStatus('loading');
        const res = await fetch('/api/copilot-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ssoToken }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to get Copilot token');
        }

        const { directLineToken, userContext }: TokenResponse = await res.json();

        if (!mountedRef.current) return;

        // 2. Dynamically load botframework-webchat (large bundle — lazy load)
        const WebChat = await import('botframework-webchat');
        if (!mountedRef.current) return;

        const { createDirectLine, createStore, renderWebChat } = WebChat;

        // 3. Create Direct Line connection
        const directLine = createDirectLine({ token: directLineToken });

        // 4. Create store with middleware to send user context on connect
        const store = createStore(
          {},
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ({ dispatch }: { dispatch: (action: any) => void }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (next: (action: any) => void) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (action: any) => {
                if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
                  // Send startConversation event with user context
                  dispatch({
                    type: 'WEB_CHAT/SEND_EVENT',
                    payload: {
                      name: 'startConversation',
                      value: {
                        userName: userContext.userName,
                        userEmail: userContext.userEmail,
                        userId: userContext.userId,
                        userRole: userContext.userRole,
                        firstName: userContext.firstName,
                        lastName: userContext.lastName,
                      },
                    },
                  });
                }
                return next(action);
              }
        );

        if (!mountedRef.current || !containerRef.current) return;

        // 5. Render Web Chat
        renderWebChat(
          {
            directLine,
            store,
            styleOptions: {
              backgroundColor: '#f9fafb',
              bubbleBackground: '#ffffff',
              bubbleBorderRadius: 12,
              bubbleBorderWidth: 1,
              bubbleBorderColor: '#e5e7eb',
              bubbleFromUserBackground: '#6366f1',
              bubbleFromUserBorderRadius: 12,
              bubbleFromUserTextColor: '#ffffff',
              botAvatarInitials: 'AI',
              userAvatarInitials: userContext.firstName?.[0]?.toUpperCase() || 'U',
              primaryFont: "'Inter', -apple-system, sans-serif",
              fontSize: 14,
              sendBoxBackground: '#ffffff',
              sendBoxBorderTop: '1px solid #e5e7eb',
              suggestedActionBorderRadius: 8,
              suggestedActionBorderColor: '#6366f1',
              suggestedActionTextColor: '#6366f1',
              suggestedActionBackground: '#ffffff',
              suggestedActionBackgroundColorOnHover: '#eef2ff',
            },
          },
          containerRef.current
        );

        if (mountedRef.current) {
          setStatus('ready');
        }

        cleanup = () => {
          // Direct Line cleanup
          if (directLine && typeof directLine.end === 'function') {
            directLine.end();
          }
        };
      } catch (err: unknown) {
        if (mountedRef.current) {
          setErrorMsg(err instanceof Error ? err.message : 'Failed to load chat');
          setStatus('error');
        }
      }
    }

    init();

    return () => {
      mountedRef.current = false;
      cleanup?.();
    };
  }, [ssoToken, userName, userEmail]);

  return (
    <div className="copilot-wrapper">
      {status === 'loading' && (
        <div className="chat-loading">
          <div className="spinner" />
          <p>Connecting to AI Assistant…</p>
        </div>
      )}
      {status === 'error' && (
        <div className="chat-error">
          <p>⚠️ Could not connect to the AI Assistant.</p>
          <p className="chat-error-detail">{errorMsg}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
      <div
        ref={containerRef}
        className="webchat-container"
        style={{ display: status === 'ready' ? 'flex' : 'none' }}
      />
    </div>
  );
}
