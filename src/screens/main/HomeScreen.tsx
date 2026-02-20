import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { productsAPI, categoriesAPI } from '../../api';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../../constants/theme';

interface Product {
  id: number;
  name: string;
  price: string;
  image?: string;
  description?: string;
  category?: number;
  category_name?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await productsAPI.getProducts();
      setProducts(response.results || response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load products');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.results || response);
    } catch (err: any) {
      console.log('Failed to load categories:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
      fetchCategories();
    }, [])
  );

  const handleRefresh = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    fetchProducts(true);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchProducts();
      return;
    }

    try {
      setIsSearching(true);
      setSelectedCategory(null);
      const response = await productsAPI.searchProducts(searchQuery.trim());
      setProducts(response.results || response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to search products');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategorySelect = async (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');

    if (categoryId === null) {
      fetchProducts();
      return;
    }

    try {
      setIsSearching(true);
      const response = await productsAPI.getProductsByCategory(categoryId);
      setProducts(response.results || response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to filter products');
    } finally {
      setIsSearching(false);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}` as any)}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={32} color={Colors.light.iconSecondary} />
            </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.headerTitle}>Shop</Text>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <Ionicons name="cart-outline" size={22} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.light.iconSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={Colors.light.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                fetchProducts();
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={18} color={Colors.light.iconSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === null && styles.categoryChipActive,
              ]}
              onPress={() => handleCategorySelect(null)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === null && styles.categoryChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category.id && styles.categoryChipTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results Info */}
      {(searchQuery || selectedCategory) && (
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Text style={styles.clearFilters}>Clear filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (error && !products.length) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.light.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchProducts()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.light.primary]}
            tintColor={Colors.light.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={Colors.light.iconSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory
                ? 'No products found'
                : 'No products available'}
            </Text>
          </View>
        }
      />
      {isSearching && (
        <View style={styles.searchingOverlay}>
          <ActivityIndicator size="small" color={Colors.light.primary} />
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.surface,
  },
  greeting: {
    fontSize: Typography.sm,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.light.text,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.light.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundTertiary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    fontSize: Typography.md,
    color: Colors.light.text,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  categoriesContainer: {
    backgroundColor: Colors.light.surface,
    paddingBottom: Spacing.md,
  },
  categoriesScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.backgroundTertiary,
    marginRight: Spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
  },
  categoryChipText: {
    fontSize: Typography.sm,
    color: Colors.light.textSecondary,
    fontWeight: Typography.medium,
  },
  categoryChipTextActive: {
    color: Colors.light.textInverse,
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surface,
  },
  resultsText: {
    fontSize: Typography.sm,
    color: Colors.light.textSecondary,
  },
  clearFilters: {
    fontSize: Typography.sm,
    color: Colors.light.primary,
    fontWeight: Typography.medium,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
    overflow: 'hidden',
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
  productInfo: {
    padding: Spacing.sm + 4,
  },
  productName: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    height: 36,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: Colors.light.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: Typography.md,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
  searchingOverlay: {
    position: 'absolute',
    top: Spacing.xl + 60,
    alignSelf: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadows.md,
  },
});

export default HomeScreen;
