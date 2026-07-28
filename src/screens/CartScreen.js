import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput, Image } from 'react-native';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../i18n/LanguageContext';
import { formatFCFA } from '../utils/format';

export default function CartScreen({ navigation }) {
  const { items, updateQuantity, removeItem, subtotal, discount, setDiscount, discountAmount, total } =
    useCart();
  const { t } = useLanguage();
  const [discountInput, setDiscountInput] = useState(String(discount.value || ''));

  const applyDiscountType = (type) => {
    setDiscount((prev) => ({ ...prev, type }));
  };

  const applyDiscountValue = (text) => {
    setDiscountInput(text);
    const value = parseFloat(text.replace(',', '.'));
    setDiscount((prev) => ({ ...prev, value: isNaN(value) ? 0 : value }));
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{t('cartEmpty')}</Text>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Scan')}>
          <Text style={styles.primaryButtonText}>{t('cartScanProduct')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {!!item.image && <Image source={{ uri: item.image }} style={styles.thumb} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.unitPrice}>
                {formatFCFA(item.price)} / {t('cartUnitPrice')}
              </Text>
            </View>
            <View style={styles.qtyControls}>
              <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                <Text style={styles.qtyBtnText}>−</Text>
              </Pressable>
              <Text style={styles.qty}>{item.quantity}</Text>
              <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>
            <Text style={styles.lineTotal}>{formatFCFA(item.price * item.quantity)}</Text>
            <Pressable onPress={() => removeItem(item.id)}>
              <Text style={styles.remove}>✕</Text>
            </Pressable>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.discountBox}>
            <Text style={styles.discountLabel}>{t('cartDiscount')}</Text>
            <View style={styles.discountRow}>
              <Pressable
                style={[styles.discountTypeBtn, discount.type === 'percent' && styles.discountTypeActive]}
                onPress={() => applyDiscountType('percent')}
              >
                <Text
                  style={[
                    styles.discountTypeText,
                    discount.type === 'percent' && styles.discountTypeTextActive,
                  ]}
                >
                  %
                </Text>
              </Pressable>
              <Pressable
                style={[styles.discountTypeBtn, discount.type === 'amount' && styles.discountTypeActive]}
                onPress={() => applyDiscountType('amount')}
              >
                <Text
                  style={[
                    styles.discountTypeText,
                    discount.type === 'amount' && styles.discountTypeTextActive,
                  ]}
                >
                  FCFA
                </Text>
              </Pressable>
              <TextInput
                style={styles.discountInput}
                keyboardType="decimal-pad"
                value={discountInput}
                onChangeText={applyDiscountValue}
                placeholder="0"
              />
            </View>
          </View>
        }
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.subtotalLabel}>{t('cartSubtotal')}</Text>
          <Text style={styles.subtotalValue}>{formatFCFA(subtotal)}</Text>
        </View>
        {discountAmount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.subtotalLabel}>{t('cartDiscount')}</Text>
            <Text style={styles.discountValue}>-{formatFCFA(discountAmount)}</Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('cartTotal')}</Text>
          <Text style={styles.totalValue}>{formatFCFA(total)}</Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Ticket')}>
          <Text style={styles.primaryButtonText}>{t('cartValidate')}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Scan')}>
          <Text style={styles.secondaryButtonText}>{t('cartAddProduct')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 16, color: '#666', marginBottom: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  thumb: { width: 40, height: 40, borderRadius: 8, marginRight: 10, backgroundColor: '#eee' },
  name: { fontSize: 15, fontWeight: '600' },
  unitPrice: { fontSize: 12, color: '#888', marginTop: 2 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F8F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: '#1B4332' },
  qty: { width: 28, textAlign: 'center', fontSize: 15, fontWeight: '600' },
  lineTotal: { width: 70, textAlign: 'right', fontWeight: '700', fontSize: 14 },
  remove: { marginLeft: 10, color: '#c0392b', fontSize: 16 },
  discountBox: { marginTop: 16, padding: 12, backgroundColor: '#F8F8F8', borderRadius: 12 },
  discountLabel: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 8 },
  discountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  discountTypeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  discountTypeActive: { backgroundColor: '#1B4332', borderColor: '#1B4332' },
  discountTypeText: { fontSize: 13, fontWeight: '700', color: '#555' },
  discountTypeTextActive: { color: '#fff' },
  discountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  subtotalLabel: { fontSize: 14, color: '#777' },
  subtotalValue: { fontSize: 14, color: '#777' },
  discountValue: { fontSize: 14, color: '#c0392b', fontWeight: '600' },
  totalLabel: { fontSize: 16, color: '#444', marginTop: 6 },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#1B4332', marginTop: 6 },
  primaryButton: {
    backgroundColor: '#1B4332',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#1B4332',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#1B4332', fontSize: 15, fontWeight: '700' },
});
