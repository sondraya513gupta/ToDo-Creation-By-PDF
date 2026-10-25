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

export default function AgentDocModal({ visible, onClose, onRunAgent, isLoading }) {
  const [request, setRequest] = useState('');
  const [agentResult, setAgentResult] = useState(null);

  const handleRun = async () => {
    if (!request.trim() || isLoading) return;
    try {
      const result = await onRunAgent(request.trim());
      setAgentResult(result);
    } catch (e) {
      // handled in parent
    }
  };

  const handleClose = () => {
    setAgentResult(null);
    setRequest('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleWithIcon}>
              <View style={styles.iconBox}>
                <Ionicons name="document" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>AI Document Agent</Text>
                <Text style={styles.headerSub}>Plan, execute, & generate Word (.docx) docs</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {!agentResult ? (
              <>
                <Text style={styles.label}>Document Request / Topic *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g., Create a professional technical design document on Microservices and Clean Architecture..."
                  placeholderTextColor={theme.textMuted}
                  value={request}
                  onChangeText={setRequest}
                  multiline
                  numberOfLines={4}
                  editable={!isLoading}
                />

                <TouchableOpacity
                  style={[
                    styles.runBtn,
                    (!request.trim() || isLoading) && styles.runBtnDisabled,
                  ]}
                  onPress={handleRun}
                  disabled={!request.trim() || isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <>
                      <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
                      <Text style={styles.runBtnText}>Autonomous Agent Working...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.runBtnText}>Launch Document Agent</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.resultBox}>
                <View style={styles.resultHeader}>
                  <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                  <Text style={styles.resultTitle}>Document Successfully Generated!</Text>
                </View>

                <View style={styles.pathBadge}>
                  <Ionicons name="folder-open" size={14} color={theme.accent} />
                  <Text style={styles.pathText} numberOfLines={1}>
                    {agentResult.document}
                  </Text>
                </View>

                <Text style={styles.sectionHeading}>Milestone Execution Plan:</Text>
                <View style={styles.stepsList}>
                  {agentResult.plan?.map((step, idx) => (
                    <View key={idx} style={styles.stepItem}>
                      <Ionicons name="checkmark-done" size={14} color={theme.primary} style={{ marginTop: 2 }} />
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.newRequestBtn}
                  onPress={() => setAgentResult(null)}
                >
                  <Text style={styles.newRequestText}>Generate Another Document</Text>
                </TouchableOpacity>
              </View>
            )}
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
    backgroundColor: theme.primary,
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
  runBtn: {
    backgroundColor: theme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  runBtnDisabled: {
    opacity: 0.5,
  },
  runBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  resultBox: {
    paddingVertical: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  pathBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.surfaceElevated,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16,
  },
  pathText: {
    fontSize: 12,
    color: theme.accent,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  stepsList: {
    backgroundColor: theme.surfaceCard,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 10,
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  stepText: {
    fontSize: 13,
    color: theme.text,
    flex: 1,
    lineHeight: 18,
  },
  newRequestBtn: {
    backgroundColor: theme.surfaceElevated,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  newRequestText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.primary,
  },
});
