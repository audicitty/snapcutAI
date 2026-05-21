/* app.jsx — root, view routing, auth state */

const { useState: appUseState, useEffect: appUseEffect } = React;

function App() {
  const [view, setView] = appUseState('landing'); // landing | workspace
  const [authOpen, setAuthOpen] = appUseState(false);
  const [authMode, setAuthMode] = appUseState('signup');
  const [user, setUser] = appUseState(() => {
    try {
      const stored = localStorage.getItem('snapcut_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [credits, setCredits] = appUseState(() => {
    try {
      const stored = localStorage.getItem('snapcut_credits');
      return stored ? parseInt(stored, 10) : 5;
    } catch { return 5; }
  });

  appUseEffect(() => {
    if (user) localStorage.setItem('snapcut_user', JSON.stringify(user));
    else localStorage.removeItem('snapcut_user');
  }, [user]);

  appUseEffect(() => {
    localStorage.setItem('snapcut_credits', String(credits));
  }, [credits]);

  function openAuth(mode = 'signup') {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  function handleAuthed(u) {
    setUser(u);
    setAuthOpen(false);
    setView('workspace');
  }

  function goToWorkspace() {
    if (user) setView('workspace');
    else openAuth('signup');
  }

  function useCredit() {
    setCredits((c) => Math.max(0, c - 1));
  }

  function upgrade() {
    // simulate upgrade flow
    if (window.__toast) window.__toast.push('Razorpay checkout would open here', 'info');
    setCredits(999);
  }

  return (
    <ToastProvider>
      <ToastBridge />
      <div className="mesh-bg" />
      <div className="app-root">
        <NavBar
          currentView={view}
          onGoTo={(v) => v === 'workspace' ? goToWorkspace() : setView(v)}
          onOpenAuth={openAuth}
          user={user}
          credits={credits}
        />
        {view === 'landing' && (
          <Landing
            onGetStarted={goToWorkspace}
            onOpenAuth={openAuth}
            user={user}
          />
        )}
        {view === 'workspace' && user && (
          <Workspace
            user={user}
            credits={credits}
            onUseCredit={useCredit}
            onUpgrade={upgrade}
          />
        )}
        {authOpen && (
          <AuthModal
            mode={authMode}
            onClose={() => setAuthOpen(false)}
            onAuthed={handleAuthed}
          />
        )}
      </div>
    </ToastProvider>
  );
}

// Tiny bridge so non-React code can call toasts
function ToastBridge() {
  const toast = useToast();
  appUseEffect(() => { window.__toast = toast; }, [toast]);
  return null;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
