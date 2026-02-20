import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { productsAPI, cartAPI } from '../../api';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../../constants/theme';

interface Product {
  id: number;
  name: string;
  price: string;
  image?: string;
  description?: string;
  category?: string;
  in_stock?: boolean;
}

const ProductDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const productId = parseInt(id || '0');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productsAPI.getProductDetails(productId);
      setProduct(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      await cartAPI.addToCart(productId, 1);
      Alert.alert('Success', 'Product added to cart!', [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/cart') },
      ]);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.detail || 'Failed to add product to cart'
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.light.error} />
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchProductDetails()}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={48} color={Colors.light.iconSecondary} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          {product.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>{product.category}</Text>
            </View>
          )}
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.price}>${product.price}</Text>

          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {product.in_stock !== undefined && (
            <View style={styles.stockContainer}>
              <View
                style={[
                  styles.stockIndicator,
                  product.in_stock ? styles.inStock : styles.outOfStock,
                ]}
              />
              <Text
                style={[
                  styles.stockText,
                  product.in_stock ? styles.inStockText : styles.outOfStockText,
                ]}
              >
                {product.in_stock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.footerPriceLabel}>Price</Text>
          <Text style={styles.footerPrice}>${product.price}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            isAddingToCart && styles.addToCartButtonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator color={Colors.light.textInverse} />
          ) : (
            <>
              <Ionicons name="cart-outline" size={18} color={Colors.light.textInverse} style={styles.cartIcon} />
              <Text style={styles.addToCartText}>Add to Cart</Text>
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
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  retryText: {
    color: Colors.light.textInverse,
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.light.backgroundTertiary,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.backgroundTertiary,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  category: {
    fontSize: Typography.xs,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: Typography.medium,
  },
  productName: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    lineHeight: 30,
  },
  price: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.light.primary,
    marginBottom: Spacing.lg,
  },
  descriptionContainer: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.md,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.light.backgroundTertiary,
    borderRadius: BorderRadius.md,
  },
  stockIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  inStock: {
    backgroundColor: Colors.light.success,
  },
  outOfStock: {
    backgroundColor: Colors.light.error,
  },
  stockText: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  inStockText: {
    color: Colors.light.success,
  },
  outOfStockText: {
    color: Colors.light.error,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    backgroundColor: Colors.light.surface,
    ...Shadows.md,
  },
  priceContainer: {
    flex: 1,
  },
  footerPriceLabel: {
    fontSize: Typography.xs,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  footerPrice: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.light.text,
  },
  addToCartButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 6,
    borderRadius: BorderRadius.md,
    minWidth: 160,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addToCartButtonDisabled: {
    opacity: 0.6,
  },
  cartIcon: {
    marginRight: Spacing.sm,
  },
  addToCartText: {
    color: Colors.light.textInverse,
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
  },
});

export default ProductDetailsScreen;
