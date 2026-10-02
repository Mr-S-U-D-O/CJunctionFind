import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import DropdownPicker from '../../components/DropdownPicker';
import { DEPARTMENTS, SIZES, COMMON_COLORS } from '../../constants/Options';
import Toast from '../../components/Toast';

const C = Colors.light;

export default function AddItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [longCode, setLongCode] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [size, setSize] = useState('');
  const [colour, setColour] = useState('');
  const [department, setDepartment] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [isMarkedDown, setIsMarkedDown] = useState(false);
  const [isOnFlash, setIsOnFlash] = useState(false);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [profileStore, setProfileStore] = useState<string | null>(null);

  // Feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const submitScale = useRef(new Animated.Value(1)).current;

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const setFieldError = (field: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearFieldError = (field: string) => {
    setFieldErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  };

  const pressButton = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(submitScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(submitScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(callback);
  };

  useEffect(() => {
    fetchProfileStore();
    // Pre-fill barcode if passed
    if (params.barcode && typeof params.barcode === 'string') {
      setBarcode(params.barcode);
    }
  }, [params.barcode]);

  const fetchProfileStore = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('primary_store').eq('id', user.id).single();
    if (data) {
      setProfileStore(data.primary_store);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        const newPhotos = [];
        for (const asset of result.assets) {
          const manipResult = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 1080 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );
          newPhotos.push(manipResult.uri);
        }
        setPhotos((prev) => [...prev, ...newPhotos]);
      } catch (error) {
        Alert.alert('Error', 'Failed to process images');
      }
    }
  };
  
  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setName('');
    setLongCode('');
    setShortCode('');
    setBarcode('');
    setSize('');
    setColour('');
    setDepartment('');
    setPrice('');
    setOriginalPrice('');
    setIsMarkedDown(false);
    setIsOnFlash(false);
    setNotes('');
    setPhotos([]);
  };

  const handleToggleSale = (type: 'markdown' | 'flash', val: boolean) => {
    if (type === 'markdown') {
      setIsMarkedDown(val);
    } else {
      setIsOnFlash(val);
    }
    
    const isNowOnSale = val || (type === 'markdown' ? isOnFlash : isMarkedDown);
    
    if (isNowOnSale && !originalPrice && price) {
      setOriginalPrice(price);
      setPrice('');
    } else if (!isNowOnSale && originalPrice) {
      setPrice(originalPrice);
      setOriginalPrice('');
    }
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors['name'] = 'Product name is required';
    if (!price.trim()) errors['price'] = 'Price is required';
    if ((isMarkedDown || isOnFlash) && !originalPrice.trim()) errors['originalPrice'] = 'Original price is required';
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast('Please fill in the required fields', 'error');
      return;
    }
    setFieldErrors({});
    
    pressButton(async () => {
    setLoading(true);
    try {
      // Check for duplication
      if (barcode.trim()) {
        const { data: existingItem, error: existError } = await supabase
          .from('items')
          .select('id, name')
          .eq('barcode', barcode.trim())
          .limit(1);
          
        if (existError) throw existError;
        
        if (existingItem && existingItem.length > 0) {
          setLoading(false);
          showToast(`Barcode already exists: ${existingItem[0].name}`, 'error');
          Alert.alert(
            'Duplicate Found', 
            `An item with this barcode already exists: "${existingItem[0].name}". View it or enter a different barcode.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'View Item', 
                onPress: () => router.push(`/item/${existingItem[0].id}`) 
              }
            ]
          );
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const photoUrls: string[] = [];
      
      for (const uri of photos) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const filePath = `${user.id}/${fileName}`;
        
        const res = await fetch(uri);
        const arrayBuffer = await res.arrayBuffer();
        
        const { error: uploadError } = await supabase.storage
          .from('item-photos')
          .upload(filePath, arrayBuffer, { contentType: 'image/jpeg' });
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('item-photos')
          .getPublicUrl(filePath);
          
        photoUrls.push(publicUrl);
      }

      const { error: insertError } = await supabase.from('items').insert({
        name: name.trim(),
        long_code: longCode.trim() || null,
        short_code: shortCode.trim() || null,
        barcode: barcode.trim() || null,
        size: size.trim() || null,
        colour: colour.trim() || null,
        department: department.trim() || null,
        price: price ? parseFloat(price) : null,
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        is_marked_down: isMarkedDown,
        is_on_flash: isOnFlash,
        notes: notes.trim() || null,
        photos: photoUrls,
        added_by: user.id,
        store_added: profileStore || 'Unknown Store',
      });

      if (insertError) throw insertError;
      
      showToast(`"${name.trim()}" added to inventory!`, 'success');
      setTimeout(resetForm, 400);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Failed to save item. Try again.', 'error');
    } finally {
      setLoading(false);
    }
    }); // end pressButton
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Toast
        visible={!!toast}
        message={toast?.message || ''}
        type={toast?.type || 'success'}
        onHide={() => setToast(null)}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add New Item</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Photos</Text>
          <View style={styles.photosContainer}>
            {photos.map((uri, index) => (
              <View key={index} style={styles.photoWrapper}>
                <Image source={{ uri }} style={styles.photo} />
                <TouchableOpacity style={styles.removePhotoBtn} onPress={() => handleRemovePhoto(index)} activeOpacity={0.8}>
                  <Ionicons name="close" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePickImage} activeOpacity={0.7}>
              <Ionicons name="camera-outline" size={28} color={C.textMuted} style={{ marginBottom: 4 }} />
              <Text style={styles.addPhotoText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Name <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput 
              style={[styles.input, fieldErrors['name'] && styles.inputError]} 
              value={name} 
              onChangeText={(v) => { setName(v); clearFieldError('name'); }} 
              placeholder="e.g. LDS S/S CHOC SIDE RUCHED..." 
              placeholderTextColor={C.textMuted} 
            />
            {fieldErrors['name'] && (
              <Text style={styles.fieldErrorText}>
                <Ionicons name="alert-circle-outline" size={12} /> {fieldErrors['name']}
              </Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldBlock, { flex: 1, paddingRight: 8 }]}>
              <DropdownPicker 
                label="Department"
                value={department}
                onValueChange={setDepartment}
                options={DEPARTMENTS}
                placeholder="Select..."
              />
            </View>
            <View style={[styles.fieldBlock, { flex: 1, paddingLeft: 8 }]}>
              <DropdownPicker 
                label="Colour"
                value={colour}
                onValueChange={setColour}
                options={COMMON_COLORS}
                searchable
                allowCustom
                placeholder="Search..."
              />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <DropdownPicker 
              label="Size"
              value={size}
              onValueChange={setSize}
              options={SIZES}
              searchable
              allowCustom
              placeholder="Select or type..."
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Codes & Identifiers</Text>
          
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Barcode</Text>
            <TextInput style={styles.input} value={barcode} onChangeText={setBarcode} placeholder="2000001291962" placeholderTextColor={C.textMuted} />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldBlock, { flex: 1, paddingRight: 8 }]}>
              <Text style={styles.fieldLabel}>Short code</Text>
              <TextInput style={styles.input} value={shortCode} onChangeText={setShortCode} placeholder="FC7025" placeholderTextColor={C.textMuted} />
            </View>
            <View style={[styles.fieldBlock, { flex: 1, paddingLeft: 8 }]}>
              <Text style={styles.fieldLabel}>Long code</Text>
              <TextInput style={styles.input} value={longCode} onChangeText={setLongCode} placeholder="300630001" placeholderTextColor={C.textMuted} />
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Pricing & Status</Text>

          {!isMarkedDown && !isOnFlash ? (
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Price <Text style={styles.requiredStar}>*</Text></Text>
              <View style={styles.priceInputWrap}>
                <Text style={styles.currencySymbol}>R</Text>
                <TextInput style={styles.priceInput} value={price} onChangeText={setPrice} placeholder="99.99" keyboardType="numeric" placeholderTextColor={C.textMuted} />
              </View>
            </View>
          ) : (
            <View style={styles.row}>
              <View style={[styles.fieldBlock, { flex: 1, paddingRight: 8 }]}>
                <Text style={styles.fieldLabel}>Original Price <Text style={styles.requiredStar}>*</Text></Text>
                <View style={styles.priceInputWrap}>
                  <Text style={styles.currencySymbol}>R</Text>
                  <TextInput style={styles.priceInput} value={originalPrice} onChangeText={setOriginalPrice} placeholder="149.99" keyboardType="numeric" placeholderTextColor={C.textMuted} />
                </View>
              </View>
              <View style={[styles.fieldBlock, { flex: 1, paddingLeft: 8 }]}>
                <Text style={styles.fieldLabel}>{isOnFlash ? 'Flash Price' : 'Sale Price'} <Text style={styles.requiredStar}>*</Text></Text>
                <View style={styles.priceInputWrap}>
                  <Text style={styles.currencySymbol}>R</Text>
                  <TextInput style={styles.priceInput} value={price} onChangeText={setPrice} placeholder="99.99" keyboardType="numeric" placeholderTextColor={C.textMuted} />
                </View>
              </View>
            </View>
          )}

          <View style={styles.switchesContainer}>
            <View style={styles.switchBlock}>
              <Text style={styles.switchLabel}>Marked Down</Text>
              <Switch value={isMarkedDown} onValueChange={(val) => handleToggleSale('markdown', val)} trackColor={{ true: C.primary }} />
            </View>

            <View style={[styles.switchBlock, { borderBottomWidth: 0 }]}>
              <Text style={styles.switchLabel}>On Flash Sale</Text>
              <Switch value={isOnFlash} onValueChange={(val) => handleToggleSale('flash', val)} trackColor={{ true: C.primary }} />
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={notes} 
              onChangeText={setNotes} 
              placeholder="Condition, missing tags, etc." 
              placeholderTextColor={C.textMuted}
              multiline 
            />
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: submitScale }] }}>
          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
            activeOpacity={0.85} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Add Item</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.8 },
  container: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 60 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, color: C.textMuted, textTransform: 'uppercase', marginBottom: 16, marginLeft: 4 },
  formGroup: { marginBottom: 32 },
  fieldBlock: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 8, marginLeft: 4 },
  requiredStar: { color: C.error },
  input: { minHeight: 52, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, fontSize: 15, color: C.text },
  textArea: { minHeight: 100, paddingTop: 16, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  priceInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, minHeight: 52 },
  currencySymbol: { fontSize: 15, fontWeight: '600', color: C.textMuted, marginRight: 8 },
  priceInput: { flex: 1, fontSize: 15, color: C.text, height: '100%' },
  switchesContainer: { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginTop: 8 },
  switchBlock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  switchLabel: { fontSize: 15, fontWeight: '600', color: C.text },
  photosContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  photoWrapper: { position: 'relative' },
  photo: { width: 90, height: 90, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  removePhotoBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: C.error, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 1, borderWidth: 2, borderColor: C.background },
  addPhotoBtn: { width: 90, height: 90, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  addPhotoText: { color: C.textMuted, fontWeight: '600', fontSize: 12, marginTop: 4 },
  submitBtn: { flexDirection: 'row', height: 56, backgroundColor: C.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  inputError: { borderColor: C.error, borderWidth: 1.5 },
  fieldErrorText: { color: C.error, fontSize: 12, fontWeight: '500', marginTop: 6, marginLeft: 4 },
});
