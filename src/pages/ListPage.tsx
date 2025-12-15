import React from 'react';
import { loadQuotes } from '../lib/storage';
import { BookQuote, Provider } from '../lib/types';

const ListPage: React.FC = () => {
  const [quotes, setQuotes] = React.useState<BookQuote[]>([]);
  const [filter, setFilter] = React.useState<Provider | 'all'>('all');
  const [sort, setSort] = React.useState<'timestamp_desc' | 'price_desc'>('timestamp_desc');

  function refresh() {
    setQuotes(loadQuotes());
  }

  React.useEffect(() => {
    refresh();
  }, []);

  const filtered = quotes.filter((q) => (filter === 'all' ? true : q.recommendation === filter));

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price_desc') {
      const aPrice = a.recommendation === 'aladin' ? a.aladin.price : a.recommendation === 'yes24' ? a.yes24.price : 0;
      const bPrice = b.recommendation === 'aladin' ? b.aladin.price : b.recommendation === 'yes24' ? b.yes24.price : 0;
      return bPrice - aPrice;
    }
    const aTs = a.timestamp ? Date.parse(a.timestamp) : 0;
    const bTs = b.timestamp ? Date.parse(b.timestamp) : 0;
    return bTs - aTs;
  });

  const counts = {
    aladin: quotes.filter((q) => q.recommendation === 'aladin').length,
    yes24: quotes.filter((q) => q.recommendation === 'yes24').length,
    none: quotes.filter((q) => q.recommendation === 'none').length,
  };

  const totals = {
    aladin: quotes.reduce((sum, q) => sum + (q.recommendation === 'aladin' ? q.aladin.price : 0), 0),
    yes24: quotes.reduce((sum, q) => sum + (q.recommendation === 'yes24' ? q.yes24.price : 0), 0),
  };

  return (
    <section>
      <h2>My Book List</h2>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.5rem 0 1rem' }}>
        <button type="button" onClick={refresh}>
          Refresh
        </button>

        <label>
          Filter:{' '}
          <select value={filter} onChange={(e) => setFilter(e.target.value as Provider | 'all')}>
            <option value="all">All</option>
            <option value="aladin">Aladin</option>
            <option value="yes24">YES24</option>
            <option value="none">None</option>
          </select>
        </label>

        <label>
          Sort:{' '}
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="timestamp_desc">Newest</option>
            <option value="price_desc">Price (desc)</option>
          </select>
        </label>
      </div>

      <ul>
        <li>Total: {quotes.length}</li>
        <li>Aladin recommended: {counts.aladin} (₩{totals.aladin})</li>
        <li>YES24 recommended: {counts.yes24} (₩{totals.yes24})</li>
        <li>Not buyable: {counts.none}</li>
      </ul>

      {sorted.length === 0 ? (
        <p style={{ marginTop: '1rem' }}>No saved books yet.</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th align="left">ISBN</th>
                <th align="left">Title</th>
                <th align="left">Aladin</th>
                <th align="left">YES24</th>
                <th align="left">Rec</th>
                <th align="left">Saved</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((q) => (
                <tr key={q.isbn} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td>{q.isbn}</td>
                  <td>{q.title}</td>
                  <td>{q.aladin.is_buyable ? `₩${q.aladin.price}` : '-'}</td>
                  <td>{q.yes24.is_buyable ? `₩${q.yes24.price}` : '-'}</td>
                  <td>{q.recommendation}</td>
                  <td>{q.timestamp ? new Date(q.timestamp).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ListPage;
