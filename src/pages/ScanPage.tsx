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
      setError('Enter a 10- or 13-digit ISBN');
      return;
    }
    void lookup(candidate);
  }

  return (
    <section>
      <h2>Scan or Enter ISBN</h2>
      <BarcodeScanner
        onDetected={(isbn) => {
          setIsbnInput(isbn);
          void lookup(isbn);
        }}
      />

      <form onSubmit={onSubmit} style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
        <input
          value={isbnInput}
          onChange={(e) => setIsbnInput(e.target.value)}
          inputMode="numeric"
          placeholder="Enter ISBN-10 or ISBN-13"
          aria-label="ISBN"
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Looking up…' : 'Lookup'}
        </button>
      </form>

      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}

      <BookResultCard quote={quote} />

      <div style={{ marginTop: '1rem' }}>
        <button
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
        {saved ? <span style={{ marginLeft: '0.5rem' }}>Saved.</span> : null}
      </div>
    </section>
  );
};

export default ScanPage;
