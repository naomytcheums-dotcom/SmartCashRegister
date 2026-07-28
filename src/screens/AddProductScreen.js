import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { addProduct } from '../database/db';
import { useLanguage } from '../i18n/LanguageContext';
import { useStore } from '../context/StoreContext';

export default function AddProductScreen({ navigation, route }) {
  const { t } = useLanguage();
  const { currentStoreId } = useStore();
  const params = route.params || {};

  const [barcode, setBarcode] = useState(params.barcode ?? '');
  const [name, setName] = useState(params.prefillName ?? '');
  const [description, setDescription] = useState(params.prefillDescription ?? '');
  const [weight, setWeight] = useState(params.prefillWeight ?? '');
  const [image, setImage] = useState(params.prefillImage ?? '');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [stock, setStock] = useState('');
  const [saving, setSaving] = useState(false);

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('error'), t('scanPermissionText'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('error'), t('scanPermissionText'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!barcode.trim() || !name.trim() || !price.trim() || !stock.trim()) {
      Alert.alert(t('error'), t('addProductMissingFields'));
      return;
    }

    const priceNumber = parseFloat(price.replace(',', '.'));
    const stockNumber = parseInt(stock, 10);

    if (isNaN(priceNumber) || priceNumber < 0) {
      Alert.alert(t('error'), t('addProductInvalidPrice'));
      return;
    }
    if (isNaN(stockNumber) || stockNumber < 0) {
      Alert.alert(t('error'), t('addProductInvalidStock'));
      return;
    }

    setSaving(true);
    try {
      await addProduct({
        storeId: currentStoreId,
        barcode: barcode.trim(),
        name: name.trim(),
        description: description.trim(),
        weight: weight.trim(),
        image: image.trim(),
        price: priceNumber,
        costPrice: costPrice.trim() ? parseFloat(costPrice.replace(',', '.')) : 0,
        supplierName: supplierName.trim(),
        stock: stockNumber,
      });
      Alert.alert(t('addProductTitle'), `${name.trim()} ${t('addProductSuccess')}`, [
        { text: t('ok'), onPress: () => navigation.navigate('Scan') },
      ]);
    } catch (e) {
      if (e.message?.includes('UNIQUE constraint failed')) {
        Alert.alert(t('error'), t('addProductDuplicate'));
      } else {
        Alert.alert(t('error'), e.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('addProductTitle')}</Text>
        <Text style={styles.subtitle}>{t('addProductSubtitle')}</Text>

        <View style={styles.imageSection}>
          {!!image ? (
            <Image source={{ uri: image }} style={styles.preview} />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Text style={{ fontSize: 32 }}>📷</Text>
            </View>
          )}
          <View style={styles.imageButtonsRow}>
            <Pressable style={styles.imageButton} onPress={pickFromGallery}>
              <Text style={styles.imageButtonText}>🖼️ {t('pickFromGallery')}</Text>
            </Pressable>
            <Pressable style={styles.imageButton} onPress={takePhoto}>
              <Text style={styles.imageButtonText}>📸 {t('takePhoto')}</Text>
            </Pressable>
          </View>
          {!!image && (
            <Pressable onPress={() => setImage('')}>
              <Text style={styles.removeImageText}>{t('removeImage')}</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.label}>{t('addProductBarcode')}</Text>
        <TextInput
          style={styles.input}
          value={barcode}
          onChangeText={setBarcode}
          placeholder="Ex: 3017620422003"
          keyboardType="number-pad"
        />

        <Text style={styles.label}>{t('addProductName')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Eau minérale 1.5L"
        />

        <Text style={styles.label}>{t('addProductDescription')}</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Ex: Eau de source naturelle"
          multiline
        />

        <Text style={styles.label}>{t('addProductWeight')}</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="Ex: 1.5 L"
        />

        <Text style={styles.label}>{t('addProductPrice')}</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="Ex: 500"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>{t('addProductCostPrice')}</Text>
        <TextInput
          style={styles.input}
          value={costPrice}
          onChangeText={setCostPrice}
          placeholder="Ex: 320"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>{t('addProductSupplier')}</Text>
        <TextInput
          style={styles.input}
          value={supplierName}
          onChangeText={setSupplierName}
          placeholder="Ex: Grossiste Central SARL"
        />

        <Text style={styles.label}>{t('addProductStock')}</Text>
        <TextInput
          style={styles.input}
          value={stock}
          onChangeText={setStock}
          placeholder="Ex: 50"
          keyboardType="number-pad"
        />

        <Pressable
          style={[styles.primaryButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>
            {saving ? t('addProductSaving') : t('addProductSave')}
          </Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>{t('addProductCancel')}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '800', color: '#1B4332' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 16 },
  imageSection: { alignItems: 'center', marginBottom: 8 },
  preview: {
    width: 110,
    height: 110,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#eee',
  },
  previewPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtonsRow: { flexDirection: 'row', gap: 10 },
  imageButton: {
    borderWidth: 1,
    borderColor: '#1B4332',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  imageButtonText: { fontSize: 12, color: '#1B4332', fontWeight: '600' },
  removeImageText: { fontSize: 12, color: '#c0392b', marginTop: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  multiline: { minHeight: 60, textAlignVertical: 'top' },
  primaryButton: {
    backgroundColor: '#1B4332',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#1B4332',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: { color: '#1B4332', fontSize: 15, fontWeight: '700' },
});
