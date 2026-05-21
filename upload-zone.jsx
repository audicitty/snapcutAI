/* upload-zone.jsx — drag-and-drop upload with webhook-based background removal */

const { useState: uzUseState, useEffect: uzUseEffect, useRef: uzUseRef } = React;

const WEBHOOK_URL = 'https://audicity07.app.n8n.cloud/webhook/remove-background';

/* ===========================================================
   Canvas-based background removal — used only for the landing
   page auto-demo (autoRunSample). Real uploads go to the webhook.
   =========================================================== */
function removeBackground(image, opts = {}) {
  const { threshold = 28, feather = 22, maxDim = 1200 } = opts;
  return new Promise((resolve) => {
    const scale = Math.min(1, maxDim / Math.max(image.width, image.height));
    const w = Math.round(image.width * scale);
    const h = Math.round(image.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h);
    const px = data.data;

    const samples = [];
    const step = Math.max(1, Math.floor(Math.min(w, h) / 80));
    for (let x = 0; x < w; x += step) {
      samples.push([px[(x) * 4], px[(x) * 4 + 1], px[(x) * 4 + 2]]);
      const o = ((h - 1) * w + x) * 4;
      samples.push([px[o], px[o + 1], px[o + 2]]);
    }
    for (let y = 0; y < h; y += step) {
      const o1 = (y * w) * 4;
      samples.push([px[o1], px[o1 + 1], px[o1 + 2]]);
      const o2 = (y * w + (w - 1)) * 4;
      samples.push([px[o2], px[o2 + 1], px[o2 + 2]]);
    }
    const med = (arr, i) => {
      const s = arr.map(a => a[i]).sort((a, b) => a - b);
      return s[Math.floor(s.length / 2)];
    };
    const bg = [med(samples, 0), med(samples, 1), med(samples, 2)];

    const lo = threshold;
    const hi = threshold + feather;
    for (let i = 0; i < px.length; i += 4) {
      const dr = px[i] - bg[0];
      const dg = px[i + 1] - bg[1];
      const db = px[i + 2] - bg[2];
      const d = Math.sqrt(dr * dr + dg * dg + db * db);
      let a;
      if (d <= lo) a = 0;
      else if (d >= hi) a = 255;
      else a = Math.round(((d - lo) / (hi - lo)) * 255);
      px[i + 3] = a;
    }

    for (let i = 0; i < px.length; i += 4) {
      const a = px[i + 3];
      if (a > 0 && a < 255) {
        const af = a / 255;
        px[i]     = Math.min(255, Math.max(0, (px[i]     - (1 - af) * bg[0]) / af));
        px[i + 1] = Math.min(255, Math.max(0, (px[i + 1] - (1 - af) * bg[1]) / af));
        px[i + 2] = Math.min(255, Math.max(0, (px[i + 2] - (1 - af) * bg[2]) / af));
      }
    }

    ctx.putImageData(data, 0, 0);
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      resolve({ url, width: w, height: h, blob });
    }, 'image/png');
  });
}

/* ===========================================================
   UploadZone
   States: idle | dragging | preview | uploading | processing | done | error
   =========================================================== */
function UploadZone({
  compact = false,
  onComplete,
  initialSampleSrc,
  initialSampleName = 'sample.jpg',
  autoRunSample = false,
  showResultActions = true,
}) {
  const [state, setState]       = uzUseState('idle');
  const [progress, setProgress] = uzUseState(0);
  const [file, setFile]         = uzUseState(null);       // raw File object for webhook
  const [fileMeta, setFileMeta] = uzUseState(null);
  const [originalUrl, setOriginalUrl] = uzUseState(null);
  const [resultUrl, setResultUrl]     = uzUseState(null);
  const [errorMsg, setErrorMsg] = uzUseState('');
  const [sliderPos, setSliderPos] = uzUseState(50);
  const fileInputRef        = uzUseRef(null);
  const sliderRef           = uzUseRef(null);
  const draggingHandleRef   = uzUseRef(false);
  const toast = (typeof window !== 'undefined' && window.__toast) || { push: () => {} };

  // Auto-run canvas demo on landing page only — does NOT call the webhook
  uzUseEffect(() => {
    if (autoRunSample && initialSampleSrc) {
      runAutoDemo(initialSampleSrc, initialSampleName);
    }
  }, []);

  function reset() {
    if (originalUrl?.startsWith('blob:')) URL.revokeObjectURL(originalUrl);
    if (resultUrl?.startsWith('blob:'))   URL.revokeObjectURL(resultUrl);
    setOriginalUrl(null);
    setResultUrl(null);
    setFileMeta(null);
    setFile(null);
    setState('idle');
    setProgress(0);
    setSliderPos(50);
    setErrorMsg('');
  }

  /* ---------- drag / drop / pick ---------- */
  function onDragOver(e) {
    e.preventDefault();
    if (state === 'uploading' || state === 'processing') return;
    setState('dragging');
  }
  function onDragLeave(e) {
    e.preventDefault();
    if (state === 'dragging') setState('idle');
  }
  function onDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }
  function onPick(e) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = '';
  }

  /* ---------- validate → preview ---------- */
  function handleFile(f) {
    if (!/^image\/(jpe?g|png|webp)$/.test(f.type)) {
      setState('error');
      setErrorMsg('JPG, PNG, or WEBP only please');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setState('error');
      setErrorMsg('Max 10MB — yours is ' + (f.size / 1024 / 1024).toFixed(1) + 'MB');
      return;
    }
    if (originalUrl?.startsWith('blob:')) URL.revokeObjectURL(originalUrl);
    const url = URL.createObjectURL(f);
    setFile(f);
    setFileMeta({ name: f.name, size: f.size });
    setOriginalUrl(url);
    setState('preview');   // show image + "Remove Background" button
  }

  /* ---------- "Try a sample" — fetch URL → handleFile ---------- */
  async function fetchAndPreview(src, name) {
    try {
      const resp = await fetch(src);
      const blob = await resp.blob();
      const f = new File([blob], name, { type: blob.type || 'image/jpeg' });
      handleFile(f);
    } catch {
      setState('error');
      setErrorMsg('Could not load sample image.');
    }
  }

  /* ---------- send image binary to webhook ---------- */
  async function sendToWebhook() {
    if (!file) return;
    setState('uploading');
    setProgress(0);

    const progressTimer = setInterval(() => {
      setProgress((p) => (p >= 85 ? p : Math.min(85, p + 4 + Math.random() * 8)));
    }, 150);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      clearInterval(progressTimer);

      if (!response.ok) throw new Error('Webhook error ' + response.status);

      setState('processing');
      setProgress(95);

      const json = await response.json();
      const raw = json.url;
      if (!raw) throw new Error('No URL in webhook response');
      // Force https — http:// URLs are blocked by browsers on deployed https sites
      const url = raw.replace(/^http:\/\//, 'https://');
      setProgress(100);
      setResultUrl(url);

      setTimeout(() => {
        setState('done');
        if (onComplete) onComplete({ originalUrl, resultUrl: url, file: fileMeta });
      }, 350);
    } catch (err) {
      clearInterval(progressTimer);
      setState('error');
      setErrorMsg('Could not process. Try another image.');
      console.error(err);
    }
  }

  /* ---------- canvas demo (landing page auto-run only) ---------- */
  async function runAutoDemo(src, name) {
    setFileMeta({ name, size: 0 });
    setOriginalUrl(src);
    setState('uploading');
    setProgress(0);
    await new Promise((res) => {
      let p = 0;
      const t = setInterval(() => {
        p += 6 + Math.random() * 14;
        if (p >= 100) { p = 100; clearInterval(t); res(); }
        setProgress(p);
      }, 80);
    });
    setState('processing');
    setProgress(0);
    let pp = 0;
    const procTimer = setInterval(() => {
      pp = Math.min(95, pp + 3 + Math.random() * 6);
      setProgress(pp);
    }, 90);
    try {
      const img = await loadImage(src, true);
      const result = await removeBackground(img);
      clearInterval(procTimer);
      setProgress(100);
      setResultUrl(result.url);
      setTimeout(() => setState('done'), 350);
    } catch (err) {
      clearInterval(procTimer);
      setState('error');
      setErrorMsg('Could not process. Try another image.');
      console.error(err);
    }
  }

  function loadImage(src, crossOrigin = false) {
    return new Promise((res, rej) => {
      const img = new Image();
      if (crossOrigin) img.crossOrigin = 'anonymous';
      img.onload  = () => res(img);
      img.onerror = (e) => rej(e);
      img.src = src;
    });
  }

  function handleSliderMove(clientX) {
    if (!sliderRef.current) return;
    const r = sliderRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
    setSliderPos(pos);
  }

  uzUseEffect(() => {
    function onMove(e) {
      if (!draggingHandleRef.current) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      handleSliderMove(x);
    }
    function onUp() { draggingHandleRef.current = false; }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  /* ====================== Render ====================== */
  const showDrop    = state === 'idle' || state === 'dragging' || state === 'error';
  const showPreview = state === 'preview';
  const isWorking   = state === 'uploading' || state === 'processing';
  const showResult  = state === 'done';

  return (
    <div
      className={`uz ${state === 'dragging' ? 'is-drag' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{ minHeight: compact ? 280 : 360 }}
    >
      <div className="uz-border" />
      <div className="uz-glow" />

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onPick}
        style={{ display: 'none' }}
      />

      {/* === IDLE / DRAG / ERROR === */}
      {showDrop && (
        <div className="uz-inner">
          <div style={{
            position: 'relative',
            width: 64, height: 64,
            display: 'grid', placeItems: 'center',
            borderRadius: 18,
            background: 'var(--grad-soft)',
            border: '1px solid rgba(255,255,255,0.10)',
            transform: state === 'dragging' ? 'scale(1.15) translateZ(0)' : 'scale(1)',
            transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1)',
            boxShadow: state === 'dragging' ? '0 0 40px rgba(249,115,22,0.4)' : 'none'
          }}>
            <Icon.upload style={{ color: '#fff', width: 26, height: 26 }} />
          </div>
          <div style={{ marginTop: 4 }}>
            <div style={{
              fontFamily: 'var(--display)', fontSize: compact ? 20 : 24, fontWeight: 700,
              letterSpacing: '-0.02em', color: '#fff', marginBottom: 6
            }}>
              {state === 'dragging' ? 'Drop it like it\'s hot' : 'Drop a photo, get a clean PNG'}
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)' }}>
              {state === 'error'
                ? <span style={{ color: 'var(--rose)' }}>{errorMsg}</span>
                : <span>JPG, PNG, WEBP &middot; up to 10MB &middot; takes ~2 seconds</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
              <Icon.upload /> Choose photo
            </button>
            <button className="btn btn-ghost" onClick={() => {
              fetchAndPreview(SAMPLE_IMAGES[0].src, SAMPLE_IMAGES[0].name);
            }}>
              Try a sample
            </button>
          </div>
          <div style={{
            display: 'flex', gap: 14, alignItems: 'center',
            fontSize: 11.5, color: 'var(--muted-2)', marginTop: 8
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon.lock style={{ width: 12, height: 12 }} />
              Your photo never gets stored
            </span>
          </div>
        </div>
      )}

      {/* === PREVIEW — image staged, waiting for "Remove Background" click === */}
      {showPreview && originalUrl && (
        <div className="uz-inner">
          <div style={{ borderRadius: 14, overflow: 'hidden', maxHeight: 220, width: '100%' }}>
            <img
              src={originalUrl}
              alt="Preview"
              style={{
                maxWidth: '100%', maxHeight: 220,
                objectFit: 'contain', display: 'block', margin: '0 auto',
              }}
            />
          </div>
          <div style={{ marginTop: 4 }}>
            <div style={{
              fontFamily: 'var(--display)', fontSize: compact ? 18 : 22, fontWeight: 700,
              letterSpacing: '-0.02em', color: '#fff', marginBottom: 4
            }}>
              Ready to cut
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              {fileMeta?.name}
              {fileMeta?.size > 0 && (
                <> &middot; {(fileMeta.size / 1024).toFixed(0)} KB</>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={sendToWebhook}>
              <Icon.upload /> Remove Background
            </button>
            <button className="btn btn-ghost" onClick={reset}>
              Choose different
            </button>
          </div>
        </div>
      )}

      {/* === UPLOADING / PROCESSING === */}
      {isWorking && (
        <div className="uz-inner">
          <div style={{ position: 'relative', width: 96, height: 96 }}>
            <svg className="ring" viewBox="0 0 100 100">
              <circle className="ring-track" cx="50" cy="50" r="44" />
              <circle
                className="ring-fill"
                cx="50" cy="50" r="44"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
              fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 600, color: '#fff'
            }}>{Math.round(progress)}%</div>
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--display)', fontSize: compact ? 18 : 22, fontWeight: 700,
              letterSpacing: '-0.02em', color: '#fff', marginBottom: 4
            }}>
              {state === 'uploading' ? 'Sending to server…' : 'Removing background…'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              {state === 'uploading'
                ? (fileMeta?.name || 'image')
                : 'Tracing edges, removing pixels, polishing.'}
            </div>
          </div>
        </div>
      )}

      {/* === DONE / RESULT === */}
      {showResult && originalUrl && resultUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            ref={sliderRef}
            className="ba checker"
            style={{
              aspectRatio: compact ? '4 / 3' : '5 / 4',
              cursor: 'ew-resize',
              maxHeight: compact ? 280 : 360
            }}
            onMouseDown={(e) => { draggingHandleRef.current = true; handleSliderMove(e.clientX); }}
            onTouchStart={(e) => { draggingHandleRef.current = true; handleSliderMove(e.touches[0].clientX); }}
          >
            <img className="ba-img" src={resultUrl} alt="result" />
            <div className="ba-clip" style={{ '--clip': `${100 - sliderPos}%` }}>
              <img src={originalUrl} alt="original" />
            </div>
            <div className="ba-divider" style={{ '--pos': `${sliderPos}%` }} />
            <button
              className="ba-handle"
              style={{ '--pos': `${sliderPos}%` }}
              aria-label="Drag to compare"
              type="button"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6L3 12l6 6M15 6l6 6-6 6" />
              </svg>
            </button>
            <div className="ba-tag l">Before</div>
            <div className="ba-tag r">After ✨</div>
          </div>

          {showResultActions && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', fontSize: 13 }}>
                <Icon.check style={{ color: 'var(--success)' }} />
                Done — your PNG is ready
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={reset}>
                  <Icon.refresh /> Another one
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={async () => {
                    const filename = (fileMeta?.name || 'snapcut').replace(/\.[^.]+$/, '') + '-cutout.png';
                    try {
                      const blob = await fetch(resultUrl).then((r) => r.blob());
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = filename;
                      a.click();
                      URL.revokeObjectURL(a.href);
                    } catch {
                      window.open(resultUrl, '_blank');
                    }
                  }}
                >
                  <Icon.download /> Download PNG
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Sample images for the live hero demo (Unsplash — product on white) */
const SAMPLE_IMAGES = [
  { name: 'sneaker.jpg', src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=85&auto=format&fit=crop' },
  { name: 'perfume.jpg', src: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&q=85&auto=format&fit=crop' },
  { name: 'mug.jpg',     src: 'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=900&q=85&auto=format&fit=crop' },
];

Object.assign(window, { UploadZone, removeBackground, SAMPLE_IMAGES });
