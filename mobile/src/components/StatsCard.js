import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/colors';

export default function StatsCard({ total = 0, completed = 0, pending = 0 }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>Task Completion</Text>
          <Text style={styles.percentageText}>{percent}%</Text>
        </View>
        <View style={styles.badgeWrapper}>
          <Text style={styles.fractionText}>{completed} of {total} done</Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.track}>
        <View style={[styles.progress, { width: `${percent}%` }]} />
      </View>

      {/* Stats Counter Pills */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Ionicons name="list" size={14} color={theme.primary} />
          </View>
          <View>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="time" size={14} color={theme.warning} />
          </View>
          <View>
            <Text style={styles.statNumber}>{pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="checkmark-done" size={14} color={theme.success} />
          </View>
          <View>
            <Text style={styles.statNumber}>{completed}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surfaceCard,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  percentageText: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.text,
  },
  badgeWrapper: {
    backgroundColor: theme.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  fractionText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  track: {
    height: 8,
    backgroundColor: theme.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progress: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
  },
  statLabel: {
    fontSize: 10,
    color: theme.textMuted,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: theme.border,
  },
});
