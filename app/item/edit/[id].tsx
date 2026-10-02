import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { supabase } from '../../../lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Skeleton from '../../../components/Skeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import DropdownPicker from '../../../components/DropdownPicker';
import { DEPARTMENTS, SIZES, COMMON_COLORS } from '../../../constants/Options';
import Toast from '../../../components/Toast';

const C = Colors.light;

export default function EditItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const deleteTimerRef = useRef<any>(null);
  
  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => setToast({ message, type });

  // Track original state for diff
  const [original, setOriginal] = useState<Record<string, any>>({});
  
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
  
  // For photos, we can keep track of existing remote URLs and new local URIs
  const [photos, setPhotos] = useState<{ uri: string, isNew: boolean }[]>([]);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      setName(data.name || '');
      setLongCode(data.long_code || '');
      setShortCode(data.short_code || '');
      setBarcode(data.barcode || '');
      setSize(data.size || '');
      setColour(data.colour || '');
      setDepartment(data.department || '');
      setPrice(data.price ? data.price.toString() : '');
      setOriginalPrice(data.original_price ? data.original_price.toString() : '');
      setIsMarkedDown(data.is_marked_down || false);
      setIsOnFlash(data.is_on_flash || false);
      setNotes(data.notes || '');
      
      // Store original for diff comparison
      setOriginal({
        name: data.name || '',
        long_code: data.long_code || '',
        short_code: data.short_code || '',
        barcode: data.barcode || '',
        size: data.size || '',
        colour: data.colour || '',
        department: data.department || '',
        price: data.price ? data.price.toString() : '',
        original_price: data.original_price ? data.original_price.toString() : '',
        is_marked_down: data.is_marked_down || false,
        is_on_flash: data.is_on_flash || false,
        notes: data.notes || '',
      });
      
      if (data.photos && Array.isArray(data.photos)) {
        setPhotos(data.photos.map((p: string) => ({ uri: p, isNew: false })));
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', 'Could not load item details.');
      router.back();
    } finally {
      setLoading(false);
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
        const newPhotos: { uri: string, isNew: boolean }[] = [];
        for (const asset of result.assets) {
          const manipResult = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 1080 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );
          newPhotos.push({ uri: manipResult.uri, isNew: true });
        }
        setPhotos(prev => [...prev, ...newPhotos]);
      } catch (error) {
        Alert.alert('Error', 'Failed to process images');
      }
    }
  };
  
  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
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

  const getChanges = () => {
    const current: Record<string, any> = {
      name, long_code: longCode, short_code: shortCode, barcode,
      size, colour, department, price, original_price: originalPrice,
      is_marked_down: isMarkedDown, is_on_flash: isOnFlash, notes,
    };
    const labels: Record<string, string> = {
      name: 'Name', long_code: 'Long Code', short_code: 'Short Code', barcode: 'Barcode',
      size: 'Size', colour: 'Colour', department: 'Department', price: 'Price',
      original_price: 'Original Price', is_marked_down: 'Marked Down', is_on_flash: 'Flash Sale', notes: 'Notes',
    };
    return Object.entries(current)
      .filter(([k, v]) => String(v) !== String(original[k] ?? ''))
      .map(([k, v]) => ({ field: labels[k] || k, from: original[k], to: v }));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    if (!price.trim()) {
      showToast('Please provide a price', 'error');
      return;
    }
    if ((isMarkedDown || isOnFlash) && !originalPrice.trim()) {
      showToast('Please provide the original price', 'error');
      return;
    }

    const changes = getChanges();
    const newPhotos = photos.filter(p => p.isNew);
    const hasChanges = changes.length > 0 || newPhotos.length > 0;

    if (!hasChanges) {
      showToast('No changes to save', 'info');
      return;
    }

    // Show changes summary
    const changeLines = changes.map(c => `• ${c.field}: ${c.to}`).join('\n');
    const photoLine = newPhotos.length > 0 ? `• ${newPhotos.length} new photo(s) added` : '';
    const summary = [changeLines, photoLine].filter(Boolean).join('\n');

    Alert.alert(
      `Save ${changes.length + (newPhotos.length > 0 ? 1 : 0)} Change(s)?`,
      summary,
      [
        { text: 'Review More', style: 'cancel' },
        { text: 'Save', onPress: performSave },
      ]
    );
  };

  const performSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const finalPhotoUrls: string[] = [];
      
      for (const photo of photos) {
        if (!photo.isNew) {
          finalPhotoUrls.push(photo.uri);
          continue;
        }
        
        // Upload new photo
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const filePath = `${user.id}/${fileName}`;
        
        const res = await fetch(photo.uri);
        const arrayBuffer = await res.arrayBuffer();
        
        const { error: uploadError } = await supabase.storage
          .from('item-photos')
          .upload(filePath, arrayBuffer, { contentType: 'image/jpeg' });
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('item-photos')
          .getPublicUrl(filePath);
          
        finalPhotoUrls.push(publicUrl);
      }

      const { error: updateError } = await supabase.from('items')
        .update({
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
          photos: finalPhotoUrls,
        })
        .eq('id', id);

      if (updateError) throw updateError;
      
      showToast('Changes saved!', 'success');
      setTimeout(() => router.back(), 900);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    setDeleteCountdown(5);
    setShowDeleteModal(true);
    deleteTimerRef.current = setInterval(() => {
      setDeleteCountdown(prev => {
        if (prev <= 1) {
          clearInterval(deleteTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const confirmDelete = async () => {
    clearInterval(deleteTimerRef.current);
    setShowDeleteModal(false);
    setDeleting(true);
    try {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) throw error;
      router.replace('/(tabs)');
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Failed to delete item', 'error');
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    clearInterval(deleteTimerRef.current);
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Item</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Skeleton width="40%" height={20} style={{ marginBottom: 16 }} />
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
            <Skeleton width={90} height={90} borderRadius={12} />
            <Skeleton width={90} height={90} borderRadius={12} />
          </View>
          
          <Skeleton width="30%" height={20} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={52} borderRadius={12} style={{ marginBottom: 16 }} />
          <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Skeleton width="100%" height={52} borderRadius={12} style={{ marginBottom: 16 }} />
            </View>
            <View style={{ flex: 1, paddingLeft: 8 }}>
              <Skeleton width="100%" height={52} borderRadius={12} style={{ marginBottom: 16 }} />
            </View>
          </View>
          <Skeleton width="100%" height={52} borderRadius={12} style={{ marginBottom: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Toast
        visible={!!toast}
        message={toast?.message || ''}
        type={toast?.type || 'success'}
        onHide={() => setToast(null)}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Item</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Photos</Text>
          <View style={styles.photosContainer}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoWrapper}>
                <Image source={{ uri: photo.uri }} style={styles.photo} />
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
              style={styles.input} 
              value={name} 
              onChangeText={setName} 
              placeholder="e.g. LDS S/S CHOC SIDE RUCHED..." 
              placeholderTextColor={C.textMuted} 
            />
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

        <TouchableOpacity 
          style={[styles.submitBtn, saving && styles.submitBtnDisabled]} 
          activeOpacity={0.85} 
          onPress={handleSubmit}
          disabled={saving || deleting}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteBtn} 
          activeOpacity={0.85} 
          onPress={handleDelete}
          disabled={saving || deleting}
        >
          {deleting ? (
            <ActivityIndicator color={C.error} />
          ) : (
            <Text style={styles.deleteBtnText}>Delete Item</Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} transparent animationType="slide" onRequestClose={cancelDelete}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalIconWrap}>
              <Ionicons name="trash-outline" size={32} color={C.error} />
            </View>
            <Text style={styles.modalTitle}>Delete this item?</Text>
            <Text style={styles.modalBody}>
              This action is permanent and cannot be undone. The item will be removed from your inventory.
            </Text>
            <TouchableOpacity
              style={[styles.modalDeleteBtn, deleteCountdown > 0 && styles.modalDeleteBtnDisabled]}
              onPress={confirmDelete}
              disabled={deleteCountdown > 0}
            >
              {deleteCountdown > 0 ? (
                <Text style={styles.modalDeleteBtnText}>Wait {deleteCountdown}s...</Text>
              ) : (
                <Text style={styles.modalDeleteBtnText}>Yes, Delete Permanently</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={cancelDelete}>
              <Text style={styles.modalCancelBtnText}>Keep Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.text },
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
  deleteBtn: { height: 56, backgroundColor: 'transparent', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12, borderWidth: 1, borderColor: C.error },
  deleteBtnText: { color: C.error, fontSize: 16, fontWeight: '700' },
  // Delete Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, alignItems: 'center' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, marginBottom: 24 },
  modalIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 8, textAlign: 'center' },
  modalBody: { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 28, paddingHorizontal: 8 },
  modalDeleteBtn: { width: '100%', height: 52, backgroundColor: C.error, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  modalDeleteBtnDisabled: { opacity: 0.45 },
  modalDeleteBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  modalCancelBtn: { width: '100%', height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  modalCancelBtnText: { color: C.text, fontSize: 16, fontWeight: '600' },
});
