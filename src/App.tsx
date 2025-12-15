import React from 'react';
import ScanPage from './pages/ScanPage';
import ListPage from './pages/ListPage';

const App: React.FC = () => {
  // TODO: Replace with simple routing once we pick a router (or manual tab state)
  return (
    <main style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Used Book Buyback Checker</h1>
      <p>Placeholder shell; wire navigation and state in MVP.</p>
      <section>
        <ScanPage />
      </section>
      <section style={{ marginTop: '2rem' }}>
        <ListPage />
      </section>
    </main>
  );
};

export default App;
