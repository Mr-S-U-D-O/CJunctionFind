"use client";

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('Scanning...');
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    codeReaderRef.current = new BrowserMultiFormatReader();
    let notFoundCount = 0;

    const startScanner = async () => {
      try {
        if (!videoRef.current || !codeReaderRef.current) return;
        
        // Try to find a back camera specifically
        const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
        let selectedDeviceId: string | null = null;
        
        for (const device of videoInputDevices) {
          if (device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('environment')) {
            selectedDeviceId = device.deviceId;
            break;
          }
        }
        
        await codeReaderRef.current.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
          if (result && isMounted) {
            setFeedback("Scanned!");
            if (navigator.vibrate) navigator.vibrate(200);
            setTimeout(() => {
              if (isMounted) onScan(result.getText());
            }, 300);
          }
          if (err && err instanceof NotFoundException) {
            notFoundCount++;
            if (notFoundCount > 30) { // Approx 3 seconds at 10fps
              if (isMounted && feedback === 'Scanning...') {
                setFeedback("No barcode found yet... Adjust focus.");
                setTimeout(() => {
                  if (isMounted) setFeedback("Scanning...");
                }, 2000);
              }
              notFoundCount = 0;
            }
          }
        });

      } catch (err) {
        if (isMounted) {
          console.error(err);
          setError("Camera access denied or failed to initialize.");
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [onScan, feedback]);

  // Determine border color based on feedback
  const getBorderColor = () => {
    if (feedback === "Scanned!") return "rgba(34, 197, 94, 0.8)"; // Green
    if (feedback.includes("not clear") || feedback.includes("No barcode")) return "rgba(239, 68, 68, 0.8)"; // Red
    return "rgba(255, 255, 255, 0.8)"; // Default white
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#000', zIndex: 100,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ position: 'absolute', top: '24px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
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
        <div style={{ padding: '24px', textAlign: 'center', zIndex: 10 }}>
          <p style={{ color: '#FCA5A5', marginBottom: '16px', lineHeight: '24px' }}>{error}</p>
          <button onClick={onClose} style={{ padding: '12px 24px', backgroundColor: '#FFF', color: '#000', borderRadius: '8px', fontWeight: 700 }}>
            Go Back
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <video 
            ref={videoRef} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
          />
          {/* Viewfinder overlay */}
          <div style={{ 
            position: 'absolute', 
            top: '50%', left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: '80%', height: '150px',
            border: `3px solid ${getBorderColor()}`,
            borderRadius: '16px',
            boxShadow: '0 0 0 4000px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
            transition: 'border-color 0.3s ease'
          }}></div>
          
          <div style={{ position: 'absolute', bottom: '15%', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', zIndex: 10 }}>
            <p style={{ 
              color: getBorderColor(), 
              fontSize: '16px', 
              fontWeight: 700, 
              textAlign: 'center',
              textShadow: '0px 2px 4px rgba(0,0,0,0.8)',
              transition: 'color 0.3s ease'
            }}>
              {feedback}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
