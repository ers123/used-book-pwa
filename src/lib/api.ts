import { BookQuote } from './types';

const API_BASE = '/api/quote';

export async function fetchQuote(isbn: string): Promise<BookQuote> {
  const response = await fetch(`${API_BASE}?isbn=${encodeURIComponent(isbn)}`);
  const text = await response.text();

  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const msg =
      (payload && typeof payload.error === 'string' && payload.error) || `Quote lookup failed with status ${response.status}`;
    throw new Error(msg);
  }

  return payload as BookQuote;
}
