import React from 'react';
import ScanPage from './pages/ScanPage';
import ListPage from './pages/ListPage';

const App: React.FC = () => {
  const [view, setView] = React.useState<'scan' | 'list'>('scan');

  return (
    <main style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Used Book Buyback Checker</h1>
      <nav style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
        <button
          type="button"
          onClick={() => setView('scan')}
          aria-current={view === 'scan' ? 'page' : undefined}
        >
          Scan
        </button>
        <button
          type="button"
          onClick={() => setView('list')}
          aria-current={view === 'list' ? 'page' : undefined}
        >
          My Book List
        </button>
      </nav>

      {view === 'scan' ? <ScanPage /> : <ListPage />}
    </main>
  );
};

export default App;
