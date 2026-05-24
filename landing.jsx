/* landing.jsx — full landing page */

const { useState: lUseState, useEffect: lUseEffect, useRef: lUseRef } = React;

function Landing({ onGetStarted, onOpenAuth, user, onUpgrade, onBuyCredits }) {
  return (
    <>
      <Hero onGetStarted={onGetStarted} onOpenAuth={onOpenAuth} user={user} />
      <SocialStrip />
      <LiveDemoStrip />
      <Features />
      <HowItWorks />
      <Pricing onGetStarted={onGetStarted} onUpgrade={onUpgrade} onBuyCredits={onBuyCredits} />
      <Testimonials />
      <StatsBar />
      <FinalCTA onGetStarted={onGetStarted} />
      <Footer />
    </>
  );
}

/* ============================ Hero ============================ */
function Hero({ onGetStarted, onOpenAuth, user }) {
  // Word-by-word reveal for the headline
  const headlineWords = ['Your', 'background', 'is', 'gone.', 'Literally.'];
  return (
    <section style={{ position: 'relative', paddingTop: 60, paddingBottom: 80, overflow: 'visible' }}>
      <div className="container" style={{ position: 'relative' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.05fr)',
          gap: 56,
          alignItems: 'center',
        }} className="hero-grid">
          {/* LEFT: copy */}
          <div>
            <FadeIn delay={50}>
              <div className="chip" style={{ marginBottom: 28 }}>
                <span className="chip-dot" />
                <span style={{ color: 'var(--text)' }}>10,247 cutouts today</span>
                <span style={{ color: 'var(--muted)' }}>and counting</span>
              </div>
            </FadeIn>

            <h1 className="h-display hero-shadow"
                style={{ fontSize: 'clamp(48px, 6.6vw, 84px)', margin: 0, color: '#fff' }}>
              {headlineWords.map((w, i) => (
                <WordReveal key={i} delay={120 + i * 90}>{w}</WordReveal>
              ))}
            </h1>

            <FadeIn delay={700}>
              <p style={{
                fontSize: 18.5, lineHeight: 1.55, color: 'var(--text-2)',
                maxWidth: 540, marginTop: 26, marginBottom: 32
              }}>
                Drop a photo. Get a clean PNG. No Photoshop. No skill.
                No drama. The cutout you needed five minutes ago is two seconds away.
              </p>
            </FadeIn>

            <FadeIn delay={820}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
                <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
                  <Icon.sparkle /> Start cutting — free
                </button>
                <button className="btn btn-secondary btn-lg" onClick={() => {
                  const el = document.getElementById('demo'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}>
                  Watch a 5-second demo
                </button>
              </div>
            </FadeIn>

            <FadeIn delay={920}>
              <div style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap',
                            fontSize: 13, color: 'var(--muted)' }}>
                <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Icon.check style={{ color: 'var(--success)' }} /> 5 free per day
                </span>
                <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Icon.check style={{ color: 'var(--success)' }} /> No credit card
                </span>
                <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Icon.check style={{ color: 'var(--success)' }} /> Photo never stored
                </span>
              </div>
            </FadeIn>
          </div>

          {/* RIGHT: live upload zone surrounded by floating proof cards */}
          <div style={{ position: 'relative', minHeight: 480 }}>
            <FadeIn delay={400}>
              <Card3D tilt={0.10} lift={6} style={{ padding: 0, borderRadius: 28 }}>
                <UploadZone onComplete={() => {}} />
              </Card3D>
            </FadeIn>

            {/* Floating proof cards */}
            <FloatingProof style={{ top: -18, left: -36, animationDelay: '0s' }}>
              <span className="pico"><Icon.bolt style={{ color: 'var(--orange)' }} /></span>
              <div>
                <b>2.1s</b> <small>avg removal</small>
              </div>
            </FloatingProof>
            <FloatingProof style={{ top: 8, right: -28, animationDelay: '1.5s' }}>
              <span className="pico"><Icon.target style={{ color: 'var(--pink)' }} /></span>
              <div>
                <b>99.2%</b> <small>edge accuracy</small>
              </div>
            </FloatingProof>
            <FloatingProof style={{ bottom: 30, left: -44, animationDelay: '3s' }}>
              <span className="pico"><Icon.box style={{ color: 'var(--amber)' }} /></span>
              <div>
                <b>10.3M+</b> <small>cutouts done</small>
              </div>
            </FloatingProof>
            <FloatingProof style={{ bottom: -10, right: -20, animationDelay: '4.5s' }}>
              <span className="pdot" />
              <div>
                <b>0 photos</b> <small>kept on servers</small>
              </div>
            </FloatingProof>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', left: '50%', bottom: 6, transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        color: 'var(--muted-2)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>
        Scroll
        <svg width="14" height="20" viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="1" width="12" height="18" rx="6" />
          <circle cx="7" cy="6" r="1.5" fill="currentColor">
            <animate attributeName="cy" values="6;13;6" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 60px !important; }
        }
      `}</style>
    </section>
  );
}

function WordReveal({ children, delay }) {
  const [v, setV] = lUseState(false);
  lUseEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <span style={{
      display: 'inline-block',
      transform: v ? 'translateY(0) rotateX(0)' : 'translateY(38%) rotateX(90deg)',
      opacity: v ? 1 : 0,
      transition: 'transform 0.7s cubic-bezier(.22,1,.36,1), opacity 0.5s ease',
      transformOrigin: '50% 100%',
      marginRight: '0.25em',
    }}>
      {children}
    </span>
  );
}

function FloatingProof({ children, style }) {
  return <div className="proof" style={style}>{children}</div>;
}

/* ============================ Social strip ============================ */
function SocialStrip() {
  const platforms = ['Etsy', 'Canva', 'Shopify', 'Instagram', 'Notion', 'Figma', 'WhatsApp Business', 'Pinterest'];
  return (
    <section style={{ paddingTop: 30, paddingBottom: 50 }}>
      <div className="container">
        <div style={{ textAlign: 'center', fontSize: 12.5, letterSpacing: '0.16em',
                      textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 22 }}>
          Loved by 10,000+ creators selling on
        </div>
        <div className="marquee">
          <div className="marquee-track">
            {[...platforms, ...platforms].map((p, i) => (
              <span key={i} style={{
                fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22,
                color: 'var(--muted)', letterSpacing: '-0.02em', whiteSpace: 'nowrap',
                opacity: 0.7
              }}>
                {p}
              </span>
            ))}
          </div>
          <div className="marquee-track" aria-hidden="true">
            {[...platforms, ...platforms].map((p, i) => (
              <span key={i} style={{
                fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22,
                color: 'var(--muted)', letterSpacing: '-0.02em', whiteSpace: 'nowrap',
                opacity: 0.7
              }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ Live Demo Strip ============================ */
function LiveDemoStrip() {
  const [activeIdx, setActiveIdx] = lUseState(0);
  return (
    <section id="demo" className="section" style={{ paddingTop: 40 }}>
      <div className="container">
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end',
                        marginBottom: 32, flexWrap: 'wrap', gap: 18 }}>
            <div>
              <span className="chip"><span className="chip-dot" />Live demo</span>
              <h2 className="h-section" style={{ fontSize: 'clamp(34px, 4.5vw, 52px)', margin: '14px 0 0' }}>
                See it work on a real <span className="t-grad">product photo</span>
              </h2>
              <p style={{ color: 'var(--muted)', maxWidth: 520, marginTop: 12, fontSize: 16 }}>
                Drag the slider. The PNG on the right is fully transparent — drop it on any background.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {SAMPLE_IMAGES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`btn ${i === activeIdx ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {s.name.replace(/\.jpg$/, '')}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={150}>
          <Card3D tilt={0.05} lift={4} style={{ padding: 0, borderRadius: 24 }}>
            <UploadZone
              key={activeIdx}
              initialSampleSrc={SAMPLE_IMAGES[activeIdx].src}
              initialSampleName={SAMPLE_IMAGES[activeIdx].name}
              autoRunSample={true}
              showResultActions={true}
            />
          </Card3D>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================ Features ============================ */
function Features() {
  const items = [
    {
      icon: <Icon.zap style={{ color: 'var(--orange)' }} />,
      title: 'Two seconds, every time',
      body: 'Edges, hair, fuzz, glass — all handled before you blink. Faster than opening Photoshop.',
    },
    {
      icon: <Icon.ruler style={{ color: 'var(--pink)' }} />,
      title: 'Up to 5000×5000px',
      body: 'Hi-res cutouts that print on canvas, t-shirts, packaging. No "premium tier" gate.',
    },
    {
      icon: <Icon.layers style={{ color: 'var(--magenta)' }} />,
      title: 'Bulk drop, bulk cut',
      body: 'Drag 50 product photos in one go. We process them in parallel and zip the PNGs.',
    },
    {
      icon: <Icon.shield style={{ color: 'var(--success)' }} />,
      title: 'Your photos, your photos',
      body: 'Auto-deleted after 24 hours. We never train models on your stuff. Promise in our TOS.',
    },
    {
      icon: <Icon.wand style={{ color: 'var(--amber)' }} />,
      title: 'Smart background swap',
      body: 'Replace the cutout with solid color, blurred studio, or a custom upload. One click.',
    },
    {
      icon: <Icon.api style={{ color: 'var(--rose)' }} />,
      title: 'API for the dev-curious',
      body: 'One POST request, one PNG back. Bake snapcut into your store, app, or workflow.',
    },
  ];
  return (
    <section id="features" className="section">
      <div className="container">
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="chip"><Icon.sparkle style={{ color: 'var(--orange)' }} />Features</span>
            <h2 className="h-section" style={{ fontSize: 'clamp(34px, 4.5vw, 52px)', margin: '14px 0 8px' }}>
              Built for people who <span className="t-grad">just want the PNG</span>
            </h2>
            <p style={{ color: 'var(--muted)', maxWidth: 580, margin: '0 auto', fontSize: 16.5 }}>
              No timeline. No layers. No lasso tool. Just the result.
            </p>
          </div>
        </FadeIn>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 18
        }}>
          {items.map((it, i) => (
            <FadeIn key={i} delay={i * 80}>
              <Card3D tilt={0.18} className="feature-card" style={{ padding: 28, minHeight: 200 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--line)',
                  display: 'grid', placeItems: 'center',
                  marginBottom: 18,
                }}>
                  {it.icon}
                </div>
                <h3 style={{ fontSize: 18.5, fontWeight: 600, letterSpacing: '-0.01em',
                             margin: '0 0 8px', color: '#fff' }}>{it.title}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}>
                  {it.body}
                </p>
              </Card3D>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ How It Works ============================ */
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Drop the photo', body: 'Drag from your desktop, or paste from clipboard. Or pick from a folder. We don’t care.', icon: <Icon.upload /> },
    { n: '02', title: 'We cut, you wait', body: 'About 2 seconds. The progress ring keeps you company. That’s it.', icon: <Icon.scissor /> },
    { n: '03', title: 'Download the PNG', body: 'Transparent, hi-res, ready for Shopify, Etsy, Insta, or wherever you live online.', icon: <Icon.download /> },
  ];
  return (
    <section id="how" className="section" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Subtle ambient blob */}
      <div style={{
        position: 'absolute', left: '50%', top: 80, transform: 'translateX(-50%)',
        width: 900, height: 400, pointerEvents: 'none',
        background: 'radial-gradient(closest-side, rgba(249,115,22,0.10), transparent 70%)',
        filter: 'blur(20px)',
      }} />

      <div className="container" style={{ position: 'relative' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="chip">How it works</span>
            <h2 className="h-section" style={{ fontSize: 'clamp(34px, 4.5vw, 52px)', margin: '14px 0 8px' }}>
              Three steps. <span className="t-grad-soft">Literally three.</span>
            </h2>
          </div>
        </FadeIn>

        <div style={{ position: 'relative' }}>
          {/* connecting line */}
          <div className="how-line" />
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24, position: 'relative', zIndex: 1
          }}>
            {steps.map((s, i) => (
              <FadeIn key={i} delay={i * 150}>
                <Card3D tilt={0.12} style={{ padding: 28, textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 22 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: 'var(--grad)',
                      display: 'grid', placeItems: 'center',
                      color: '#fff',
                      boxShadow: '0 10px 30px -10px rgba(236,72,153,0.5)',
                    }}>
                      {React.cloneElement(s.icon, { width: 22, height: 22 })}
                    </div>
                    <span className="t-mono" style={{
                      color: 'var(--muted-2)', fontSize: 14, letterSpacing: '0.05em'
                    }}>{s.n}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 700,
                               letterSpacing: '-0.02em', margin: '0 0 10px', color: '#fff' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}>
                    {s.body}
                  </p>
                </Card3D>
              </FadeIn>
            ))}
          </div>
        </div>

        <style>{`
          .how-line {
            display: none;
          }
          @media (min-width: 880px) {
            .how-line {
              display: block;
              position: absolute;
              top: 56px; left: 14%; right: 14%;
              height: 1px;
              background: linear-gradient(90deg, transparent, rgba(249,115,22,0.5), rgba(236,72,153,0.5), transparent);
            }
          }
        `}</style>
      </div>
    </section>
  );
}

/* ============================ Credits Modal ============================ */
function CreditsModal({ onClose, onBuyCredits }) {
  const packs = [
    { amount: 149, credits: 50,  label: '50 Cutouts',  badge: '' },
    { amount: 449, credits: 200, label: '200 Cutouts', badge: 'Best value' },
    { amount: 899, credits: 500, label: '500 Cutouts', badge: 'Power pack' },
  ];
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#18181b', border: '1px solid var(--line)',
        borderRadius: 24, padding: '36px 32px', maxWidth: 420, width: '100%',
        position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--muted)', fontSize: 22, lineHeight: 1,
        }}>×</button>

        <h3 style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
          Buy Credits
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>
          Credits never expire. Same quality as Pro.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {packs.map((p) => (
            <button
              key={p.amount}
              onClick={() => { onBuyCredits(p.amount, p.credits); onClose(); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderRadius: 14,
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
                cursor: 'pointer', transition: 'border-color 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--orange)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--line)'}
            >
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>{p.label}</div>
                {p.badge && (
                  <div style={{ fontSize: 11, color: 'var(--orange-2)', marginTop: 2 }}>{p.badge}</div>
                )}
              </div>
              <div style={{
                fontFamily: 'var(--display)', fontSize: 22, fontWeight: 700, color: '#fff'
              }}>₹{p.amount}</div>
            </button>
          ))}
        </div>

        <p style={{ fontSize: 12, color: 'var(--muted-2)', textAlign: 'center', marginTop: 20 }}>
          Secured by Razorpay · All major cards, UPI & wallets accepted
        </p>
      </div>
    </div>
  );
}

/* ============================ Pricing ============================ */
function Pricing({ onGetStarted, onUpgrade, onBuyCredits }) {
  const [billing, setBilling] = lUseState('monthly');
  const [showCreditsModal, setShowCreditsModal] = lUseState(false);

  const tiers = [
    {
      name: 'Free',
      tag: 'For testing the waters',
      price: { monthly: 0, yearly: 0 },
      priceLabel: { monthly: '₹0', yearly: '₹0' },
      sub: { monthly: 'forever', yearly: 'forever' },
      features: [
        '5 cutouts per day',
        'Up to 2000×2000px',
        'Standard speed',
        'Watermark-free PNG',
      ],
      cta: 'Start free',
      highlight: false,
      action: 'free',
    },
    {
      name: 'Pro',
      tag: 'For actual businesses',
      price: { monthly: 299, yearly: 2499 },
      priceLabel: { monthly: '₹299', yearly: '₹2,499' },
      sub: { monthly: 'per month', yearly: 'per year (save 30%)' },
      features: [
        'Unlimited cutouts',
        'Up to 5000×5000px',
        'Bulk drop (50 at a time)',
        'Priority queue (1.4s avg)',
        'Background swap tool',
        'No watermark, ever',
      ],
      cta: 'Go Pro',
      highlight: true,
      action: 'pro',
    },
    {
      name: 'Credits',
      tag: 'No subscription, no commitment',
      price: { monthly: 149, yearly: 149 },
      priceLabel: { monthly: '₹149', yearly: '₹149' },
      sub: { monthly: 'for 50 cutouts', yearly: 'for 50 cutouts' },
      features: [
        '₹149 for 50 cutouts',
        '₹449 for 200 cutouts',
        '₹899 for 500 cutouts',
        'Credits never expire',
        'Same quality as Pro',
      ],
      cta: 'Buy credits',
      highlight: false,
      action: 'credits',
    },
  ];

  function handleTierClick(tier) {
    if (tier.action === 'free') { onGetStarted(); return; }
    if (tier.action === 'pro') { onUpgrade(billing); return; }
    if (tier.action === 'credits') { setShowCreditsModal(true); }
  }

  return (
    <>
      <section id="pricing" className="section">
        <div className="container">
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <span className="chip">Pricing</span>
              <h2 className="h-section" style={{ fontSize: 'clamp(34px, 4.5vw, 52px)', margin: '14px 0 8px' }}>
                Honest pricing. <span className="t-grad">Cancel anytime.</span>
              </h2>
              <p style={{ color: 'var(--muted)', maxWidth: 580, margin: '0 auto 24px', fontSize: 16.5 }}>
                No "contact sales", no annual lock-in, no surprise upsells in the workspace.
              </p>

              {/* Billing toggle */}
              <div style={{
                display: 'inline-flex', padding: 4, borderRadius: 99,
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)'
              }}>
                {['monthly', 'yearly'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBilling(b)}
                    style={{
                      padding: '8px 18px', borderRadius: 99, border: 0, cursor: 'pointer',
                      background: billing === b ? 'var(--grad)' : 'transparent',
                      color: billing === b ? '#fff' : 'var(--muted)',
                      fontSize: 13.5, fontWeight: 600, textTransform: 'capitalize',
                      transition: 'all 0.2s'
                    }}>
                    {b} {b === 'yearly' && <span style={{ fontSize: 11, opacity: 0.85 }}>–30%</span>}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20, alignItems: 'stretch'
          }}>
            {tiers.map((t, i) => (
              <FadeIn key={i} delay={i * 120}>
                <PricingCard tier={t} billing={billing} onClick={() => handleTierClick(t)} />
              </FadeIn>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: 'var(--muted-2)' }}>
            Payments secured by Razorpay · UPI, cards, net banking & wallets accepted
          </p>
        </div>
      </section>

      {showCreditsModal && (
        <CreditsModal
          onClose={() => setShowCreditsModal(false)}
          onBuyCredits={onBuyCredits}
        />
      )}
    </>
  );
}

function PricingCard({ tier, billing, onClick }) {
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {tier.highlight && (
        <>
          {/* glowing gradient border */}
          <div style={{
            position: 'absolute', inset: -1, borderRadius: 22,
            padding: 1.5,
            background: 'var(--grad)',
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
          <div style={{
            position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
            padding: '5px 12px', borderRadius: 99,
            background: 'var(--grad)', color: '#fff',
            fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em',
            textTransform: 'uppercase', zIndex: 2,
            boxShadow: '0 12px 30px -8px rgba(236,72,153,0.55)',
          }}>
            Most popular
          </div>
        </>
      )}
      <Card3D tilt={0.10}
              style={{
                padding: '34px 28px', height: '100%',
                borderRadius: 22,
                display: 'flex', flexDirection: 'column',
                background: tier.highlight ? 'rgba(35,21,30,0.85)' : undefined,
              }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.02em' }}>
          {tier.tag}
        </div>
        <div style={{
          fontFamily: 'var(--display)', fontSize: 22, fontWeight: 700,
          color: '#fff', marginBottom: 18
        }}>
          {tier.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
          <span className="stat-num" style={{ fontSize: 52, lineHeight: 1, color: '#fff' }}>
            {tier.priceLabel[billing]}
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>{tier.sub[billing]}</div>

        <button
          className={`btn ${tier.highlight ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: '100%', marginBottom: 24 }}
          onClick={onClick}
        >
          {tier.cta} <Icon.arrowRight />
        </button>

        <div style={{ height: 1, background: 'var(--line)', marginBottom: 18 }} />

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tier.features.map((f, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start',
                                fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>
              <Icon.check style={{ color: tier.highlight ? 'var(--orange-2)' : 'var(--success)', flexShrink: 0, marginTop: 1, width: 16, height: 16 }} />
              {f}
            </li>
          ))}
        </ul>
      </Card3D>
    </div>
  );
}

/* ============================ Testimonials ============================ */
function Testimonials() {
  const items = [
    {
      quote: 'I run a tiny ceramic shop on Etsy. Used to spend Sunday nights cutting out mugs in Photoshop. Now I do 80 listings before my coffee gets cold.',
      name: 'Anaya R.',
      handle: '@claystudio.in',
      role: 'Ceramic shop owner, Bangalore',
      stars: 5,
    },
    {
      quote: 'Switched from remove.bg because the edges on chiffon and lace were rough. snapcut nails dupatta edges. Took me one upload to be convinced.',
      name: 'Rhea P.',
      handle: '@rheaclothing',
      role: 'Indie clothing brand, Mumbai',
      stars: 5,
    },
    {
      quote: 'I sell handmade jewellery on Instagram. The bulk drop saves me three hours every drop day. Just for that it pays for itself.',
      name: 'Karan M.',
      handle: '@karanmadejewels',
      role: 'Jewellery maker, Delhi',
      stars: 5,
    },
  ];
  return (
    <section id="proof" className="section">
      <div className="container">
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="chip">Customers</span>
            <h2 className="h-section" style={{ fontSize: 'clamp(34px, 4.5vw, 52px)', margin: '14px 0 8px' }}>
              Real shops, <span className="t-grad">real Sundays back.</span>
            </h2>
          </div>
        </FadeIn>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18
        }}>
          {items.map((t, i) => (
            <FadeIn key={i} delay={i * 100}>
              <Card3D tilt={0.13} style={{ padding: 28, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 18 }}>
                  {[...Array(t.stars)].map((_, j) => (
                    <svg key={j} viewBox="0 0 24 24" width="16" height="16" fill="var(--amber)">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01z" />
                    </svg>
                  ))}
                </div>
                <p style={{
                  fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-2)',
                  margin: 0, marginBottom: 24, flex: 1
                }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 18 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 99,
                    background: 'var(--grad)',
                    display: 'grid', placeItems: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    fontFamily: 'var(--display)',
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{t.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{t.role}</div>
                  </div>
                </div>
              </Card3D>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ Stats Bar ============================ */
function StatsBar() {
  const stats = [
    { num: 10247813, suffix: '+', label: 'cutouts done' },
    { num: 2.1,      suffix: 's',  label: 'avg speed',  decimal: 1 },
    { num: 99.2,     suffix: '%',  label: 'edge accuracy', decimal: 1 },
    { num: 142,      suffix: '',   label: 'countries' },
  ];
  return (
    <section className="section" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className="container">
        <Card3D tilt={0.04} lift={2} style={{ padding: '40px 32px', borderRadius: 24 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 24,
          }}>
            {stats.map((s, i) => (
              <Counter key={i} {...s} />
            ))}
          </div>
        </Card3D>
      </div>
    </section>
  );
}

function Counter({ num, suffix = '', label, decimal = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.3, once: true });
  const [val, setVal] = lUseState(0);
  lUseEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const dur = 1500;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(num * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, num]);

  const display = num >= 100000
    ? Math.round(val).toLocaleString()
    : decimal ? val.toFixed(decimal) : Math.round(val).toString();

  return (
    <div ref={ref} style={{ textAlign: 'left' }}>
      <div className="stat-num" style={{
        fontSize: 'clamp(34px, 4vw, 48px)', color: '#fff', marginBottom: 4
      }}>
        {display}<span style={{ color: 'var(--orange-2)' }}>{suffix}</span>
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--muted)', letterSpacing: '0.02em' }}>{label}</div>
    </div>
  );
}

/* ============================ Final CTA ============================ */
function FinalCTA({ onGetStarted }) {
  return (
    <section className="section">
      <div className="container">
        <FadeIn>
          <div style={{
            position: 'relative',
            padding: '70px 40px',
            borderRadius: 32,
            background: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(236,72,153,0.10) 50%, rgba(217,70,239,0.10) 100%)',
            border: '1px solid rgba(255,255,255,0.10)',
            overflow: 'hidden',
            textAlign: 'center',
          }}>
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(50% 80% at 50% 0%, rgba(249,115,22,0.2), transparent 70%)'
            }} />
            <h2 className="h-section hero-shadow" style={{
              position: 'relative', fontSize: 'clamp(36px, 5.5vw, 64px)', margin: 0,
              color: '#fff', maxWidth: 760, marginLeft: 'auto', marginRight: 'auto'
            }}>
              Your first cutout is two seconds away.
            </h2>
            <p style={{
              position: 'relative', fontSize: 17, color: 'var(--text-2)',
              maxWidth: 540, margin: '20px auto 32px'
            }}>
              No credit card. No “book a demo.” Just drop a photo.
            </p>
            <div style={{ position: 'relative', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
                <Icon.sparkle /> Start free — 5 cutouts a day
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => {
                const el = document.getElementById('pricing'); if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>
                See pricing
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ============================ Footer ============================ */
function Footer() {
  const cols = [
    { title: 'Product', links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'API', href: '#' },
      { label: 'Changelog', href: '#' },
      { label: 'Roadmap', href: '#' },
    ]},
    { title: 'Use cases', links: [
      { label: 'Etsy sellers', href: '#' },
      { label: 'Shopify stores', href: '#' },
      { label: 'Instagram creators', href: '#' },
      { label: 'Bulk processing', href: '#' },
      { label: 'Studio photographers', href: '#' },
    ]},
    { title: 'Company', links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact Us', href: 'contact.html' },
      { label: 'Press kit', href: '#' },
    ]},
    { title: 'Legal', links: [
      { label: 'Privacy Policy', href: 'privacy.html' },
      { label: 'Terms & Conditions', href: 'terms.html' },
      { label: 'Refund Policy', href: 'refund.html' },
      { label: 'Shipping & Delivery', href: 'shipping.html' },
    ]},
  ];
  return (
    <footer style={{ borderTop: '1px solid var(--line)', padding: '64px 0 32px', marginTop: 60 }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 1fr)', gap: 36 }}
             className="footer-grid">
          <div>
            <Logo />
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 280, marginTop: 18 }}>
              The fastest way to get a clean PNG. Made in Bangalore, used in 142 countries.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
              {['X', 'IG', 'in'].map((l) => (
                <div key={l} style={{
                  width: 34, height: 34, borderRadius: 10,
                  display: 'grid', placeItems: 'center',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
                  color: 'var(--muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}>{l}</div>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div style={{
                fontSize: 12, color: 'var(--muted-2)', textTransform: 'uppercase',
                letterSpacing: '0.12em', marginBottom: 14
              }}>{c.title}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a style={{ fontSize: 14, color: 'var(--text-2)' }} className="dl-link"
                       href={l.href}
                       onClick={l.href === '#' ? (e) => e.preventDefault() : undefined}
                    >{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="divider" style={{ margin: '40px 0 20px' }} />
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
          fontSize: 13, color: 'var(--muted)'
        }}>
          <div>© 2026 snapcut. All your pixels respected.</div>
          <div style={{ display: 'flex', gap: 22 }}>
            <span className="t-mono" style={{ fontSize: 12 }}>v3.2.1</span>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--success)',
                             boxShadow: '0 0 8px var(--success)' }} />
              All systems normal
            </span>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 880px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

Object.assign(window, { Landing });
