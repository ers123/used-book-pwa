import React from 'react';
import { BarcodeFormat, BrowserMultiFormatReader, DecodeHintType, NotFoundException } from '@zxing/library';

interface Props {
  onDetected?: (isbn: string) => void;
}

const BarcodeScanner: React.FC<Props> = ({ onDetected }) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const readerRef = React.useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const pollRef = React.useRef<number | null>(null);
  const lastHitRef = React.useRef<{ value: string; at: number } | null>(null);
  const cooldownRef = React.useRef<number>(0);

  const [status, setStatus] = React.useState<'idle' | 'starting' | 'scanning' | 'denied' | 'error'>('idle');
  const [message, setMessage] = React.useState<string | null>(null);
  const [lastScan, setLastScan] = React.useState<string | null>(null);

  function stop(nextStatus: 'idle' | 'error' | 'denied' = 'idle') {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        try {
          track.stop();
        } catch {
          // ignore
        }
      }
      streamRef.current = null;
    }

    try {
      readerRef.current?.reset();
    } catch {
      // ignore
    }
    readerRef.current = null;

    setStatus(nextStatus);
  }

  React.useEffect(() => {
    return () => stop();
  }, []);

  async function start() {
    if (!window.isSecureContext) {
      setStatus('error');
      setMessage('Camera requires HTTPS. Open the deployed URL (or use HTTPS locally).');
      return;
    }

    if (!videoRef.current) return;

    setStatus('starting');
    setMessage('Requesting camera…');

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new BrowserMultiFormatReader(hints, 200);
    readerRef.current = reader;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;

      videoRef.current.srcObject = stream;
      // iOS Safari can be picky: ensure we attempt to play after attaching stream.
      await videoRef.current.play().catch(() => {
        // ignore; zxing may still decode once frames flow
      });

      setStatus('scanning');
      setMessage('Point the barcode at the camera.');

      pollRef.current = window.setInterval(async () => {
        if (!readerRef.current || !videoRef.current) return;
        if (Date.now() < cooldownRef.current) return;
        try {
          const result = await readerRef.current.decodeFromVideoElement(videoRef.current);
          const raw = result.getText();
          const cleaned = raw.replace(/\D/g, '');
          setLastScan(cleaned || raw);

          const now = Date.now();
          const last = lastHitRef.current;
          if (last && last.value === cleaned && now - last.at < 2000) return;
          lastHitRef.current = { value: cleaned, at: now };

          if (cleaned.length === 13) {
            setMessage('Captured.');
            onDetected?.(cleaned);
            cooldownRef.current = Date.now() + 2000;
            return;
          }

          setMessage('Scanned, but not an ISBN-13. Try again.');
        } catch (e) {
          if (e instanceof NotFoundException) return;
          const name = e instanceof Error ? e.name : '';
          // Non-fatal: keep scanning and show message.
          setStatus('scanning');
          setMessage(name ? `Scanner hiccup: ${name}. Keep scanning.` : 'Scanner hiccup. Keep scanning.');
        }
      }, 300);
    } catch (e) {
      const name = e instanceof Error ? e.name : '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setStatus('denied');
        setMessage('Camera permission denied. Enable camera access and reload.');
        stop('denied');
      } else {
        setStatus('error');
        const extra = e instanceof Error ? ` (${e.name}${e.message ? `: ${e.message}` : ''})` : '';
        setMessage(`Unable to start camera. Try reloading.${extra}`);
        stop('error');
      }
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span className="pill">Scanner</span>
        <div className="row" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {status === 'idle' ? (
            <button className="button buttonPrimary" type="button" onClick={() => void start()}>
              Start scan
            </button>
          ) : (
            <button className="button buttonGhost" type="button" onClick={() => stop('idle')}>
              Stop
            </button>
          )}
          {import.meta.env.DEV ? (
            <button className="button" type="button" onClick={() => onDetected?.('9781234567890')}>
              Demo
            </button>
          ) : null}
        </div>
      </div>

      {message ? (
        <p className={status === 'error' || status === 'denied' ? 'error' : 'muted'} style={{ margin: '10px 0 0' }}>
          {message}
        </p>
      ) : null}
      {status === 'scanning' && !message ? (
        <p className="muted" style={{ margin: '10px 0 0' }}>
          Waiting for a barcode…
        </p>
      ) : null}
      {lastScan ? (
        <p className="muted" style={{ margin: '6px 0 0' }}>
          Detected ISBN: <strong>{lastScan}</strong>
        </p>
      ) : null}
      <p className="muted" style={{ margin: '6px 0 0' }}>
        Tip: fill the frame, avoid glare, and hold steady for 1–2 seconds.
      </p>

      <div style={{ marginTop: 10 }}>
        <video
          ref={videoRef}
          className="field"
          style={{ padding: 0, height: 260, objectFit: 'cover' }}
          muted
          playsInline
          autoPlay
        />
      </div>
    </div>
  );
};

export default BarcodeScanner;
