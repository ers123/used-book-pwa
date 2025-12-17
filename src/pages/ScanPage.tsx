import React from 'react';
import BarcodeScanner from '../components/BarcodeScanner';
import BookResultCard from '../components/BookResultCard';
import { fetchQuote } from '../lib/api';
import { saveQuote } from '../lib/storage';
import { BookQuote } from '../lib/types';

const ScanPage: React.FC = () => {
  const [isbnInput, setIsbnInput] = React.useState('');
  const [quote, setQuote] = React.useState<BookQuote | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [saved, setSaved] = React.useState(false);

  const normalizedIsbn = isbnInput.replace(/[^\dXx]/g, '').toUpperCase();

  async function lookup(isbn: string) {
    setLoading(true);
    setError(undefined);
    setSaved(false);
    try {
      const next = await fetchQuote(isbn);
      setQuote(next);
    } catch (e) {
      setQuote(undefined);
      setError(e instanceof Error ? e.message : 'Lookup failed');
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const candidate = normalizedIsbn;
    if (candidate.length !== 10 && candidate.length !== 13) {
      setError('Enter ISBN-10 or ISBN-13 (numbers only).');
      return;
    }
    void lookup(candidate);
  }

  return (
    <section>
      <BarcodeScanner
        onDetected={(isbn) => {
          setIsbnInput(isbn);
          void lookup(isbn);
        }}
      />

      <form onSubmit={onSubmit} className="row" style={{ marginTop: 12 }}>
        <input
          value={isbnInput}
          onChange={(e) => setIsbnInput(e.target.value)}
          inputMode="numeric"
          placeholder="ISBN (10 or 13 digits)"
          aria-label="ISBN"
          className="field"
        />
        <button className="button buttonPrimary" type="submit" disabled={loading}>
          {loading ? 'Looking up…' : 'Lookup'}
        </button>
      </form>

      <p className="muted" style={{ margin: '10px 0 0' }}>
        Tip: shelf-clearing mode is “scan → save → next”.
      </p>

      {error ? (
        <p className="error" style={{ margin: '10px 0 0' }}>
          {error}
        </p>
      ) : null}

      <BookResultCard quote={quote} />

      <div className="row" style={{ marginTop: 12 }}>
        <button
          className="button buttonGhost"
          type="button"
          disabled={!quote || loading}
          onClick={() => {
            if (!quote) return;
            saveQuote(quote);
            setSaved(true);
          }}
        >
          Add to List
        </button>
        {saved ? <span className="pill">Saved</span> : null}
      </div>
    </section>
  );
};

export default ScanPage;
