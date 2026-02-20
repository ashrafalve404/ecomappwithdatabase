import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../../constants/theme';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const MenuItem = ({
    icon,
    title,
    onPress,
    showArrow = true,
  }: {
    icon: React.ReactNode;
    title: string;
    onPress: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        {icon}
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
      {showArrow && <Ionicons name="chevron-forward" size={18} color={Colors.light.iconSecondary} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>
          {user?.first_name && user?.last_name
            ? `${user.first_name} ${user.last_name}`
            : user?.email || 'User'}
        </Text>
        {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Account</Text>
        <MenuItem
          icon={<Ionicons name="receipt-outline" size={20} color={Colors.light.primary} />}
          title="My Orders"
          onPress={() => router.push('/orders')}
        />
        <MenuItem
          icon={<Ionicons name="cart-outline" size={20} color={Colors.light.primary} />}
          title="My Cart"
          onPress={() => router.push('/cart')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <MenuItem
          icon={<Ionicons name="notifications-outline" size={20} color={Colors.light.primary} />}
          title="Notifications"
          onPress={() => Alert.alert('Coming Soon', 'Notifications settings')}
        />
        <MenuItem
          icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.light.primary} />}
          title="Privacy & Security"
          onPress={() => Alert.alert('Coming Soon', 'Privacy settings')}
        />
        <MenuItem
          icon={<Ionicons name="help-circle-outline" size={20} color={Colors.light.primary} />}
          title="Help & Support"
          onPress={() => Alert.alert('Coming Soon', 'Help center')}
        />
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color={Colors.light.error} />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color={Colors.light.error} style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    color: Colors.light.textInverse,
  },
  userName: {
    fontSize: Typography.xl,
    fontWeight: Typography.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: Typography.sm,
    color: Colors.light.textSecondary,
  },
  section: {
    backgroundColor: Colors.light.surface,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.light.textSecondary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuTitle: {
    flex: 1,
    fontSize: Typography.md,
    color: Colors.light.text,
  },
  logoutButton: {
    backgroundColor: Colors.light.surface,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutIcon: {
    marginRight: Spacing.sm,
  },
  logoutText: {
    color: Colors.light.error,
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
  },
  footer: {
    alignItems: 'center',
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  versionText: {
    fontSize: Typography.sm,
    color: Colors.light.textTertiary,
  },
});

export default ProfileScreen;
