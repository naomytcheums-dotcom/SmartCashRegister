import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { initDatabase } from './src/database/db';
import { CartProvider } from './src/context/CartContext';
import { StoreProvider } from './src/context/StoreContext';
import { LanguageProvider } from './src/i18n/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initDatabase()
      .then(() => setReady(true))
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>Database error: {error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🛒</Text>
        </View>
        <Text style={styles.brand}>SmartCashRegister</Text>
        <Text style={styles.tagline}>Smart mobile checkout</Text>
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 32 }} />
        <Text style={styles.loadingText}>Starting up...</Text>
      </View>
    );
  }

  return (
    <LanguageProvider>
      <StoreProvider>
        <CartProvider>
          <AppNavigator />
        </CartProvider>
      </StoreProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: '#1B4332',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoEmoji: { fontSize: 44 },
  brand: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6 },
  loadingText: { color: 'rgba(255,255,255,0.7)', marginTop: 14, fontSize: 13 },
  errorScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  errorEmoji: { fontSize: 40, marginBottom: 12 },
  errorText: { color: '#c0392b', textAlign: 'center', fontSize: 15 },
});
