import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/colors';

export default function ServerConfigModal({
  visible,
  onClose,
  currentUrl,
  onSaveUrl,
}) {
  const [url, setUrl] = useState(currentUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    setUrl(currentUrl);
    setTestResult(null);
  }, [currentUrl, visible]);

  const presets = [
    { label: 'Wi-Fi Phone (Your LAN)', val: 'http://192.168.1.42:8000' },
    { label: 'Web Browser / Localhost', val: 'http://localhost:8000' },
    { label: 'Android Emulator', val: 'http://10.0.2.2:8000' },
  ];

  const handleTestAndSave = async () => {
    if (!url.trim()) return;
    setIsTesting(true);
    setTestResult(null);

    const isHealthy = await onSaveUrl(url.trim());
    setIsTesting(false);
    if (isHealthy) {
      setTestResult({ success: true, message: 'Connected successfully to backend!' });
      setTimeout(() => {
        onClose();
      }, 900);
    } else {
      setTestResult({
        success: false,
        message: 'Could not connect. Ensure FastAPI is running on host 0.0.0.0 and port 8000.',
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleWithIcon}>
              <View style={styles.iconBox}>
                <Ionicons name="server" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Backend API Settings</Text>
                <Text style={styles.headerSub}>Connect mobile app to your FastAPI server</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Server Base URL</Text>
            <TextInput
              style={styles.input}
              placeholder="http://192.168.1.42:8000"
              placeholderTextColor={theme.textMuted}
              value={url}
              onChangeText={(text) => {
                setUrl(text);
                setTestResult(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Quick Presets (Tap to apply)</Text>
            <View style={styles.presetsList}>
              {presets.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.presetItem,
                    url.toLowerCase() === p.val.toLowerCase() && styles.presetItemActive,
                  ]}
                  onPress={() => {
                    setUrl(p.val);
                    setTestResult(null);
                  }}
                >
                  <Ionicons
                    name="radio-button-on"
                    size={14}
                    color={url.toLowerCase() === p.val.toLowerCase() ? theme.primary : theme.textMuted}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.presetLabel}>{p.label}</Text>
                    <Text style={styles.presetVal}>{p.val}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {testResult ? (
              <View
                style={[
                  styles.resultBanner,
                  testResult.success ? styles.resultSuccess : styles.resultError,
                ]}
              >
                <Ionicons
                  name={testResult.success ? 'checkmark-circle' : 'alert-circle'}
                  size={18}
                  color={testResult.success ? theme.success : theme.danger}
                />
                <Text
                  style={[
                    styles.resultText,
                    testResult.success ? styles.resultTextSuccess : styles.resultTextError,
                  ]}
                >
                  {testResult.message}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleTestAndSave}
              disabled={isTesting}
              activeOpacity={0.8}
            >
              {isTesting ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
                  <Text style={styles.saveBtnText}>Testing Connection...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="link" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.saveBtnText}>Save & Test Connection</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
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
    borderWidth: 1,
    borderColor: theme.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 8,
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
    marginBottom: 16,
  },
  presetsList: {
    gap: 8,
    marginBottom: 16,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceCard,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 10,
  },
  presetItemActive: {
    borderColor: theme.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
  },
  presetVal: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
  },
  resultSuccess: {
    backgroundColor: theme.successSurface,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  resultError: {
    backgroundColor: theme.dangerSurface,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resultText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  resultTextSuccess: {
    color: theme.success,
  },
  resultTextError: {
    color: theme.danger,
  },
  saveBtn: {
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
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
