import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/colors';

export default function PdfExtractModal({ visible, onClose, onExtract, isLoading }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
      }
    } catch (err) {
      console.warn('Document picker error:', err);
      Alert.alert('File Picker Error', 'Could not open document picker.');
    }
  };

  const handleExtract = () => {
    if (!selectedFile || isLoading) return;
    onExtract(selectedFile);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleWithIcon}>
              <View style={styles.iconBox}>
                <Ionicons name="document-text" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>PDF To-Do Extractor</Text>
                <Text style={styles.headerSub}>Extract deliverables and tasks from documents</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Upload Area */}
          <TouchableOpacity
            style={[
              styles.dropZone,
              selectedFile && styles.dropZoneActive,
            ]}
            onPress={handlePickDocument}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.dropZoneCircle}>
              <Ionicons
                name={selectedFile ? 'checkmark-circle' : 'cloud-upload-outline'}
                size={32}
                color={selectedFile ? theme.accent : theme.textSecondary}
              />
            </View>
            <Text style={styles.dropZoneTitle}>
              {selectedFile ? selectedFile.name : 'Select or Browse a PDF'}
            </Text>
            <Text style={styles.dropZoneSub}>
              {selectedFile
                ? `${formatSize(selectedFile.size)} • Tap to choose different file`
                : 'Project Briefs, Syllabi, Meeting Notes, Assignments'}
            </Text>
          </TouchableOpacity>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.extractBtn,
              (!selectedFile || isLoading) && styles.extractBtnDisabled,
            ]}
            onPress={handleExtract}
            disabled={!selectedFile || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
                <Text style={styles.extractBtnText}>AI Parsing & Extracting Tasks...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.extractBtnText}>Extract To-Dos from PDF</Text>
              </>
            )}
          </TouchableOpacity>
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
    backgroundColor: theme.accent,
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
  dropZone: {
    backgroundColor: theme.surfaceCard,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.border,
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dropZoneActive: {
    borderColor: theme.accent,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
  },
  dropZoneCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dropZoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  dropZoneSub: {
    fontSize: 11,
    color: theme.textMuted,
    textAlign: 'center',
  },
  extractBtn: {
    backgroundColor: theme.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  extractBtnDisabled: {
    opacity: 0.5,
  },
  extractBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
