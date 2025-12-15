import React from 'react';
import { BookQuote } from '../lib/types';

interface Props {
  quote?: BookQuote;
}

const BookResultCard: React.FC<Props> = ({ quote }) => {
  if (!quote) {
    return <p>No result yet.</p>;
  }

  return (
    <article style={{ border: '1px solid #e5e7eb', padding: '1rem' }}>
      <h3>{quote.title} ({quote.isbn})</h3>
      <ul>
        <li>Aladin: {quote.aladin.is_buyable ? `${quote.aladin.price}₩` : 'Not buyable'}</li>
        <li>YES24: {quote.yes24.is_buyable ? `${quote.yes24.price}₩` : 'Not buyable'}</li>
      </ul>
      <p>Recommendation: {quote.recommendation}</p>
    </article>
  );
};

export default BookResultCard;
