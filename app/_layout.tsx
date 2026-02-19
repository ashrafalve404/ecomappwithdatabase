import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: true, title: 'Product Details' }} />
        <Stack.Screen name="cart" options={{ headerShown: true, title: 'Shopping Cart' }} />
        <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
      </Stack>
    </AuthProvider>
  );
}
