import { BookQuote } from './types';

const STORAGE_KEY = 'book-quotes';

export function loadQuotes(): BookQuote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BookQuote[]) : [];
  } catch {
    return [];
  }
}

export function saveQuote(quote: BookQuote): void {
  const existing = loadQuotes();
  const withoutOld = existing.filter((item) => item.isbn !== quote.isbn);
  const next = [{ ...quote, timestamp: new Date().toISOString() }, ...withoutOld];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('book-quotes-updated'));
}
