/* shared.jsx — Card3D, hooks, NavBar, Logo, Icons, helpers */

const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } = React;

/* ============================ Hooks ============================ */
function useReducedMotion() {
  const [r, setR] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const f = () => setR(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return r;
}

function useInView(opts = { threshold: 0.15, once: true }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setInView(true);
          if (opts.once) obs.disconnect();
        } else if (!opts.once) {
          setInView(false);
        }
      });
    }, { threshold: opts.threshold, rootMargin: '0px 0px -10% 0px' });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function useScrolled(threshold = 60) {
  const [s, setS] = useState(false);
  useEffect(() => {
    const f = () => setS(window.scrollY > threshold);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, [threshold]);
  return s;
}

/* ============================ Card3D ============================ */
function Card3D({ children, className = '', tilt = 0.16, lift = 8, disabled = false, style, ...rest }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(false);

  const onMove = (e) => {
    if (disabled || reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    const rx = (my - 50) * -tilt;
    const ry = (mx - 50) * tilt;
    ref.current.style.setProperty('--mx', `${mx}%`);
    ref.current.style.setProperty('--my', `${my}%`);
    ref.current.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${lift}px)`;
  };
  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(1100px) rotateX(0) rotateY(0) translateZ(0)';
    setHover(false);
  };
  return (
    <div
      ref={ref}
      className={`card3d ${hover ? 'is-hover' : ''} ${className}`}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={onLeave}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ============================ FadeIn ============================ */
function FadeIn({ children, delay = 0, as = 'div', className = '', style, ...rest }) {
  const [ref, inView] = useInView({ threshold: 0.1, once: true });
  const Tag = as;
  return (
    <Tag
      ref={ref}
      className={`fade-in ${inView ? 'visible' : ''} ${className}`}
      style={{ ...style, transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ============================ Logo / Icons ============================ */
function Logo({ size = 28 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="lg-snap" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="28" height="28" rx="9" fill="url(#lg-snap)" />
        {/* Scissor / cut motif */}
        <path d="M10 10 L22 22 M22 10 L10 22"
              stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.95" />
        <circle cx="10" cy="10" r="2.4" fill="#0c0a09" stroke="#fff" strokeWidth="1.6" />
        <circle cx="10" cy="22" r="2.4" fill="#0c0a09" stroke="#fff" strokeWidth="1.6" />
      </svg>
      <span style={{
        fontFamily: 'var(--display)', fontWeight: 800, fontSize: 18,
        letterSpacing: '-0.02em', color: '#fff'
      }}>
        snapcut<span style={{ color: 'var(--orange-2)' }}>.</span>
      </span>
    </div>
  );
}

/* Inline SVG icon helpers */
const Icon = {
  upload: (p) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 16V4M5 11l7-7 7 7M4 20h16" />
    </svg>
  ),
  download: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 4v12M5 13l7 7 7-7M4 20h16" />
    </svg>
  ),
  bolt: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  ),
  target: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  box: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5M12 13v9" />
    </svg>
  ),
  lock: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
  arrowRight: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  ),
  sparkle: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />
    </svg>
  ),
  layers: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5" />
    </svg>
  ),
  scissor: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4L8.5 15.5M8.5 8.5L20 20M14 12l6 0" />
    </svg>
  ),
  wand: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M15 4l5 5L8 21l-5 1 1-5L15 4z" /><path d="M14 5l5 5" />
    </svg>
  ),
  zap: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  ),
  shield: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3l8 4v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
    </svg>
  ),
  ruler: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 17L17 3l4 4L7 21l-4-4z" />
      <path d="M7 13l2 2M11 9l2 2M15 5l2 2" />
    </svg>
  ),
  api: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M8 4L3 12l5 8M16 4l5 8-5 8M14 4l-4 16" />
    </svg>
  ),
  globe: (p) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </svg>
  ),
  close: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  google: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" {...p}>
      <path fill="#fff" d="M21.35 11.1H12v2.8h5.35c-.23 1.4-1.7 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.57-2.46C16.78 3.7 14.6 2.7 12 2.7 6.93 2.7 2.85 6.77 2.85 11.85S6.93 21 12 21c6.92 0 9.15-4.85 9.15-7.32 0-.5-.05-.95-.13-1.58z" />
    </svg>
  ),
  history: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 12a9 9 0 109-9 9 9 0 00-7.5 4M3 4v4h4M12 8v4l3 2" />
    </svg>
  ),
  home: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 11l9-8 9 8v10a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2V11z" />
    </svg>
  ),
  credits: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M9 9.5C9.5 7.5 14.5 7.5 14.5 10c0 2-3 2-3 4M11.5 17h.01" />
    </svg>
  ),
  settings: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1.03 1.56V21a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1.11-1.56 1.7 1.7 0 00-1.87.34l-.06.06A2 2 0 113.14 16.92l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.56-1.03H1.9a2 2 0 110-4h.09A1.7 1.7 0 003.54 8.85a1.7 1.7 0 00-.34-1.87L3.14 6.92a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34h.02a1.7 1.7 0 001.03-1.56V2.9a2 2 0 114 0v.09a1.7 1.7 0 001.03 1.56 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87v.02a1.7 1.7 0 001.56 1.03H21a2 2 0 110 4h-.09a1.7 1.7 0 00-1.56 1.03z"/>
    </svg>
  ),
  image: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  trash: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14"/>
    </svg>
  ),
  refresh: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5"/>
    </svg>
  ),
};

/* ============================ NavBar ============================ */
function NavBar({ onGoTo, currentView, onOpenAuth, user, credits }) {
  const scrolled = useScrolled(40);
  return (
    <nav className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-inner">
        <button
          onClick={() => onGoTo('landing')}
          style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
          aria-label="snapcut home"
        >
          <Logo />
        </button>

        {currentView === 'landing' && (
          <div className="nav-links">
            <a className="nav-link" href="#features">Features</a>
            <a className="nav-link" href="#how">How it works</a>
            <a className="nav-link" href="#pricing">Pricing</a>
            <a className="nav-link" href="#proof">Customers</a>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {user ? (
            <>
              <span className="chip" title="Credits remaining">
                <span className="chip-dot" />
                <span className="t-mono" style={{ color: '#fff' }}>{credits}</span>
                <span style={{ color: 'var(--muted)' }}>left today</span>
              </span>
              {currentView !== 'workspace' && (
                <button className="btn btn-primary btn-sm" onClick={() => onGoTo('workspace')}>
                  Open workspace
                </button>
              )}
              {currentView === 'workspace' && (
                <button className="btn btn-ghost btn-sm" onClick={() => onGoTo('landing')}>
                  Back to site
                </button>
              )}
            </>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => onOpenAuth('login')}>
                Sign in
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => onOpenAuth('signup')}>
                Try free
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ============================ Toast ============================ */
const ToastCtx = createContext({ push: () => {} });
function useToast() { return useContext(ToastCtx); }

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = (text, kind = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div style={{
        position: 'fixed', right: 20, bottom: 20, zIndex: 200,
        display: 'flex', flexDirection: 'column', gap: 10
      }}>
        {toasts.map((t) => (
          <div key={t.id}
               style={{
                 padding: '12px 16px',
                 borderRadius: 12,
                 background: 'rgba(28,25,23,0.95)',
                 border: '1px solid rgba(255,255,255,0.12)',
                 color: '#fff',
                 fontSize: 13.5,
                 boxShadow: '0 18px 36px -10px rgba(0,0,0,0.5)',
                 animation: 'toast-in 0.3s cubic-bezier(.22,1,.36,1)',
                 display: 'flex', alignItems: 'center', gap: 10
               }}>
            <span style={{
              width: 8, height: 8, borderRadius: 99,
              background: t.kind === 'error' ? 'var(--error)' : t.kind === 'success' ? 'var(--success)' : 'var(--orange)',
              boxShadow: '0 0 8px currentColor'
            }} />
            {t.text}
          </div>
        ))}
      </div>
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }`}</style>
    </ToastCtx.Provider>
  );
}

/* Expose to other scripts */
Object.assign(window, {
  Card3D, FadeIn, Logo, Icon, NavBar, ToastProvider, useToast,
  useReducedMotion, useInView, useScrolled,
});
