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

  function openRazorpay({ amount, description, onSuccess }) {
    const key = window.SNAPCUT_CONFIG?.RAZORPAY_KEY_ID;
    if (!key || key === 'rzp_test_XXXXXXXXXXXXXXXX') {
      if (window.__toast) window.__toast.push('Add your Razorpay key to config.js to enable payments', 'error');
      return;
    }
    if (!window.Razorpay) {
      if (window.__toast) window.__toast.push('Razorpay failed to load. Check your internet connection.', 'error');
      return;
    }
    const options = {
      key,
      amount,
      currency: 'INR',
      name: 'SnapCut',
      description,
      handler(response) {
        onSuccess(response);
      },
      prefill: user ? { name: user.name, email: user.email } : {},
      theme: { color: '#f97316' },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  function upgrade(billing = 'monthly') {
    if (!user) { openAuth('signup'); return; }
    const amount = billing === 'yearly' ? 249900 : 29900; // paise
    const desc = billing === 'yearly' ? 'Pro Plan — Yearly' : 'Pro Plan — Monthly';
    openRazorpay({
      amount,
      description: desc,
      onSuccess() {
        setCredits(99999);
        if (window.__toast) window.__toast.push('Welcome to Pro! Unlimited cutouts unlocked.', 'success');
        setView('workspace');
      },
    });
  }

  function buyCredits(amount, creditsCount) {
    if (!user) { openAuth('signup'); return; }
    openRazorpay({
      amount: amount * 100,
      description: `${creditsCount} Credits Pack`,
      onSuccess() {
        setCredits((c) => c + creditsCount);
        if (window.__toast) window.__toast.push(`${creditsCount} credits added to your account!`, 'success');
        setView('workspace');
      },
    });
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
            onUpgrade={upgrade}
            onBuyCredits={buyCredits}
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
