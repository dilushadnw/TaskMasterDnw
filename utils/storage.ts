// Temporary storage implementation until AsyncStorage is installed
// TODO: Replace with actual AsyncStorage after running: npm install @react-native-async-storage/async-storage

const TASKS_STORAGE_KEY = '@DnwTaskMaster:tasks';

// Fallback storage for web/development
const AsyncStorageFallback = {
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  },
  async getItem(key: string): Promise<string | null> {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  },
  async removeItem(key: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  },
};

// Use fallback storage for now
const AsyncStorage = AsyncStorageFallback;

export interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

/**
 * Save tasks to local storage
 */
export const saveTasks = async (tasks: Task[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving tasks:', error);
    throw error;
  }
};

/**
 * Load tasks from local storage
 */
export const loadTasks = async (): Promise<Task[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

/**
 * Add a new task
 */
export const addTask = async (task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
  try {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const tasks = await loadTasks();
    const updatedTasks = [...tasks, newTask];
    await saveTasks(updatedTasks);
    
    return newTask;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  try {
    const tasks = await loadTasks();
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    await saveTasks(updatedTasks);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const tasks = await loadTasks();
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    await saveTasks(updatedTasks);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

/**
 * Toggle task completion status
 */
export const toggleTaskCompletion = async (taskId: string): Promise<void> => {
  try {
    const tasks = await loadTasks();
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    await saveTasks(updatedTasks);
  } catch (error) {
    console.error('Error toggling task:', error);
    throw error;
  }
};

/**
 * Clear all tasks
 */
export const clearAllTasks = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing tasks:', error);
    throw error;
  }
};
