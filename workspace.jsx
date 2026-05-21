/* workspace.jsx — authenticated upload workspace */

const { useState: wUseState, useEffect: wUseEffect } = React;

function Workspace({ user, credits, onUseCredit, onUpgrade }) {
  const [history, setHistory] = wUseState(() => {
    try {
      const stored = localStorage.getItem('snapcut_history');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [activeNav, setActiveNav] = wUseState('upload');

  // Persist history to localStorage whenever it changes
  wUseEffect(() => {
    try {
      localStorage.setItem('snapcut_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  function addToHistory(item) {
    const entry = {
      id: Date.now(),
      name: item.file?.name || 'untitled.png',
      resultUrl: item.resultUrl,   // Cloudinary URL — permanent, survives refresh
      at: new Date().toISOString(),
    };
    setHistory((h) => [entry, ...h].slice(0, 100));
    onUseCredit();
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <Sidebar
        user={user}
        credits={credits}
        active={activeNav}
        onSelect={setActiveNav}
        onUpgrade={onUpgrade}
      />
      <div style={{ flex: 1, padding: '32px 36px', minWidth: 0 }}>
        {activeNav === 'upload' && (
          <UploadView user={user} credits={credits} onComplete={addToHistory} history={history} />
        )}
        {activeNav === 'history' && <HistoryView history={history} onClear={() => setHistory([])} />}
        {activeNav === 'billing' && <BillingView credits={credits} onUpgrade={onUpgrade} />}
        {activeNav === 'settings' && <SettingsView user={user} />}
      </div>
    </div>
  );
}

/* ============================ Sidebar ============================ */
function Sidebar({ user, credits, active, onSelect, onUpgrade }) {
  const items = [
    { id: 'upload',   label: 'Upload',   icon: <Icon.upload /> },
    { id: 'history',  label: 'History',  icon: <Icon.history /> },
    { id: 'billing',  label: 'Billing',  icon: <Icon.credits /> },
    { id: 'settings', label: 'Settings', icon: <Icon.settings /> },
  ];
  return (
    <aside className="ws-sidebar">
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '6px 4px 18px',
        borderBottom: '1px solid var(--line)', marginBottom: 4
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 99,
          background: 'var(--grad)',
          display: 'grid', placeItems: 'center',
          color: '#fff', fontWeight: 700, fontSize: 15,
          fontFamily: 'var(--display)',
        }}>
          {(user?.name || 'A')[0].toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{user?.name || 'Creator'}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email || ''}
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onSelect(it.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px',
              background: active === it.id ? 'rgba(249,115,22,0.10)' : 'transparent',
              color: active === it.id ? '#fff' : 'var(--text-2)',
              border: '1px solid ' + (active === it.id ? 'rgba(249,115,22,0.25)' : 'transparent'),
              borderRadius: 10,
              fontSize: 14, fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'left',
            }}
          >
            <span style={{ color: active === it.id ? 'var(--orange-2)' : 'var(--muted)' }}>{it.icon}</span>
            {it.label}
          </button>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Credit ring */}
      <CreditRing credits={credits} onUpgrade={onUpgrade} />
    </aside>
  );
}

function CreditRing({ credits, onUpgrade }) {
  const total = 5;
  const used = total - credits;
  const pct = (used / total) * 100;
  const isLow = credits <= 1;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid var(--line)',
      borderRadius: 16,
      padding: 18,
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ position: 'relative', width: 56, height: 56 }}>
          <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
            <circle cx="28" cy="28" r="24" fill="none"
                    stroke="url(#creditGrad)" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 24}
                    strokeDashoffset={2 * Math.PI * 24 * (1 - pct / 100)} />
            <defs>
              <linearGradient id="creditGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
            fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: '#fff'
          }}>{credits}</div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Free plan</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
            {credits}/{total} cutouts left today
          </div>
        </div>
      </div>
      <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={onUpgrade}>
        {isLow ? 'Out of credits — go Pro' : 'Upgrade for unlimited'}
      </button>
    </div>
  );
}

/* ============================ Upload View ============================ */
function UploadView({ user, credits, onComplete, history }) {
  const outOfCredits = credits <= 0;
  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--display)', fontSize: 36, fontWeight: 700,
          letterSpacing: '-0.03em', margin: '0 0 8px', color: '#fff'
        }}>
          Drop a photo, {user?.name?.split(' ')[0] || 'friend'}.
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15.5, margin: 0 }}>
          {outOfCredits
            ? <>You’ve used all 5 free cutouts today. <a href="#" className="dl-link">Upgrade to Pro</a> for unlimited.</>
            : <>You have <span className="t-mono" style={{ color: '#fff' }}>{credits}</span> free cutouts left today.</>}
        </p>
      </div>

      <Card3D tilt={0.05} lift={2} style={{ padding: 0, borderRadius: 24, opacity: outOfCredits ? 0.5 : 1, pointerEvents: outOfCredits ? 'none' : 'auto' }}>
        <UploadZone onComplete={onComplete} />
      </Card3D>

      <div style={{ marginTop: 40 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18
        }}>
          <h3 style={{
            fontFamily: 'var(--display)', fontSize: 20, fontWeight: 700,
            letterSpacing: '-0.02em', margin: 0, color: '#fff'
          }}>
            Recent
          </h3>
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Saved locally · persists across sessions</span>
        </div>
        {history.length === 0 ? (
          <EmptyHistory />
        ) : (
          <HistoryGrid items={history.slice(0, 6)} compact />
        )}
      </div>
    </div>
  );
}

function EmptyHistory() {
  return (
    <div style={{
      padding: '40px 24px',
      borderRadius: 16,
      border: '1px dashed rgba(255,255,255,0.10)',
      textAlign: 'center',
      color: 'var(--muted)',
      fontSize: 14,
    }}>
      <div style={{
        width: 48, height: 48, margin: '0 auto 14px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--line)',
        display: 'grid', placeItems: 'center',
        color: 'var(--muted-2)'
      }}>
        <Icon.image />
      </div>
      Nothing yet. Your cutouts will appear here after your first background removal.
    </div>
  );
}

/* ============================ History grid ============================ */
function HistoryGrid({ items, compact }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: 14,
    }}>
      {items.map((it) => <HistoryCard key={it.id} item={it} />)}
    </div>
  );
}

function HistoryCard({ item }) {
  const when = (() => {
    const d = new Date(item.at);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return d.toLocaleDateString();
  })();
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--line)',
      borderRadius: 14,
      overflow: 'hidden',
      transition: 'border-color 0.2s, transform 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'var(--line)';
      e.currentTarget.style.transform = 'none';
    }}>
      <div className="checker" style={{ aspectRatio: '1 / 1', position: 'relative' }}>
        {item.resultUrl && <img src={item.resultUrl} alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
      </div>
      <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 12.5, color: '#fff', fontWeight: 500,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>{item.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted-2)' }}>{when}</div>
        </div>
        <button
          className="btn btn-icon"
          style={{ width: 28, height: 28, flexShrink: 0 }}
          onClick={async (e) => {
            e.stopPropagation();
            const blob = await fetch(item.resultUrl).then((r) => r.blob());
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = item.name.replace(/\.[^.]+$/, '') + '-cutout.png';
            a.click();
            URL.revokeObjectURL(a.href);
          }}
        >
          <Icon.download style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}

/* ============================ History View ============================ */
function HistoryView({ history, onClear }) {
  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--display)', fontSize: 32, fontWeight: 700,
            letterSpacing: '-0.03em', margin: '0 0 6px', color: '#fff'
          }}>History</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
            {history.length === 0
              ? 'No cutouts yet — upload an image to get started.'
              : `${history.length} cutout${history.length === 1 ? '' : 's'} saved · stored locally in your browser`}
          </p>
        </div>
        {history.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={onClear}>
            <Icon.trash /> Clear all
          </button>
        )}
      </div>
      <div style={{ marginTop: 24 }}>
        {history.length === 0 ? <EmptyHistory /> : <HistoryGrid items={history} />}
      </div>
    </div>
  );
}

/* ============================ Billing View ============================ */
function BillingView({ credits, onUpgrade }) {
  return (
    <div style={{ maxWidth: 860 }}>
      <h1 style={{
        fontFamily: 'var(--display)', fontSize: 32, fontWeight: 700,
        letterSpacing: '-0.03em', margin: '0 0 8px', color: '#fff'
      }}>Billing</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 28px' }}>
        Current plan, usage, and a couple of upgrade routes.
      </p>

      {/* Current plan card */}
      <Card3D tilt={0.05} style={{ padding: 28, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 18 }}>
          <div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Current plan
            </div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 700, color: '#fff', margin: '6px 0' }}>
              Free
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>
              {credits}/5 cutouts left today · resets at midnight
            </div>
          </div>
          <button className="btn btn-primary" onClick={onUpgrade}>
            Upgrade to Pro · ₹299/mo
          </button>
        </div>
      </Card3D>

      {/* Upgrade options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { name: 'Pro Monthly', price: '₹299', sub: 'unlimited cutouts', highlight: true },
          { name: '50 Credits',  price: '₹149', sub: 'one-time pack' },
          { name: '200 Credits', price: '₹449', sub: 'one-time pack' },
          { name: '500 Credits', price: '₹899', sub: 'one-time pack' },
        ].map((p) => (
          <div key={p.name} style={{
            padding: 20,
            background: p.highlight ? 'linear-gradient(135deg, rgba(249,115,22,0.10), rgba(236,72,153,0.10))' : 'rgba(255,255,255,0.03)',
            border: '1px solid ' + (p.highlight ? 'rgba(249,115,22,0.30)' : 'var(--line)'),
            borderRadius: 16
          }}>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{p.name}</div>
            <div className="stat-num" style={{ fontSize: 30, color: '#fff', margin: '6px 0 2px' }}>{p.price}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.sub}</div>
            <button className={`btn ${p.highlight ? 'btn-primary' : 'btn-secondary'} btn-sm`} style={{ width: '100%', marginTop: 14 }}>
              {p.highlight ? 'Upgrade' : 'Buy'}
            </button>
          </div>
        ))}
      </div>

      {/* Usage chart */}
      <Card3D tilt={0.04} style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700, margin: 0, color: '#fff' }}>
            Usage this week
          </h3>
          <span className="t-mono" style={{ fontSize: 13, color: 'var(--muted)' }}>14 / 35</span>
        </div>
        <MiniBarChart data={[2, 5, 3, 4, 0, 0, 0]} labels={['M', 'T', 'W', 'T', 'F', 'S', 'S']} max={5} />
      </Card3D>
    </div>
  );
}

function MiniBarChart({ data, labels, max }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 140 }}>
      {data.map((v, i) => {
        const pct = (v / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: '100%', height: 110, display: 'flex', alignItems: 'flex-end' }}>
              <div style={{
                width: '100%',
                height: `${pct}%`,
                background: v > 0 ? 'linear-gradient(180deg, #fb923c, #ec4899)' : 'rgba(255,255,255,0.04)',
                borderRadius: 6,
                boxShadow: v > 0 ? '0 0 12px rgba(249,115,22,0.3)' : 'none',
                transition: 'height 0.6s cubic-bezier(.22,1,.36,1)',
              }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ============================ Settings View ============================ */
function SettingsView({ user }) {
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{
        fontFamily: 'var(--display)', fontSize: 32, fontWeight: 700,
        letterSpacing: '-0.03em', margin: '0 0 8px', color: '#fff'
      }}>Settings</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 28px' }}>
        Account, defaults, danger zone.
      </p>

      <Card3D tilt={0.04} style={{ padding: 28, marginBottom: 14 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', color: '#fff' }}>Account</h3>
        <SettingRow label="Name" value={user?.name || '—'} action="Edit" />
        <SettingRow label="Email" value={user?.email || '—'} action="Change" />
        <SettingRow label="Password" value="••••••••" action="Update" />
      </Card3D>

      <Card3D tilt={0.04} style={{ padding: 28, marginBottom: 14 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', color: '#fff' }}>Defaults</h3>
        <SettingRow label="Output format" value="PNG (transparent)" action="Change" />
        <SettingRow label="Auto-download" value="On" action="Toggle" />
        <SettingRow label="Email me when bulk job finishes" value="Off" action="Toggle" />
      </Card3D>

      <Card3D tilt={0.04} style={{ padding: 28, border: '1px solid rgba(248,113,113,0.25)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px', color: 'var(--rose)' }}>Danger zone</h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 16px' }}>
          Deleting your account wipes everything. Photos, history, credits. Forever.
        </p>
        <button style={{
          padding: '10px 18px',
          background: 'rgba(248,113,113,0.10)',
          border: '1px solid rgba(248,113,113,0.4)',
          color: 'var(--rose)',
          fontSize: 13.5, fontWeight: 600,
          borderRadius: 10, cursor: 'pointer',
        }}>Delete account</button>
      </Card3D>
    </div>
  );
}

function SettingRow({ label, value, action }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 0', borderBottom: '1px solid var(--line)'
    }}>
      <div>
        <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{value}</div>
      </div>
      <button className="btn btn-ghost btn-sm">{action}</button>
    </div>
  );
}

Object.assign(window, { Workspace });
