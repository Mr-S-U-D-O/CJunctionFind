import React, { useState, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Pressable,
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
  const [errorMsg, setErrorMsg] = useState('');

  // Store Modal State
  const [showPicker, setShowPicker] = useState(false);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');

  const filteredStores = useMemo(() => {
    if (!storeSearchQuery.trim()) return STORES;
    return STORES.filter((s) => s.toLowerCase().includes(storeSearchQuery.toLowerCase()));
  }, [storeSearchQuery]);

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!fullName.trim() || !employeeNumber.trim() || !primaryStore) {
      setErrorMsg('Please fill in all details.');
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
      setErrorMsg(e.message ?? 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasError = errorMsg.length > 0;
  const isFormComplete = fullName.trim() && employeeNumber.trim() && primaryStore;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.stepText}>Step 1 of 1</Text>
              <Text style={styles.heading}>Complete Profile</Text>
              <Text style={styles.subheading}>Set up your staff account</Text>
            </View>

            {hasError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, hasError && styles.inputError]}
                value={fullName}
                onChangeText={(t) => { setFullName(t); setErrorMsg(''); }}
                placeholder="Amahle Dlamini"
                placeholderTextColor={C.textMuted}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Employee Number</Text>
              <TextInput
                style={[styles.input, hasError && styles.inputError]}
                value={employeeNumber}
                onChangeText={(t) => { setEmployeeNumber(t); setErrorMsg(''); }}
                placeholder="EMP12345"
                placeholderTextColor={C.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Primary Store</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.pickerTrigger,
                  pressed && styles.pickerTriggerActive,
                  hasError && styles.inputError
                ]}
                onPress={() => setShowPicker(true)}
              >
                <Text style={primaryStore ? styles.pickerValueText : styles.pickerPlaceholderText}>
                  {primaryStore || 'Select your store'}
                </Text>
                <Text style={styles.pickerChevron}>›</Text>
              </Pressable>
            </View>

            <Pressable 
              style={({ pressed }) => [
                styles.primaryBtn, 
                pressed && isFormComplete && styles.primaryBtnPressed,
                (!isFormComplete || loading) && styles.btnDisabled
              ]} 
              onPress={handleSubmit}
              disabled={!isFormComplete || loading}
            >
              {loading ? (
                <ActivityIndicator color={C.card} size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Save & Continue</Text>
              )}
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Store Picker Bottom Sheet/Modal */}
      <Modal visible={showPicker} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Select Store</Text>
              <Pressable onPress={() => setShowPicker(false)} hitSlop={10}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={storeSearchQuery}
                onChangeText={setStoreSearchQuery}
                placeholder="Search stores..."
                placeholderTextColor={C.textMuted}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>

            <FlatList
              data={filteredStores}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No stores found matching "{storeSearchQuery}"</Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.storeRow,
                    item === primaryStore && styles.storeRowSelected,
                    pressed && styles.storeRowPressed
                  ]}
                  onPress={() => {
                    setPrimaryStore(item);
                    setStoreSearchQuery('');
                    setShowPicker(false);
                    setErrorMsg('');
                  }}
                >
                  <Text style={[
                    styles.storeRowText,
                    item === primaryStore && styles.storeRowTextSelected
                  ]}>
                    {item}
                  </Text>
                  {item === primaryStore && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              )}
            />
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 32,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  header: {
    marginBottom: 40,
  },
  stepText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: C.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: C.text,
    letterSpacing: -0.5,
  },
  subheading: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: C.textMuted,
    marginTop: 6,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    color: C.error,
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: C.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    height: 56,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: C.text,
  },
  inputError: {
    borderColor: C.error,
    backgroundColor: '#FEF2F2',
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pickerTriggerActive: {
    opacity: 0.7,
  },
  pickerValueText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: C.text,
    flex: 1,
  },
  pickerPlaceholderText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: C.textMuted,
    flex: 1,
  },
  pickerChevron: {
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    color: C.textMuted,
    marginLeft: 8,
  },
  primaryBtn: {
    height: 56,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderRadius: 14,
  },
  primaryBtnPressed: {
    backgroundColor: C.accent,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontFamily: 'Inter_600SemiBold',
    color: C.card, 
    fontSize: 16,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: C.overlay,
  },
  modalSheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  modalHeading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: C.text,
  },
  closeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: C.primary,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  searchInput: {
    fontFamily: 'Inter_400Regular',
    height: 50,
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: C.text,
  },
  listContent: {
    paddingBottom: 40,
  },
  separator: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 24,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  storeRowPressed: {
    backgroundColor: C.surface,
  },
  storeRowSelected: {
    backgroundColor: '#FFFBEB', // very light yellow/gold tint
  },
  storeRowText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: C.text,
    flex: 1,
  },
  storeRowTextSelected: {
    fontFamily: 'Inter_600SemiBold',
    color: C.primary,
  },
  checkmark: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: C.accent,
    marginLeft: 12,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
});
