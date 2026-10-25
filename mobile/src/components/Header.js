import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/colors';

export default function Header({ isOnline, onOpenServerConfig, onRefresh, isRefreshing }) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.logoBadge}>
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.titleTextContainer}>
          <Text style={styles.title}>ToDoFlow AI</Text>
          <Text style={styles.subtitle}>Smart Tasks & Document Agent</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.statusPill,
            isOnline ? styles.statusPillOnline : styles.statusPillOffline,
          ]}
          onPress={onOpenServerConfig}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? theme.success : theme.danger },
            ]}
          />
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Ionicons name="settings-outline" size={13} color={theme.textSecondary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={onRefresh}
          disabled={isRefreshing}
          activeOpacity={0.7}
        >
          <Ionicons
            name="refresh"
            size={18}
            color={isRefreshing ? theme.primary : theme.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  titleTextContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    color: theme.textMuted,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusPillOnline: {
    backgroundColor: theme.successSurface,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusPillOffline: {
    backgroundColor: theme.dangerSurface,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
});
