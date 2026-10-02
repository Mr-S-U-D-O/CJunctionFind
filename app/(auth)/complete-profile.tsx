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
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
          
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name="person-add" size={32} color={C.accent} />
            </View>
            <Text style={styles.stepText}>Final Step</Text>
            <Text style={styles.heading}>Complete Profile</Text>
            <Text style={styles.subheading}>Set up your staff account</Text>
          </View>

          <View style={styles.card}>
            {hasError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={C.error} style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputWrapper, hasError && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color="#737373" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={(t) => { setFullName(t); setErrorMsg(''); }}
                  placeholder="Amahle Dlamini"
                  placeholderTextColor="#525252"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Employee Number</Text>
              <View style={[styles.inputWrapper, hasError && styles.inputError]}>
                <Ionicons name="id-card-outline" size={20} color="#737373" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={employeeNumber}
                  onChangeText={(t) => { setEmployeeNumber(t); setErrorMsg(''); }}
                  placeholder="EMP12345"
                  placeholderTextColor="#525252"
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Primary Store</Text>
              <TouchableOpacity
                style={[
                  styles.pickerTrigger,
                  hasError && styles.inputError
                ]}
                onPress={() => setShowPicker(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="storefront-outline" size={20} color="#737373" style={styles.inputIcon} />
                <Text style={primaryStore ? styles.pickerValueText : styles.pickerPlaceholderText}>
                  {primaryStore || 'Select your store'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#737373" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[
                styles.primaryBtn, 
                (!isFormComplete || loading) && styles.btnDisabled
              ]} 
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={!isFormComplete || loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Save & Continue</Text>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Store Picker Bottom Sheet/Modal */}
      <Modal visible={showPicker} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Select Store</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)} hitSlop={10}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#737373" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.searchInput}
                value={storeSearchQuery}
                onChangeText={setStoreSearchQuery}
                placeholder="Search stores..."
                placeholderTextColor="#525252"
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
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={40} color="#333" />
                  <Text style={styles.emptyText}>No stores found</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.storeRow,
                    item === primaryStore && styles.storeRowSelected
                  ]}
                  onPress={() => {
                    setPrimaryStore(item);
                    setStoreSearchQuery('');
                    setShowPicker(false);
                    setErrorMsg('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.storeRowText,
                    item === primaryStore && styles.storeRowTextSelected
                  ]}>
                    {item}
                  </Text>
                  {item === primaryStore && (
                    <Ionicons name="checkmark-circle" size={24} color={C.accent} />
                  )}
                </TouchableOpacity>
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
    backgroundColor: '#000000',
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
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
    fontSize: 32,
    color: '#FFF',
    letterSpacing: -0.5,
  },
  subheading: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#A3A3A3',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#262626',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    color: C.error,
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#A3A3A3',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#FFF',
    height: '100%',
  },
  inputError: {
    borderColor: C.error,
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  pickerValueText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#FFF',
    flex: 1,
  },
  pickerPlaceholderText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#525252',
    flex: 1,
  },
  primaryBtn: {
    height: 56,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderRadius: 14,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontFamily: 'Inter_700Bold',
    color: '#000', 
    fontSize: 16,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    paddingTop: 20,
    borderWidth: 1,
    borderColor: '#333',
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
    color: '#FFF',
  },
  closeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: C.accent,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    height: 50,
    backgroundColor: '#171717',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#FFF',
    height: '100%',
  },
  listContent: {
    paddingBottom: 40,
  },
  separator: {
    height: 1,
    backgroundColor: '#262626',
    marginHorizontal: 24,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  storeRowSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  storeRowText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#CCC',
    flex: 1,
  },
  storeRowTextSelected: {
    fontFamily: 'Inter_600SemiBold',
    color: C.accent,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#737373',
    marginTop: 12,
  },
});
