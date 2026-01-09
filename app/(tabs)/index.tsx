import { Task, loadTasks, saveTasks } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';


export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme colors
  const theme = {
    bg: isDarkMode ? '#0F172A' : '#F9FAFB',
    cardBg: isDarkMode ? '#1E293B' : '#fff',
    primary: isDarkMode ? '#10B981' : '#10B981',
    primaryDark: isDarkMode ? '#059669' : '#059669',
    text: isDarkMode ? '#F1F5F9' : '#1F2937',
    textSecondary: isDarkMode ? '#94A3B8' : '#6B7280',
    border: isDarkMode ? '#334155' : '#F3F4F6',
    headerBg: isDarkMode ? '#1E293B' : '#10B981',
  };

  const saveTasksToStorage = useCallback(async () => {
    try {
      await saveTasks(tasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
      Alert.alert('Error', 'Failed to save tasks to storage');
    }
  }, [tasks]);

  // Load tasks from storage on component mount
  useEffect(() => {
    loadTasksFromStorage();
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveTasksToStorage();
    }
  }, [tasks, isLoading, saveTasksToStorage]);

  const loadTasksFromStorage = async () => {
    try {
      const storedTasks = await loadTasks();
      if (storedTasks.length > 0) {
        setTasks(storedTasks);
      } else {
        // If no tasks in storage, use default tasks
        const defaultTasks: Task[] = [
          { id: '1', title: 'Complete project proposal', category: 'Work', completed: false, priority: 'high', createdAt: new Date().toISOString() },
          { id: '2', title: 'Review design mockups', category: 'Design', completed: true, priority: 'medium', createdAt: new Date().toISOString() },
          { id: '3', title: 'Team meeting at 3 PM', category: 'Meeting', completed: false, priority: 'high', createdAt: new Date().toISOString() },
          { id: '4', title: 'Update documentation', category: 'Work', completed: false, priority: 'low', createdAt: new Date().toISOString() },
          { id: '5', title: 'Code review session', category: 'Development', completed: true, priority: 'medium', createdAt: new Date().toISOString() },
        ];
        setTasks(defaultTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks from storage');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "light-content"} 
        backgroundColor={theme.headerBg} 
      />
      
      {/* Header with Dynamic Background */}
      <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
        <View style={styles.headerOverlay} />
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, User! 👋</Text>
            <Text style={styles.headerTitle}>Let&apos;s be productive today</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={toggleDarkMode}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isDarkMode ? "sunny" : "moon"} 
              size={28} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>


        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.primary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search tasks..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
          />
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: isDarkMode ? '#1E3A2F' : '#ECFDF5' }]}>
            <Ionicons name="options" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          {/* Completed Card */}
          <View style={[styles.statCard, styles.statCardGreen]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark-circle" size={36} color="#fff" />
            </View>
            <Text style={styles.statNumber}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Completed</Text>
            <View style={styles.statCardShine} />
          </View>

          {/* Pending Card */}
          <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
            <View style={[styles.statIconContainer, { backgroundColor: isDarkMode ? '#1E3A2F' : '#ECFDF5' }]}>
              <Ionicons name="time-outline" size={36} color={theme.primary} />
            </View>
            <Text style={[styles.statNumberDark, { color: theme.text }]}>{pendingTasks}</Text>
            <Text style={[styles.statLabelDark, { color: theme.textSecondary }]}>Pending</Text>
          </View>

          {/* Progress Card */}
          <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
            <View style={[styles.statIconContainer, { backgroundColor: isDarkMode ? '#1E3A2F' : '#ECFDF5' }]}>
              <Ionicons name="trending-up" size={36} color={theme.primary} />
            </View>
            <Text style={[styles.statNumberDark, { color: theme.text }]}>{completionRate}%</Text>
            <Text style={[styles.statLabelDark, { color: theme.textSecondary }]}>Progress</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={[styles.quickActionIcon, { backgroundColor: isDarkMode ? '#1E3A2F' : '#ECFDF5' }]}>
              <Ionicons name="calendar" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: theme.text }]}>Today</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={[styles.quickActionIcon, { backgroundColor: isDarkMode ? '#1E3A2F' : '#ECFDF5' }]}>
              <Ionicons name="folder" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: theme.text }]}>Projects</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={[styles.quickActionIcon, { backgroundColor: isDarkMode ? '#1E3A2F' : '#ECFDF5' }]}>
              <Ionicons name="star" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: theme.text }]}>Important</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={[styles.quickActionIcon, { backgroundColor: isDarkMode ? '#1E3A2F' : '#ECFDF5' }]}>
              <Ionicons name="people" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: theme.text }]}>Team</Text>
          </TouchableOpacity>
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Today&apos;s Tasks</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>{pendingTasks} tasks remaining</Text>
            </View>
            <TouchableOpacity style={[styles.viewAllButton, { backgroundColor: isDarkMode ? '#1E3A2F' : '#ECFDF5' }]}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>View All</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>


          {tasks.map((task, index) => (
            <TouchableOpacity
              key={task.id}
              style={[
                styles.taskCard,
                { 
                  opacity: task.completed ? 0.7 : 1,
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border
                }
              ]}
              onPress={() => toggleTask(task.id)}
              activeOpacity={0.7}
            >
              <View style={styles.taskLeft}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    { borderColor: isDarkMode ? theme.textSecondary : '#D1D5DB', backgroundColor: theme.cardBg },
                    task.completed && styles.checkboxCompleted
                  ]}
                  onPress={() => toggleTask(task.id)}
                >
                  {task.completed && (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
                
                <View style={styles.taskInfo}>
                  <Text style={[
                    styles.taskTitle,
                    { color: theme.text },
                    task.completed && styles.taskTitleCompleted
                  ]}>
                    {task.title}
                  </Text>
                  <View style={styles.taskMeta}>
                    <View style={[styles.categoryBadge, { backgroundColor: isDarkMode ? '#1E3A2F' : '#ECFDF5', borderColor: isDarkMode ? '#10B981' : '#D1FAE5' }]}>
                      <Text style={[styles.categoryText, { color: theme.primary }]}>{task.category}</Text>
                    </View>
                    <View style={styles.taskMetaRight}>
                      <View style={[
                        styles.priorityIndicator,
                        task.priority === 'high' && styles.priorityHigh,
                        task.priority === 'medium' && styles.priorityMedium,
                        task.priority === 'low' && styles.priorityLow,
                      ]}>
                        <Text style={styles.priorityText}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.taskActions}>
                <TouchableOpacity style={[styles.taskActionButton, { backgroundColor: isDarkMode ? '#334155' : '#F9FAFB' }]}>
                  <Ionicons name="create-outline" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Task Button */}
        <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
          <View style={styles.addButtonContent}>
            <View style={styles.addIconCircle}>
              <Ionicons name="add" size={32} color="#fff" />
            </View>
            <View style={styles.addButtonTextContainer}>
              <Text style={styles.addButtonTitle}>Add New Task</Text>
              <Text style={styles.addButtonSubtitle}>Create a task and stay productive</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#10B981',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#059669',
    opacity: 0.3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.95,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 14,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  statCardGreen: {
    backgroundColor: '#10B981',
  },
  statCardWhite: {
    backgroundColor: '#fff',
  },
  statCardShine: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statIconGreen: {
    backgroundColor: '#ECFDF5',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
    letterSpacing: -1,
  },
  statNumberDark: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.95,
    marginTop: 4,
    fontWeight: '600',
  },
  statLabelDark: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  tasksSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '700',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: '#fff',
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskMetaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  categoryText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  priorityIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  priorityHigh: {
    backgroundColor: '#FEE2E2',
  },
  priorityMedium: {
    backgroundColor: '#FEF3C7',
  },
  priorityLow: {
    backgroundColor: '#D1FAE5',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  taskActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 20,
    backgroundColor: '#10B981',
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 14,
  },
  addIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonTextContainer: {
    flex: 1,
  },
  addButtonTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  addButtonSubtitle: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
});
