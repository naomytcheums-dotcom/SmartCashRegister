import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Image, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { getProductByBarcode } from '../database/db';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useStore } from '../context/StoreContext';
import { formatFCFA } from '../utils/format';
import { playBeep } from '../utils/sound';
import { lookupProductExternally } from '../utils/externalLookup';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [looking, setLooking] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const { addItem } = useCart();
  const { t } = useLanguage();
  const { currentStoreId } = useStore();
  const lockRef = useRef(false);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

  const handleScan = async ({ data }) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setScanned(true);

    try {
      const product = await getProductByBarcode(data, currentStoreId);

      if (product) {
        playBeep();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (product.stock <= 0) {
          setLastResult({ found: true, product, outOfStock: true });
        } else {
          addItem(product);
          setLastResult({ found: true, product, outOfStock: false });
        }
        return;
      }

      setLooking(true);
      const external = await lookupProductExternally(data);
      setLooking(false);

      if (external && external.name) {
        playBeep();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setLastResult({ found: false, barcode: data, external });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setLastResult({ found: false, barcode: data, external: null });
      }
    } catch (e) {
      setLooking(false);
      Alert.alert(t('error'), e.message);
    }
  };

  const scanAgain = () => {
    setScanned(false);
    setLastResult(null);
    lockRef.current = false;
  };

  const goToAddProduct = () => {
    navigation.navigate('AddProduct', {
      barcode: lastResult?.barcode,
      prefillName: lastResult?.external?.name,
      prefillDescription: lastResult?.external?.description,
      prefillWeight: lastResult?.external?.weight,
      prefillImage: lastResult?.external?.image,
    });
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>{t('scanCheckingPermission')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>{t('scanPermissionText')}</Text>
        <Pressable style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>{t('scanAllowCamera')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!scanned ? (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'qr', 'code128'],
          }}
          onBarcodeScanned={handleScan}
        >
          <View style={styles.overlay}>
            <View style={styles.frame} />
            <Text style={styles.hint}>{t('scanHint')}</Text>
          </View>
        </CameraView>
      ) : looking ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1B4332" />
          <Text style={{ marginTop: 12, color: '#666' }}>...</Text>
        </View>
      ) : (
        <View style={styles.resultCard}>
          {lastResult?.found ? (
            <>
              <Text style={styles.resultTitle}>
                {lastResult.outOfStock ? `⚠️ ${t('scanOutOfStock')}` : `✅ ${t('scanAdded')}`}
              </Text>

              {!!lastResult.product.image && (
                <Image source={{ uri: lastResult.product.image }} style={styles.productImage} />
              )}

              <Text style={styles.productName}>{lastResult.product.name}</Text>
              {!!lastResult.product.weight && (
                <Text style={styles.productWeight}>{lastResult.product.weight}</Text>
              )}
              {!!lastResult.product.description && (
                <Text style={styles.productDescription}>{lastResult.product.description}</Text>
              )}
              <Text style={styles.productPrice}>{formatFCFA(lastResult.product.price)}</Text>
              <Text style={styles.stockText}>
                {t('scanStockRemaining')}: {lastResult.product.stock}
              </Text>
            </>
          ) : lastResult?.external ? (
            <>
              <Text style={styles.resultTitle}>🌍 {t('scanExternalFound')}</Text>

              {!!lastResult.external.image && (
                <Image source={{ uri: lastResult.external.image }} style={styles.productImage} />
              )}

              <Text style={styles.productName}>{lastResult.external.name}</Text>
              {!!lastResult.external.weight && (
                <Text style={styles.productWeight}>{lastResult.external.weight}</Text>
              )}
              {!!lastResult.external.description && (
                <Text style={styles.productDescription} numberOfLines={2}>
                  {lastResult.external.description}
                </Text>
              )}
              <Text style={styles.hintText}>{t('scanExternalPrompt')}</Text>
            </>
          ) : (
            <>
              <Text style={styles.resultTitle}>❌ {t('scanUnknown')}</Text>
              <Text style={styles.stockText}>
                {t('scanBarcodeLabel')}: {lastResult?.barcode}
              </Text>
            </>
          )}

          {!lastResult?.found && (
            <Pressable style={styles.primaryButton} onPress={goToAddProduct}>
              <Text style={styles.primaryButtonText}>
                {lastResult?.external
                  ? `➕ ${t('scanUseThisProduct')}`
                  : `➕ ${t('scanAddThisProduct')}`}
              </Text>
            </Pressable>
          )}

          <Pressable
            style={lastResult?.found ? styles.primaryButton : styles.secondaryButton}
            onPress={scanAgain}
          >
            <Text
              style={lastResult?.found ? styles.primaryButtonText : styles.secondaryButtonText}
            >
              {t('scanAnother')}
            </Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.secondaryButtonText}>{t('viewCart')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  permText: { textAlign: 'center', marginBottom: 20, color: '#333' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  frame: { width: 250, height: 150, borderWidth: 3, borderColor: '#fff', borderRadius: 12 },
  hint: { color: '#fff', marginTop: 16, fontSize: 15 },
  resultCard: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  resultTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 12,
    backgroundColor: '#eee',
  },
  productName: { fontSize: 22, fontWeight: '600', textAlign: 'center' },
  productWeight: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 2 },
  productDescription: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
  },
  productPrice: { fontSize: 20, color: '#1B4332', textAlign: 'center', marginTop: 10 },
  stockText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  hintText: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 12, marginBottom: 24 },
  primaryButton: {
    backgroundColor: '#1B4332',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#1B4332',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: { color: '#1B4332', fontSize: 16, fontWeight: '700' },
});
