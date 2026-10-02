import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Colors } from '../../constants/Colors';

const C = Colors.light;

export default function AddItemScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Scan section */}
        <View style={styles.scanCard}>
          <Text style={styles.scanLabel}>SCAN BARCODE</Text>
          <TouchableOpacity style={styles.scanBtn} activeOpacity={0.85}>
            <Text style={styles.scanBtnText}>Open camera</Text>
          </TouchableOpacity>
          <Text style={styles.scanHint}>Or enter codes manually below</Text>
        </View>

        {/* Manual entry hint */}
        <Text style={styles.sectionTitle}>Item details</Text>
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Barcode</Text>
          <View style={styles.fakeInput}>
            <Text style={styles.fakeInputText}>e.g. 2000001291962</Text>
          </View>
        </View>
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Short code</Text>
          <View style={styles.fakeInput}>
            <Text style={styles.fakeInputText}>e.g. FC7025</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} activeOpacity={0.85}>
          <Text style={styles.submitBtnText}>Add item</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  scanCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  scanLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: C.textMuted,
    marginBottom: 16,
  },
  scanBtn: {
    height: 48,
    paddingHorizontal: 28,
    backgroundColor: C.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  scanHint: {
    fontSize: 13,
    color: C.textMuted,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: C.textMuted,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    marginBottom: 8,
  },
  fakeInput: {
    height: 48,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  fakeInputText: {
    fontSize: 14,
    color: C.textMuted,
  },
  submitBtn: {
    height: 50,
    backgroundColor: C.accent,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
