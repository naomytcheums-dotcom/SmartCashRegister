import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useLanguage } from '../i18n/LanguageContext';

import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import CartScreen from '../screens/CartScreen';
import TicketScreen from '../screens/TicketScreen';
import AddProductScreen from '../screens/AddProductScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { t } = useLanguage();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#1B4332' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: t('appName') }} />
        <Stack.Screen name="Scan" component={ScanScreen} options={{ title: t('scanProduct') }} />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: t('viewCart') }} />
        <Stack.Screen name="Ticket" component={TicketScreen} options={{ title: t('ticketTitle') }} />
        <Stack.Screen
          name="AddProduct"
          component={AddProductScreen}
          options={{ title: t('addProduct') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
