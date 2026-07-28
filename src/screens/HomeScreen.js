import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useStore } from '../context/StoreContext';
import { getLowStockProducts } from '../database/db';
import { formatFCFA } from '../utils/format';
import { logDashboardToTerminal, logHistoryToTerminal } from '../utils/terminalReports';
import { exportSalesToCsv } from '../utils/exportCsv';

export default function HomeScreen({ navigation }) {
  const { items, total } = useCart();
  const { t, language, toggleLanguage } = useLanguage();
  const { stores, currentStoreId, setCurrentStoreId, currentStore } = useStore();
  const [lowStockCount, setLowStockCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!currentStoreId) return;
      getLowStockProducts(currentStoreId, 5).then((rows) => setLowStockCount(rows.length));
    }, [currentStoreId])
  );

  const handleShowDashboard = async () => {
    await logDashboardToTerminal(currentStoreId);
    Alert.alert('📊 ' + t('viewStats'), t('checkTerminal'));
  };

  const handleShowHistory = async () => {
    await logHistoryToTerminal(currentStoreId);
    Alert.alert('🧾 ' + t('viewHistory'), t('checkTerminal'));
  };

  const handleExportCsv = async () => {
    await exportSalesToCsv(currentStoreId);
  };

  const handleSwitchStore = () => {
    if (stores.length < 2) return;
    Alert.alert(
      t('switchStore'),
      '',
      stores.map((s) => ({
        text: s.name + (s.id === currentStoreId ? ' ✓' : ''),
        onPress: () => setCurrentStoreId(s.id),
      }))
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.langButton} onPress={toggleLanguage}>
          <Text style={styles.langButtonText}>{language === 'en' ? '🇬🇧 EN' : '🇫🇷 FR'}</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🛒</Text>
        <Text style={styles.title}>{t('appName')}</Text>
        <Text style={styles.subtitle}>{t('appTagline')}</Text>
      </View>

      {stores.length > 1 && (
        <Pressable style={styles.storeBadge} onPress={handleSwitchStore}>
          <Text style={styles.storeBadgeText}>
            🏬 {currentStore?.name || '...'}  ·  {t('switchStore')}
          </Text>
        </Pressable>
      )}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          {items.length} {t('itemsInCart')}
        </Text>
        <Text style={styles.summaryTotal}>{formatFCFA(total)}</Text>
      </View>

      {lowStockCount > 0 && (
        <Pressable style={styles.alertBanner} onPress={() => navigation.navigate('AddProduct')}>
          <Text style={styles.alertText}>
            ⚠️ {lowStockCount} {t('lowStockAlert')}
          </Text>
        </Pressable>
      )}

      <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Scan')}>
        <Text style={styles.primaryButtonText}>📷  {t('scanProduct')}</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Cart')}>
        <Text style={styles.secondaryButtonText}>🛍️  {t('viewCart')}</Text>
      </Pressable>

      <View style={styles.grid}>
        <Pressable style={styles.gridCard} onPress={handleShowDashboard}>
          <Text style={styles.gridEmoji}>📊</Text>
          <Text style={styles.gridLabel}>{t('viewStats')}</Text>
          <Text style={styles.gridHint}>» {t('checkTerminal')}</Text>
        </Pressable>
        <Pressable style={styles.gridCard} onPress={handleShowHistory}>
          <Text style={styles.gridEmoji}>🧾</Text>
          <Text style={styles.gridLabel}>{t('viewHistory')}</Text>
          <Text style={styles.gridHint}>» {t('checkTerminal')}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.csvButton} onPress={handleExportCsv}>
        <Text style={styles.csvButtonText}>📤 {t('exportCsv')}</Text>
      </Pressable>

      <Pressable
        style={styles.tertiaryButton}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={styles.tertiaryButtonText}>➕  {t('addProduct')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const GREEN = '#1B4332';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GREEN },
  container: { padding: 24, paddingBottom: 40, flexGrow: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  langButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  langButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  hero: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  heroEmoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 4 },
  storeBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  storeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  summaryText: { fontSize: 14, color: '#555' },
  summaryTotal: { fontSize: 30, fontWeight: '800', color: GREEN, marginTop: 4 },
  alertBanner: {
    backgroundColor: '#FFF3CD',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    alignItems: 'center',
  },
  alertText: { color: '#8a6d1a', fontWeight: '700', fontSize: 13 },
  primaryButton: {
    backgroundColor: '#F4A300',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  primaryButtonText: { color: '#1B4332', fontSize: 17, fontWeight: '800' },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  secondaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  gridCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  gridEmoji: { fontSize: 26, marginBottom: 6 },
  gridLabel: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  gridHint: { color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 4, textAlign: 'center' },
  csvButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  csvButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tertiaryButton: { alignItems: 'center', marginTop: 12 },
  tertiaryButtonText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
});
