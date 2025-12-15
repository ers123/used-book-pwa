import React from 'react';
import BarcodeScanner from '../components/BarcodeScanner';
import BookResultCard from '../components/BookResultCard';

const ScanPage: React.FC = () => {
  // TODO: hold scan/manual ISBN state and trigger lookups
  return (
    <section>
      <h2>Scan or Enter ISBN</h2>
      <BarcodeScanner />
      <BookResultCard />
    </section>
  );
};

export default ScanPage;
