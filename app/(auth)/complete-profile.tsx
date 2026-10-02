import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { STORES } from '../../constants/Stores';
import { AuthContext } from '../_layout';

const C = Colors.light;

export default function CompleteProfileScreen() {
  const { refreshProfile } = useContext(AuthContext);

  const [fullName, setFullName] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [primaryStore, setPrimaryStore] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Enter your full name.');
      return;
    }
    if (!employeeNumber.trim()) {
      Alert.alert('Required', 'Enter your employee number.');
      return;
    }
    if (!primaryStore) {
      Alert.alert('Required', 'Select your primary store.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Session expired. Please sign in again.');

      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        full_name: fullName.trim(),
        employee_number: employeeNumber.trim().toUpperCase(),
        primary_store: primaryStore,
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error('That employee number is already registered. Check with your manager.');
        }
        throw error;
      }

      await refreshProfile();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Wordmark */}
          <View style={styles.wordmarkRow}>
            <View style={styles.logoMark} />
            <Text style={styles.wordmark}>Clothing Junction</Text>
          </View>

          <Text style={styles.heading}>Your details</Text>
          <Text style={styles.subheading}>
            This only takes a moment. You cannot change your employee number later.
          </Text>

          {/* Full name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={inputStyle('name')}
              value={fullName}
              onChangeText={setFullName}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. Amahle Dlamini"
              placeholderTextColor={C.textMuted}
              autoCapitalize="words"
            />
          </View>

          {/* Employee number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Employee number</Text>
            <TextInput
              style={inputStyle('emp')}
              value={employeeNumber}
              onChangeText={setEmployeeNumber}
              onFocus={() => setFocusedField('emp')}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. EMP12345"
              placeholderTextColor={C.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          {/* Store picker */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Primary store</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerTrigger, focusedField === 'store' && styles.inputFocused]}
              onPress={() => setShowPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={primaryStore ? styles.pickerValueText : styles.pickerPlaceholderText}>
                {primaryStore || 'Select your store'}
              </Text>
              <Text style={styles.pickerChevron}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={C.surface} size="small" />
            ) : (
              <Text style={styles.btnText}>Save and continue</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Store picker modal — slides up from bottom */}
      <Modal visible={showPicker} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Drag handle */}
            <View style={styles.handle} />
            <Text style={styles.modalHeading}>Select store</Text>

            <FlatList
              data={STORES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32 }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.storeRow,
                    item === primaryStore && styles.storeRowSelected,
                  ]}
                  onPress={() => {
                    setPrimaryStore(item);
                    setShowPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.storeRowText,
                      item === primaryStore && styles.storeRowTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === primaryStore && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPicker(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  kav: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 48,
    flexGrow: 1,
    justifyContent: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  logoMark: {
    width: 24,
    height: 24,
    backgroundColor: C.primary,
    borderRadius: 4,
    marginRight: 10,
  },
  wordmark: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: C.primary,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: C.text,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 15,
    color: C.textMuted,
    lineHeight: 22,
    marginBottom: 40,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  input: {
    height: 48,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: C.text,
  },
  inputFocused: {
    borderColor: C.primary,
    borderWidth: 1.5,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerValueText: {
    fontSize: 15,
    color: C.text,
    flex: 1,
  },
  pickerPlaceholderText: {
    fontSize: 15,
    color: C.textMuted,
    flex: 1,
  },
  pickerChevron: {
    fontSize: 20,
    color: C.textMuted,
    marginLeft: 8,
  },
  btn: {
    height: 50,
    backgroundColor: C.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: C.overlay,
  },
  modalSheet: {
    backgroundColor: C.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 0,
    maxHeight: '82%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.2,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 20,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  storeRowSelected: {
    backgroundColor: '#F5EFE7',
  },
  storeRowText: {
    fontSize: 15,
    color: C.text,
    flex: 1,
  },
  storeRowTextSelected: {
    color: C.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: C.primary,
    marginLeft: 8,
  },
  cancelBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    color: C.textMuted,
    fontWeight: '500',
  },
});
