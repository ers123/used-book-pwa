import React from 'react';
import { BookQuote } from '../lib/types';

interface Props {
  quote?: BookQuote;
}

function formatWon(value: number) {
  return `₩${value.toLocaleString()}`;
}

function ProviderLine({ label, isBuyable, price, error }: { label: string; isBuyable: boolean; price: number; error?: string }) {
  const value = isBuyable ? formatWon(price) : 'Not buyable';
  return (
    <>
      <dt>{label}</dt>
      <dd>
        {value}
        {!isBuyable && error && error !== 'Not buyable' ? (
          <span className="muted" style={{ display: 'block', fontWeight: 600 }}>
            ({error})
          </span>
        ) : null}
      </dd>
    </>
  );
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
        <ProviderLine
          label="Aladin"
          isBuyable={quote.aladin.is_buyable}
          price={quote.aladin.price}
          error={quote.aladin.error}
        />
        <ProviderLine
          label="YES24"
          isBuyable={quote.yes24.is_buyable}
          price={quote.yes24.price}
          error={quote.yes24.error}
        />
      </dl>
    </article>
  );
};

export default BookResultCard;
