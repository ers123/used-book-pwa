import React from 'react';

interface Props {
  onDetected?: (isbn: string) => void;
}

const BarcodeScanner: React.FC<Props> = ({ onDetected }) => {
  // TODO: integrate zxing/Quagga. This is a placeholder to keep wiring simple.
  return (
    <div>
      <p>Barcode scanner placeholder.</p>
      <button type="button" onClick={() => onDetected?.('9781234567890')}>
        Simulate scan
      </button>
    </div>
  );
};

export default BarcodeScanner;
