/* auth.jsx — sign in / sign up modal */

const { useState: aUseState } = React;

function AuthModal({ mode: initialMode = 'signup', onClose, onAuthed }) {
  const [mode, setMode] = aUseState(initialMode); // signup | login | forgot
  const [email, setEmail] = aUseState('');
  const [password, setPassword] = aUseState('');
  const [name, setName] = aUseState('');
  const [step, setStep] = aUseState('form'); // form | verifying | done
  const [err, setErr] = aUseState('');

  function submit(e) {
    e.preventDefault();
    setErr('');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('Need a valid email'); return; }
    if (mode !== 'forgot' && password.length < 6) { setErr('Password needs at least 6 chars'); return; }
    if (mode === 'signup' && !name) { setErr('What should we call you?'); return; }

    setStep('verifying');
    setTimeout(() => {
      setStep('done');
      setTimeout(() => {
        if (mode === 'forgot') {
          onClose();
        } else {
          onAuthed({ email, name: name || email.split('@')[0] });
        }
      }, 800);
    }, 1100);
  }

  function googleAuth() {
    setStep('verifying');
    setTimeout(() => {
      setStep('done');
      setTimeout(() => onAuthed({ email: 'creator@gmail.com', name: 'Aanya' }), 700);
    }, 900);
  }

  const isForgot = mode === 'forgot';
  const isSignup = mode === 'signup';

  return (
    <div className="modal-back" onClick={(e) => { if (e.target.className === 'modal-back') onClose(); }}>
      <div
        style={{
          width: '100%', maxWidth: 440,
          background: 'rgba(20,17,15,0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 24,
          padding: 36,
          position: 'relative',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          animation: 'modal-in 0.35s cubic-bezier(.22,1,.36,1)'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--muted)',
            display: 'grid', placeItems: 'center', cursor: 'pointer'
          }}
          aria-label="Close"
        >
          <Icon.close />
        </button>

        {step === 'form' && (
          <>
            <div style={{ marginBottom: 28 }}>
              <Logo size={32} />
            </div>
            <h2 style={{
              fontFamily: 'var(--display)', fontSize: 30, fontWeight: 700,
              letterSpacing: '-0.025em', margin: '0 0 8px', color: '#fff', lineHeight: 1.1,
            }}>
              {isForgot ? 'Reset your password' : isSignup ? 'Make an account in 12 seconds' : 'Welcome back'}
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 14.5, margin: '0 0 24px', lineHeight: 1.5 }}>
              {isForgot
                ? 'We’ll send a reset link to your inbox.'
                : isSignup
                ? '5 free cutouts every day. No card. No spam. Promise.'
                : 'Same email you signed up with.'}
            </p>

            {!isForgot && (
              <>
                <button
                  type="button"
                  onClick={googleAuth}
                  style={{
                    width: '100%', padding: '12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 14, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    cursor: 'pointer', marginBottom: 18,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                  <Icon.google /> Continue with Google
                </button>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18,
                  fontSize: 11.5, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '0.12em'
                }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                  or email
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                </div>
              </>
            )}

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {isSignup && (
                <Field label="Your name" type="text" value={name} onChange={setName} placeholder="Anaya" />
              )}
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@studio.com" />
              {!isForgot && (
                <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
              )}

              {err && (
                <div style={{
                  padding: '8px 12px', borderRadius: 10,
                  background: 'rgba(248,113,113,0.10)',
                  border: '1px solid rgba(248,113,113,0.3)',
                  color: 'var(--rose)', fontSize: 13
                }}>{err}</div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 6 }}>
                {isForgot ? 'Send reset link' : isSignup ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <div style={{
              textAlign: 'center', marginTop: 20, fontSize: 13.5, color: 'var(--muted)'
            }}>
              {isSignup ? (
                <>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }} className="dl-link">Sign in</a></>
              ) : isForgot ? (
                <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }} className="dl-link">Back to sign in</a>
              ) : (
                <>
                  No account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); }} className="dl-link">Make one</a>
                  <div style={{ marginTop: 6 }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setMode('forgot'); }} className="dl-link">Forgot password?</a>
                  </div>
                </>
              )}
            </div>

            {isSignup && (
              <p style={{
                fontSize: 11.5, color: 'var(--muted-2)', textAlign: 'center',
                marginTop: 20, lineHeight: 1.5,
              }}>
                By creating an account you agree to our <a href="#" className="dl-link">terms</a> and <a href="#" className="dl-link">privacy policy</a>.
              </p>
            )}
          </>
        )}

        {step === 'verifying' && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '32px 0', gap: 18
          }}>
            <div className="spinner" />
            <div style={{ fontFamily: 'var(--display)', fontSize: 18, color: '#fff' }}>
              {mode === 'signup' ? 'Setting up your account…' : mode === 'forgot' ? 'Sending link…' : 'Signing you in…'}
            </div>
          </div>
        )}

        {step === 'done' && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '32px 0', gap: 18, textAlign: 'center'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 99,
              background: 'var(--grad)',
              display: 'grid', placeItems: 'center',
              color: '#fff',
              boxShadow: '0 0 40px rgba(236,72,153,0.45)',
              animation: 'pop 0.5s cubic-bezier(.34,1.56,.64,1)'
            }}>
              <Icon.check style={{ width: 28, height: 28 }} />
            </div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 700, color: '#fff' }}>
              {mode === 'forgot' ? 'Check your inbox' : 'You’re in 🎉'}
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>
              {mode === 'forgot' ? 'Reset link sent to ' + email : 'Taking you to the workspace…'}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes pop {
          0% { transform: scale(0); }
          70% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }) {
  const [focused, setFocused] = aUseState(false);
  return (
    <label style={{ display: 'block', position: 'relative' }}>
      <span style={{
        position: 'absolute',
        left: 14,
        top: focused || value ? 6 : 16,
        fontSize: focused || value ? 10.5 : 14,
        color: focused ? 'var(--orange-2)' : 'var(--muted)',
        letterSpacing: focused || value ? '0.05em' : '0',
        textTransform: focused || value ? 'uppercase' : 'none',
        pointerEvents: 'none',
        transition: 'all 0.2s cubic-bezier(.22,1,.36,1)',
        fontWeight: focused || value ? 600 : 400,
      }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ''}
        style={{
          width: '100%',
          padding: '22px 14px 10px',
          fontSize: 15,
          fontFamily: 'var(--body)',
          color: '#fff',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid ' + (focused ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.10)'),
          borderRadius: 12,
          outline: 'none',
          transition: 'border-color 0.2s, background 0.2s',
        }}
      />
    </label>
  );
}

Object.assign(window, { AuthModal });
