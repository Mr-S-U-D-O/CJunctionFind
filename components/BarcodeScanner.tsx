"use client";

import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    let html5QrCode: Html5Qrcode;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 280, height: 150 }
          },
          (decodedText) => {
            html5QrCode.stop().then(() => {
              onScan(decodedText);
            }).catch(console.error);
          },
          (errorMessage) => {
            // Ignore parse errors (constantly fires when looking for code)
          }
        );
      } catch (err) {
        console.error(err);
        setError("Camera access denied. Please ensure you have granted camera permissions.");
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 100,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ position: 'absolute', top: '24px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#FFF', fontSize: '20px', fontWeight: 700 }}>Scan Barcode</h2>
        <button 
          onClick={onClose}
          style={{ 
            width: '40px', height: '40px', borderRadius: '20px', 
            backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', color: '#FFF' 
          }}
        >
          <X size={24} />
        </button>
      </div>
      
      {error ? (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#FCA5A5', marginBottom: '16px', lineHeight: '24px' }}>{error}</p>
          <button onClick={onClose} style={{ padding: '12px 24px', backgroundColor: '#FFF', color: '#000', borderRadius: '8px', fontWeight: 700 }}>
            Go Back
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div id="reader" style={{ width: '100%', borderRadius: '16px', overflow: 'hidden' }}></div>
          <p style={{ color: '#A3A3A3', marginTop: '32px', fontSize: '15px' }}>Position barcode within the frame</p>
        </div>
      )}
    </div>
  );
}
