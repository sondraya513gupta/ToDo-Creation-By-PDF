import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY_BASE_URL = '@todo_app_base_url';
const STORAGE_KEY_LOCAL_TODOS = '@todo_app_local_todos';

// User's LAN IP is 192.168.1.42 for testing on real phone via Expo Go
// On web: localhost:8000 works directly
const DEFAULT_URL = Platform.OS === 'web' 
  ? 'http://localhost:8000' 
  : 'http://192.168.1.42:8000';

class ApiService {
  constructor() {
    this.baseUrl = DEFAULT_URL;
    this.isOnline = false;
    this.init();
  }

  async init() {
    try {
      const savedUrl = await AsyncStorage.getItem(STORAGE_KEY_BASE_URL);
      if (savedUrl) {
        this.baseUrl = savedUrl;
      }
      await this.checkHealth();
    } catch (e) {
      console.log('Error initializing API URL:', e);
    }
  }

  async setBaseUrl(newUrl) {
    let cleanUrl = newUrl.trim();
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    this.baseUrl = cleanUrl;
    await AsyncStorage.setItem(STORAGE_KEY_BASE_URL, cleanUrl);
    return await this.checkHealth();
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.isOnline = true;
        return true;
      }
    } catch (e) {
      // Failed to reach backend
    }
    this.isOnline = false;
    return false;
  }

  // =====================
  // Todos Endpoints
  // =====================

  async getTodos(filters = {}) {
    const isHealthy = await this.checkHealth();
    if (!isHealthy) {
      // Fallback to offline cached storage
      return await this._getLocalTodos(filters);
    }

    try {
      const queryParams = new URLSearchParams();
      if (filters.category && filters.category !== 'All') {
        queryParams.append('category', filters.category);
      }
      if (filters.completed !== undefined && filters.completed !== null) {
        queryParams.append('completed', String(filters.completed));
      }
      if (filters.priority && filters.priority !== 'All') {
        queryParams.append('priority', filters.priority.toLowerCase());
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await fetch(`${this.baseUrl}/todos${queryString}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.status}`);
      }
      const data = await response.json();

      // Cache locally for offline resilience
      await AsyncStorage.setItem(STORAGE_KEY_LOCAL_TODOS, JSON.stringify(data.todos || []));
      return data;
    } catch (err) {
      console.warn('API error fetching todos, falling back to local cache:', err);
      return await this._getLocalTodos(filters);
    }
  }

  async createTodo(todoData) {
    const isHealthy = await this.checkHealth();
    if (isHealthy) {
      try {
        const response = await fetch(`${this.baseUrl}/todos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(todoData),
        });
        if (response.ok) {
          const created = await response.json();
          return created;
        }
      } catch (err) {
        console.warn('Error in remote createTodo:', err);
      }
    }

    // Local fallback creation
    const local = await this._getLocalTodos();
    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: todoData.title,
      description: todoData.description || '',
      priority: todoData.priority || 'medium',
      category: todoData.category || 'General',
      due_date: todoData.due_date || null,
      completed: !!todoData.completed,
      created_at: new Date().toISOString(),
      source: todoData.source || 'manual',
    };
    const updated = [newItem, ...(local.todos || [])];
    await AsyncStorage.setItem(STORAGE_KEY_LOCAL_TODOS, JSON.stringify(updated));
    return newItem;
  }

  async updateTodo(id, updates) {
    const isHealthy = await this.checkHealth();
    if (isHealthy) {
      try {
        const response = await fetch(`${this.baseUrl}/todos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.warn('Error updating remote todo:', err);
      }
    }

    // Local fallback update
    const local = await this._getLocalTodos();
    const updated = (local.todos || []).map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    await AsyncStorage.setItem(STORAGE_KEY_LOCAL_TODOS, JSON.stringify(updated));
    return updated.find((t) => t.id === id);
  }

  async deleteTodo(id) {
    const isHealthy = await this.checkHealth();
    if (isHealthy) {
      try {
        await fetch(`${this.baseUrl}/todos/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Error in remote deleteTodo:', err);
      }
    }

    // Local fallback delete
    const local = await this._getLocalTodos();
    const updated = (local.todos || []).filter((t) => t.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY_LOCAL_TODOS, JSON.stringify(updated));
    return true;
  }

  async generateAiTodos(prompt, category = 'AI Plan', priority = 'high') {
    const isHealthy = await this.checkHealth();
    if (!isHealthy) {
      throw new Error('Backend server is offline. Please start backend or check IP settings.');
    }

    const response = await fetch(`${this.baseUrl}/todos/generate-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, category, priority }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI generation failed: ${err}`);
    }
    return await response.json();
  }

  async extractPdfTodos(fileUri, fileName, mimeType = 'application/pdf') {
    const isHealthy = await this.checkHealth();
    if (!isHealthy) {
      throw new Error('Backend server is offline. Please start backend or check IP settings.');
    }

    const formData = new FormData();
    if (Platform.OS === 'web') {
      // In web, fileUri might already be a Blob or File
      const res = await fetch(fileUri);
      const blob = await res.blob();
      formData.append('file', blob, fileName);
    } else {
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: mimeType || 'application/pdf',
      });
    }

    const response = await fetch(`${this.baseUrl}/todos/extract-from-pdf`, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`PDF extraction failed: ${err}`);
    }
    return await response.json();
  }

  async runAgent(request) {
    const isHealthy = await this.checkHealth();
    if (!isHealthy) {
      throw new Error('Backend server is offline.');
    }

    const response = await fetch(`${this.baseUrl}/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Agent execution failed: ${err}`);
    }
    return await response.json();
  }

  async _getLocalTodos(filters = {}) {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_LOCAL_TODOS);
      let list = raw ? JSON.parse(raw) : [];

      if (filters.category && filters.category !== 'All') {
        list = list.filter((t) => t.category?.toLowerCase() === filters.category.toLowerCase());
      }
      if (filters.completed !== undefined && filters.completed !== null) {
        list = list.filter((t) => t.completed === filters.completed);
      }
      if (filters.priority && filters.priority !== 'All') {
        list = list.filter((t) => t.priority?.toLowerCase() === filters.priority.toLowerCase());
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (t) =>
            t.title?.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q)
        );
      }

      const total = list.length;
      const completed = list.filter((t) => t.completed).length;
      return {
        total,
        completed,
        pending: total - completed,
        todos: list,
      };
    } catch (e) {
      return { total: 0, completed: 0, pending: 0, todos: [] };
    }
  }
}

export const api = new ApiService();
