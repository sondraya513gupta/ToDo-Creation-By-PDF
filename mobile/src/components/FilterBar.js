import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/colors';

const CATEGORIES = ['All', 'AI Plan', 'PDF Extracted', 'General', 'Work', 'Study'];

export default function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  statusFilter,
  onSelectStatus,
}) {
  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={theme.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks, notes or milestones..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => onSearchChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Status Segmented Buttons */}
      <View style={styles.statusSegment}>
        <TouchableOpacity
          style={[
            styles.segmentBtn,
            statusFilter === 'all' && styles.segmentBtnActive,
          ]}
          onPress={() => onSelectStatus('all')}
        >
          <Text
            style={[
              styles.segmentText,
              statusFilter === 'all' && styles.segmentTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            statusFilter === 'pending' && styles.segmentBtnActive,
          ]}
          onPress={() => onSelectStatus('pending')}
        >
          <Text
            style={[
              styles.segmentText,
              statusFilter === 'pending' && styles.segmentTextActive,
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            statusFilter === 'completed' && styles.segmentBtnActive,
          ]}
          onPress={() => onSelectStatus('completed')}
        >
          <Text
            style={[
              styles.segmentText,
              statusFilter === 'completed' && styles.segmentTextActive,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Horizontal Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => onSelectCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.text,
    fontSize: 13,
    padding: 0,
  },
  statusSegment: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: theme.primary,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: theme.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.border,
  },
  pillActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: theme.primary,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  pillTextActive: {
    color: theme.primary,
  },
});
