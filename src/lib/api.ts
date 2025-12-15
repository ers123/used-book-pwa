import { BookQuote } from './types';

const API_BASE = '/api/quote';

export async function fetchQuote(isbn: string): Promise<BookQuote> {
  const response = await fetch(`${API_BASE}?isbn=${encodeURIComponent(isbn)}`);
  if (!response.ok) {
    throw new Error(`Quote lookup failed with status ${response.status}`);
  }
  return response.json();
}
