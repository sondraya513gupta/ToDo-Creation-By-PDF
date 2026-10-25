import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/colors';

export default function TodoItem({ todo, onToggleComplete, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const priorityColor =
    theme.priority[todo.priority?.toLowerCase()] || theme.priority.medium;

  const getSourceIcon = (source) => {
    switch (source) {
      case 'ai_plan':
        return { name: 'sparkles', color: theme.secondary, label: 'AI Plan' };
      case 'pdf_extract':
        return { name: 'document-text', color: theme.accent, label: 'PDF' };
      default:
        return { name: 'create', color: theme.primary, label: 'Manual' };
    }
  };

  const sourceInfo = getSourceIcon(todo.source);

  const confirmDelete = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${todo.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(todo.id),
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.card,
        todo.completed && styles.cardCompleted,
      ]}
    >
      <View style={styles.mainRow}>
        {/* Custom Checkbox */}
        <TouchableOpacity
          style={[
            styles.checkbox,
            todo.completed && styles.checkboxChecked,
          ]}
          onPress={() => onToggleComplete(todo.id, !todo.completed)}
          activeOpacity={0.7}
        >
          {todo.completed && (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        {/* Task Content */}
        <TouchableOpacity
          style={styles.contentArea}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.8}
        >
          <View style={styles.badgeRow}>
            {/* Priority Indicator */}
            <View
              style={[
                styles.badge,
                { backgroundColor: `${priorityColor}1F`, borderColor: priorityColor },
              ]}
            >
              <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
              <Text style={[styles.badgeText, { color: priorityColor }]}>
                {todo.priority?.toUpperCase()}
              </Text>
            </View>

            {/* Source Pill */}
            <View
              style={[
                styles.badge,
                { backgroundColor: `${sourceInfo.color}1F`, borderColor: sourceInfo.color },
              ]}
            >
              <Ionicons name={sourceInfo.name} size={10} color={sourceInfo.color} style={{ marginRight: 3 }} />
              <Text style={[styles.badgeText, { color: sourceInfo.color }]}>
                {sourceInfo.label}
              </Text>
            </View>

            {/* Category */}
            {todo.category ? (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{todo.category}</Text>
              </View>
            ) : null}
          </View>

          <Text
            style={[
              styles.title,
              todo.completed && styles.titleCompleted,
            ]}
          >
            {todo.title}
          </Text>

          {todo.description ? (
            <Text
              numberOfLines={expanded ? undefined : 2}
              style={[
                styles.description,
                todo.completed && styles.descriptionCompleted,
              ]}
            >
              {todo.description}
            </Text>
          ) : null}
        </TouchableOpacity>

        {/* Delete Action Button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={confirmDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={theme.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surfaceCard,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardCompleted: {
    opacity: 0.65,
    backgroundColor: theme.surface,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: theme.success,
    borderColor: theme.success,
  },
  contentArea: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  priorityDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  categoryPill: {
    backgroundColor: theme.surfaceElevated,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    lineHeight: 20,
    marginBottom: 3,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.textMuted,
  },
  description: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 17,
  },
  descriptionCompleted: {
    color: theme.textMuted,
  },
  deleteBtn: {
    padding: 4,
    marginTop: 2,
  },
});
