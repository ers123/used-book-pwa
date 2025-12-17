import React from 'react';
import { BarcodeFormat, BrowserMultiFormatReader, DecodeHintType, NotFoundException } from '@zxing/library';

interface Props {
  onDetected?: (isbn: string) => void;
}

const BarcodeScanner: React.FC<Props> = ({ onDetected }) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const readerRef = React.useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = React.useRef<{ stop: () => void } | null>(null);
  const lastHitRef = React.useRef<{ value: string; at: number } | null>(null);

  const [status, setStatus] = React.useState<'idle' | 'starting' | 'scanning' | 'denied' | 'error'>('idle');
  const [message, setMessage] = React.useState<string | null>(null);

  function stop() {
    try {
      controlsRef.current?.stop();
    } catch {
      // ignore
    }
    controlsRef.current = null;

    try {
      readerRef.current?.reset();
    } catch {
      // ignore
    }
    readerRef.current = null;

    setStatus('idle');
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
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);

    const reader = new BrowserMultiFormatReader(hints, 200);
    readerRef.current = reader;

    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const preferred =
        devices.find((d) => /back|rear|environment/i.test(d.label)) ?? devices[devices.length - 1];

      const controls = await reader.decodeFromVideoDevice(preferred?.deviceId, videoRef.current, (result, error) => {
        if (result) {
          const raw = result.getText();
          const cleaned = raw.replace(/\D/g, '');

          const now = Date.now();
          const last = lastHitRef.current;
          if (last && last.value === cleaned && now - last.at < 2000) return;
          lastHitRef.current = { value: cleaned, at: now };

          if (cleaned.length === 13) {
            setMessage('Captured.');
            onDetected?.(cleaned);
            stop();
            return;
          }

          setMessage('Scanned, but not an ISBN-13. Try again.');
          return;
        }

        if (error && !(error instanceof NotFoundException)) {
          setStatus('error');
          setMessage('Scanner error. Try stopping and starting again.');
        }
      });

      controlsRef.current = controls;
      setStatus('scanning');
      setMessage('Point the barcode at the camera.');
    } catch (e) {
      const name = e instanceof Error ? e.name : '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setStatus('denied');
        setMessage('Camera permission denied. Enable camera access and reload.');
      } else {
        setStatus('error');
        setMessage('Unable to start camera. Try reloading.');
      }
      stop();
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
            <button className="button buttonGhost" type="button" onClick={stop}>
              Stop
            </button>
          )}
          <button className="button" type="button" onClick={() => onDetected?.('9781234567890')}>
            Demo
          </button>
        </div>
      </div>

      {message ? (
        <p className={status === 'error' || status === 'denied' ? 'error' : 'muted'} style={{ margin: '10px 0 0' }}>
          {message}
        </p>
      ) : null}

      <div style={{ marginTop: 10 }}>
        <video
          ref={videoRef}
          className="field"
          style={{ padding: 0, height: 240, objectFit: 'cover' }}
          muted
          playsInline
        />
      </div>
    </div>
  );
};

export default BarcodeScanner;
