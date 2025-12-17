import React from 'react';
import { BookQuote } from '../lib/types';

interface Props {
  quote?: BookQuote;
}

function formatWon(value: number) {
  return `₩${value.toLocaleString()}`;
}

const BookResultCard: React.FC<Props> = ({ quote }) => {
  if (!quote) {
    return <p className="muted" style={{ marginTop: 12 }}>No result yet.</p>;
  }

  const recommendationLabel =
    quote.recommendation === 'aladin'
      ? 'Aladin'
      : quote.recommendation === 'yes24'
        ? 'YES24'
        : 'None';

  return (
    <article className="resultCard">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <h3 className="resultTitle">
          {quote.title} <span className="muted">({quote.isbn})</span>
        </h3>
        <span className="pill pillAccent">Rec: {recommendationLabel}</span>
      </div>

      <dl className="kv">
        <dt>Aladin</dt>
        <dd>{quote.aladin.is_buyable ? formatWon(quote.aladin.price) : 'Not buyable'}</dd>
        <dt>YES24</dt>
        <dd>{quote.yes24.is_buyable ? formatWon(quote.yes24.price) : 'Not buyable'}</dd>
      </dl>
    </article>
  );
};

export default BookResultCard;
