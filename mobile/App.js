import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { theme } from './src/theme/colors';
import { api } from './src/services/api';
import Header from './src/components/Header';
import StatsCard from './src/components/StatsCard';
import FilterBar from './src/components/FilterBar';
import TodoItem from './src/components/TodoItem';
import AddTodoModal from './src/components/AddTodoModal';
import AiPlanModal from './src/components/AiPlanModal';
import PdfExtractModal from './src/components/PdfExtractModal';
import AgentDocModal from './src/components/AgentDocModal';
import ServerConfigModal from './src/components/ServerConfigModal';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [isOnline, setIsOnline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, completed

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Loading states for actions
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isDocLoading, setIsDocLoading] = useState(false);

  const fetchTodos = useCallback(async () => {
    try {
      const filters = {
        category: selectedCategory,
        search: searchQuery,
      };
      if (statusFilter === 'pending') filters.completed = false;
      if (statusFilter === 'completed') filters.completed = true;

      const data = await api.getTodos(filters);
      setTodos(data.todos || []);
      setStats({
        total: data.total || 0,
        completed: data.completed || 0,
        pending: data.pending || 0,
      });
      setIsOnline(api.isOnline);
    } catch (e) {
      console.warn('Error loading todos:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory, searchQuery, statusFilter]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchTodos();
  };

  const handleToggleComplete = async (id, nextCompleted) => {
    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t))
    );
    await api.updateTodo(id, { completed: nextCompleted });
    fetchTodos();
  };

  const handleDelete = async (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await api.deleteTodo(id);
    fetchTodos();
  };

  const handleAddTodo = async (todoData) => {
    await api.createTodo(todoData);
    fetchTodos();
  };

  const handleGenerateAiTodos = async (prompt, category) => {
    setIsAiLoading(true);
    try {
      const generated = await api.generateAiTodos(prompt, category);
      setShowAiModal(false);
      Alert.alert(
        'AI Planning Complete! 🎉',
        `Successfully generated ${generated.length} actionable tasks for your goal.`
      );
      fetchTodos();
    } catch (err) {
      Alert.alert('AI Generation Failed', err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExtractPdfTodos = async (file) => {
    setIsPdfLoading(true);
    try {
      const extracted = await api.extractPdfTodos(
        file.uri,
        file.name,
        file.mimeType
      );
      setShowPdfModal(false);
      Alert.alert(
        'PDF Extracted! 📄',
        `Successfully extracted ${extracted.length} tasks and action items from "${file.name}".`
      );
      fetchTodos();
    } catch (err) {
      Alert.alert('PDF Extraction Failed', err.message);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleRunAgentDoc = async (request) => {
    setIsDocLoading(true);
    try {
      const result = await api.runAgent(request);
      return result;
    } catch (err) {
      Alert.alert('Agent Execution Failed', err.message);
      throw err;
    } finally {
      setIsDocLoading(false);
    }
  };

  const handleSaveBaseUrl = async (newUrl) => {
    const isHealthy = await api.setBaseUrl(newUrl);
    setIsOnline(isHealthy);
    fetchTodos();
    return isHealthy;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />

        {/* Top Header */}
        <Header
          isOnline={isOnline}
          onOpenServerConfig={() => setShowConfigModal(true)}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Task List and Controls */}
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          ListHeaderComponent={
            <View>
              {/* Stats Card */}
              <StatsCard
                total={stats.total}
                completed={stats.completed}
                pending={stats.pending}
              />

              {/* Action Bar Pills */}
              <View style={styles.actionPillsContainer}>
                <TouchableOpacity
                  style={[styles.actionPill, { borderColor: theme.primary }]}
                  onPress={() => setShowAddModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle" size={15} color={theme.primary} />
                  <Text style={[styles.actionPillText, { color: theme.primary }]}>
                    New Task
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionPill, { borderColor: theme.secondary }]}
                  onPress={() => setShowAiModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="sparkles" size={15} color={theme.secondary} />
                  <Text style={[styles.actionPillText, { color: theme.secondary }]}>
                    AI Plan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionPill, { borderColor: theme.accent }]}
                  onPress={() => setShowPdfModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="document-text" size={15} color={theme.accent} />
                  <Text style={[styles.actionPillText, { color: theme.accent }]}>
                    PDF Extract
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionPill, { borderColor: theme.warning }]}
                  onPress={() => setShowDocModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="flash" size={15} color={theme.warning} />
                  <Text style={[styles.actionPillText, { color: theme.warning }]}>
                    AI Agent
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Filters */}
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                statusFilter={statusFilter}
                onSelectStatus={setStatusFilter}
              />

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {statusFilter === 'completed'
                    ? 'Completed Tasks'
                    : statusFilter === 'pending'
                    ? 'Pending Tasks'
                    : 'All Tasks'}
                </Text>
                <Text style={styles.sectionCount}>({todos.length})</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <TodoItem
              todo={item}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {isLoading ? (
                <ActivityIndicator size="large" color={theme.primary} />
              ) : (
                <>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="checkmark-done" size={32} color={theme.textMuted} />
                  </View>
                  <Text style={styles.emptyTitle}>No tasks found</Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery
                      ? 'Try adjusting your search or category filter.'
                      : 'Tap "+ New Task" or "AI Plan" to organize your objectives!'}
                  </Text>
                </>
              )}
            </View>
          }
          contentContainerStyle={styles.listContent}
        />

        {/* Modals */}
        <AddTodoModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTodo}
        />

        <AiPlanModal
          visible={showAiModal}
          onClose={() => setShowAiModal(false)}
          onGenerate={handleGenerateAiTodos}
          isLoading={isAiLoading}
        />

        <PdfExtractModal
          visible={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          onExtract={handleExtractPdfTodos}
          isLoading={isPdfLoading}
        />

        <AgentDocModal
          visible={showDocModal}
          onClose={() => setShowDocModal(false)}
          onRunAgent={handleRunAgentDoc}
          isLoading={isDocLoading}
        />

        <ServerConfigModal
          visible={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          currentUrl={api.getBaseUrl()}
          onSaveUrl={handleSaveBaseUrl}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  listContent: {
    paddingBottom: 40,
  },
  actionPillsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 14,
    justifyContent: 'space-between',
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surfaceCard,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 13,
    color: theme.textMuted,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
