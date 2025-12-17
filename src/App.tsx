import React from 'react';
import ScanPage from './pages/ScanPage';
import ListPage from './pages/ListPage';

const App: React.FC = () => {
  return (
    <main className="container">
      <header className="header">
        <h1 className="title">Used Book Buyback Checker</h1>
        <p className="subtitle">
          Scan or type an ISBN. Get buyback signals. Put the book in the right pile.
        </p>
      </header>

      <div className="grid">
        <div className="panel">
          <h2 className="panelTitle">Lookup</h2>
          <ScanPage />
        </div>

        <div className="panel">
          <h2 className="panelTitle">Saved</h2>
          <ListPage />
        </div>
      </div>
    </main>
  );
};

export default App;
