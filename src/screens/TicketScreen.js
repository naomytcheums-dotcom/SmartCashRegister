import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useStore } from '../context/StoreContext';
import { formatFCFA } from '../utils/format';
import { formatDateTime } from '../utils/formatDate';
import { computePointsEarned } from '../utils/loyalty';
import { decrementStock, recordSale, addPointsToCustomer } from '../database/db';

export default function TicketScreen({ navigation }) {
  const { items, subtotal, discountAmount, total, clearCart } = useCart();
  const { t } = useLanguage();
  const { currentStoreId } = useStore();
  const [paid, setPaid] = useState(false);
  const [ticketDate] = useState(new Date());
  const [customerPhone, setCustomerPhone] = useState('');
  const [pointsEarned, setPointsEarned] = useState(0);

  const handlePay = async () => {
    for (const item of items) {
      await decrementStock(item.id, item.quantity);
    }

    const earned = computePointsEarned(total);

    await recordSale({
      storeId: currentStoreId,
      items: items.map((i) => ({
        name: i.name,
        price: i.price,
        costPrice: i.cost_price || 0,
        quantity: i.quantity,
      })),
      subtotal,
      discount: discountAmount,
      total,
      customerPhone: customerPhone.trim() || null,
      pointsEarned: customerPhone.trim() ? earned : 0,
    });

    if (customerPhone.trim()) {
      await addPointsToCustomer(customerPhone.trim(), earned);
      setPointsEarned(earned);
    }

    setPaid(true);
  };

  const handleNewSale = () => {
    clearCart();
    navigation.navigate('Home');
  };

  const buildTicketHtml = () => {
    const rows = items
      .map(
        (item) =>
          `<tr><td>${item.quantity}x ${item.name}</td><td style="text-align:right">${formatFCFA(
            item.price * item.quantity
          )}</td></tr>`
      )
      .join('');

    return `
      <html>
        <body style="font-family: -apple-system, sans-serif; padding: 24px;">
          <h2 style="text-align:center; color:#1B4332;">🧾 SmartCashRegister</h2>
          <p style="text-align:center; color:#888; font-size:12px;">${formatDateTime(ticketDate)}</p>
          <table style="width:100%; border-collapse:collapse; margin-top:16px;">
            ${rows}
          </table>
          <hr />
          <table style="width:100%;">
            <tr><td>${t('cartSubtotal')}</td><td style="text-align:right">${formatFCFA(subtotal)}</td></tr>
            ${
              discountAmount > 0
                ? `<tr><td>${t('cartDiscount')}</td><td style="text-align:right">-${formatFCFA(discountAmount)}</td></tr>`
                : ''
            }
            <tr><td style="font-weight:bold;">${t('cartTotal')}</td><td style="text-align:right; font-weight:bold;">${formatFCFA(total)}</td></tr>
          </table>
        </body>
      </html>
    `;
  };

  const handleExportPdf = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: buildTicketHtml() });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert(t('ticketExportPdf'), uri);
      }
    } catch (e) {
      Alert.alert(t('error'), e.message);
    }
  };

  if (items.length === 0 && !paid) {
    return (
      <View style={styles.center}>
        <Text>{t('ticketNoItems')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.ticket}>
        <Text style={styles.storeName}>🧾 SmartCashRegister</Text>
        <Text style={styles.date}>{formatDateTime(ticketDate)}</Text>

        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.line}>
              <Text style={styles.lineName}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.lineAmount}>{formatFCFA(item.price * item.quantity)}</Text>
            </View>
          )}
        />

        <View style={styles.divider} />

        <View style={styles.line}>
          <Text style={styles.subLabel}>{t('cartSubtotal')}</Text>
          <Text style={styles.subAmount}>{formatFCFA(subtotal)}</Text>
        </View>
        {discountAmount > 0 && (
          <View style={styles.line}>
            <Text style={styles.subLabel}>{t('ticketDiscountApplied')}</Text>
            <Text style={styles.subAmount}>-{formatFCFA(discountAmount)}</Text>
          </View>
        )}
        <View style={styles.line}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalAmount}>{formatFCFA(total)}</Text>
        </View>

        {paid && (
          <>
            <Text style={styles.paidBadge}>✅ {t('ticketPaid')}</Text>
            {pointsEarned > 0 && (
              <Text style={styles.pointsBadge}>
                🎁 +{pointsEarned} {t('ticketPointsEarned')}
              </Text>
            )}
          </>
        )}
      </View>

      {!paid && (
        <View style={styles.customerBox}>
          <Text style={styles.customerLabel}>{t('ticketCustomerPhone')}</Text>
          <TextInput
            style={styles.customerInput}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            placeholder={t('ticketCustomerPhonePlaceholder')}
            keyboardType="phone-pad"
          />
        </View>
      )}

      {!paid ? (
        <Pressable style={styles.primaryButton} onPress={handlePay}>
          <Text style={styles.primaryButtonText}>
            💳 {t('ticketPay')} {formatFCFA(total)}
          </Text>
        </Pressable>
      ) : (
        <>
          <Pressable style={styles.secondaryButton} onPress={handleExportPdf}>
            <Text style={styles.secondaryButtonText}>📄 {t('ticketExportPdf')}</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={handleNewSale}>
            <Text style={styles.primaryButtonText}>{t('ticketNewSale')}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, justifyContent: 'space-between' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ticket: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  storeName: { fontSize: 18, fontWeight: '800', textAlign: 'center', color: '#1B4332' },
  date: { fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 16 },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  lineName: { fontSize: 14, color: '#333', flex: 1 },
  lineAmount: { fontSize: 14, fontWeight: '600' },
  subLabel: { fontSize: 13, color: '#888' },
  subAmount: { fontSize: 13, color: '#888' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '800', marginTop: 6 },
  totalAmount: { fontSize: 16, fontWeight: '800', color: '#1B4332', marginTop: 6 },
  paidBadge: { textAlign: 'center', marginTop: 16, color: '#2d9d5f', fontWeight: '700', fontSize: 15 },
  pointsBadge: { textAlign: 'center', marginTop: 6, color: '#b8860b', fontWeight: '700', fontSize: 14 },
  customerBox: { marginTop: 16 },
  customerLabel: { fontSize: 13, color: '#555', marginBottom: 6 },
  customerInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: '#1B4332',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#1B4332',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButtonText: { color: '#1B4332', fontSize: 15, fontWeight: '700' },
});
