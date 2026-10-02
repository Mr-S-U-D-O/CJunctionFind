import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const C = Colors.light;

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ visible, onClose, onScan }: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
    // Reset scanned state after a delay in case the modal is opened again
    setTimeout(() => setScanned(false), 2000); 
  };

  if (!visible) return null;

  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.permissionContainer}>
          <View style={styles.permissionContent}>
            <Ionicons name="camera-outline" size={64} color={C.textMuted} style={{ marginBottom: 24 }} />
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionText}>
              We need access to your camera to scan barcodes.
            </Text>
            <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={styles.permissionBtnText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.scannerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Barcode</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.cameraWrapper}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr', 'code128', 'code39'],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
          
          {/* Overlay to guide the user */}
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
            <Text style={styles.overlayText}>Align barcode within the frame</Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.background,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: C.background,
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 15,
    color: C.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  permissionBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: C.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanArea: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: C.accent,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  overlayText: {
    color: '#FFF',
    marginTop: 24,
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
