import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/colors';

const PROMPT_SUGGESTIONS = [
  'Build and deploy a mobile app in 7 days',
  'Prepare for technical interview in 2 weeks',
  'Launch product landing page and marketing funnel',
  'Organize weekly team sprints and backlog',
];

export default function AiPlanModal({ visible, onClose, onGenerate, isLoading }) {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('AI Plan');

  const handleGenerate = () => {
    if (!prompt.trim() || isLoading) return;
    onGenerate(prompt.trim(), category);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleWithIcon}>
              <View style={styles.iconBox}>
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>AI Task Planner</Text>
                <Text style={styles.headerSub}>Breakdown any objective with Gemini AI</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Your Goal or Objective *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g., Plan complete roadmap for building a SaaS startup MVP in 30 days..."
              placeholderTextColor={theme.textMuted}
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={4}
              editable={!isLoading}
            />

            <Text style={styles.label}>Inspiration Ideas (Tap to use)</Text>
            <View style={styles.suggestionsContainer}>
              {PROMPT_SUGGESTIONS.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionChip}
                  onPress={() => setPrompt(item)}
                  disabled={isLoading}
                >
                  <Ionicons name="arrow-forward-circle" size={14} color={theme.secondary} />
                  <Text style={styles.suggestionText} numberOfLines={1}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.generateBtn,
                (!prompt.trim() || isLoading) && styles.generateBtnDisabled,
              ]}
              onPress={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
                  <Text style={styles.generateBtnText}>Gemini AI Generating Tasks...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="flash" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.generateBtnText}>Generate Actionable Tasks</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: theme.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  headerSub: {
    fontSize: 11,
    color: theme.textMuted,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.surfaceCard,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: theme.text,
    fontSize: 14,
    marginBottom: 14,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  suggestionsContainer: {
    gap: 8,
    marginBottom: 20,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceCard,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: theme.textSecondary,
    flex: 1,
  },
  generateBtn: {
    backgroundColor: theme.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: theme.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
