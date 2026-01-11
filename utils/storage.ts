import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_STORAGE_KEY = '@DnwTaskMaster:tasks';

export interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  date: string;
  description?: string;
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

const USER_NAME_KEY = '@DnwTaskMaster:user_name';

export const saveUserName = async (name: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_NAME_KEY, name);
  } catch (error) {
    console.error('Error saving user name:', error);
  }
};

export const loadUserName = async (): Promise<string> => {
  try {
    const name = await AsyncStorage.getItem(USER_NAME_KEY);
    return name || 'User';
  } catch (error) {
    console.error('Error loading user name:', error);
    return 'User';
  }
};

const CATEGORIES_KEY = '@DnwTaskMaster:categories';

export const saveCategories = async (categories: string[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(categories);
    await AsyncStorage.setItem(CATEGORIES_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving categories:', error);
  }
};

export const loadCategories = async (): Promise<string[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CATEGORIES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : ['Work', 'Design', 'Meeting', 'Personal', 'Development'];
  } catch (error) {
    console.error('Error loading categories:', error);
    return ['Work', 'Design', 'Meeting', 'Personal', 'Development'];
  }
};

const THEME_KEY = '@DnwTaskMaster:is_dark_mode';

export const saveThemePreference = async (isDarkMode: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_KEY, isDarkMode ? 'true' : 'false');
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

export const loadThemePreference = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(THEME_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error loading theme:', error);
    return false;
  }
};
