import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { cartAPI, ordersAPI } from '../../api';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../../constants/theme';

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: string;
  };
  quantity: number;
  subtotal: string;
}

const CheckoutScreen: React.FC = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await cartAPI.getCart();
      setCartItems(response.items || response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + parseFloat(item.subtotal),
      0
    );
  };

  const shippingCost = calculateSubtotal() > 100 ? 0 : 10;
  const tax = calculateSubtotal() * 0.08;
  const total = calculateSubtotal() + shippingCost + tax;

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      Alert.alert('Error', 'Please enter your shipping address');
      return;
    }

    try {
      setIsPlacingOrder(true);
      const response = await ordersAPI.createOrder({
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
      });

      Alert.alert(
        'Order Placed!',
        'Your order has been placed successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.detail || 'Failed to place order. Please try again.'
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.light.error} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="cart-outline" size={48} color={Colors.light.iconSecondary} />
        <Text style={styles.errorText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.back()}
        >
          <Text style={styles.shopButtonText}>Go to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <TextInput
            style={styles.addressInput}
            value={shippingAddress}
            onChangeText={setShippingAddress}
            placeholder="Enter your full shipping address"
            placeholderTextColor={Colors.light.placeholder}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'cash_on_delivery' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod('cash_on_delivery')}
          >
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radio,
                  paymentMethod === 'cash_on_delivery' && styles.radioSelected,
                ]}
              >
                {paymentMethod === 'cash_on_delivery' && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Ionicons name="cash-outline" size={20} color={Colors.light.textSecondary} style={styles.paymentIcon} />
              <Text style={styles.paymentText}>Cash on Delivery</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'card' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radio,
                  paymentMethod === 'card' && styles.radioSelected,
                ]}
              >
                {paymentMethod === 'card' && <View style={styles.radioInner} />}
              </View>
              <Ionicons name="card-outline" size={20} color={Colors.light.textSecondary} style={styles.paymentIcon} />
              <Text style={styles.paymentText}>Credit/Debit Card</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.summaryItem}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.product.name} x {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>${item.subtotal}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              ${calculateSubtotal().toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={[
              styles.totalValue,
              shippingCost === 0 && styles.freeShipping
            ]}>
              {shippingCost === 0 ? 'Free' : `${shippingCost.toFixed(2)}`}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax (8%)</Text>
            <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, isPlacingOrder && styles.buttonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? (
            <ActivityIndicator color={Colors.light.textInverse} />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.light.textInverse} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: Typography.md,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  shopButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  shopButtonText: {
    color: Colors.light.textInverse,
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 140,
  },
  section: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  addressInput: {
    backgroundColor: Colors.light.backgroundTertiary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.md,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minHeight: 100,
  },
  paymentOption: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.sm,
  },
  paymentOptionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}10`,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: Colors.light.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },
  paymentIcon: {
    marginRight: Spacing.sm,
  },
  paymentText: {
    fontSize: Typography.md,
    color: Colors.light.text,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  itemName: {
    fontSize: Typography.sm,
    color: Colors.light.textSecondary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemPrice: {
    fontSize: Typography.sm,
    color: Colors.light.text,
    fontWeight: Typography.medium,
  },
  totalsSection: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  totalLabel: {
    fontSize: Typography.sm,
    color: Colors.light.textSecondary,
  },
  totalValue: {
    fontSize: Typography.sm,
    color: Colors.light.text,
  },
  freeShipping: {
    color: Colors.light.success,
    fontWeight: Typography.medium,
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    marginBottom: 0,
  },
  grandTotalLabel: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.light.text,
  },
  grandTotalValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.light.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    ...Shadows.md,
  },
  placeOrderButton: {
    backgroundColor: Colors.light.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: Colors.light.textInverse,
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    marginRight: Spacing.sm,
  },
});

export default CheckoutScreen;
