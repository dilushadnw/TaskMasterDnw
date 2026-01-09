import { Task, loadTasks, saveTasks } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // New Task States
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCategory, setTaskCategory] = useState('Work');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Today' | 'Upcoming' | 'Past' | 'Completed'>('Today');

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
          { id: '1', title: 'Complete project proposal', category: 'Work', completed: false, priority: 'high', createdAt: new Date().toISOString(), date: new Date().toISOString().split('T')[0] },
          { id: '2', title: 'Review design mockups', category: 'Design', completed: true, priority: 'medium', createdAt: new Date().toISOString(), date: new Date().toISOString().split('T')[0] },
          { id: '3', title: 'Team meeting at 3 PM', category: 'Meeting', completed: false, priority: 'high', createdAt: new Date().toISOString(), date: new Date().toISOString().split('T')[0] },
          { id: '4', title: 'Update documentation', category: 'Work', completed: false, priority: 'low', createdAt: new Date().toISOString(), date: new Date().toISOString().split('T')[0] },
          { id: '5', title: 'Code review session', category: 'Development', completed: true, priority: 'medium', createdAt: new Date().toISOString(), date: new Date().toISOString().split('T')[0] },
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

  const handleAddTask = () => {
    if (taskTitle.trim() === '') {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (editingTask) {
      const updatedTasks = tasks.map(t => 
        t.id === editingTask.id 
          ? { ...t, title: taskTitle, description: taskDescription, category: taskCategory, priority: taskPriority, date: taskDate } 
          : t
      );
      setTasks(updatedTasks);
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskTitle,
        description: taskDescription,
        category: taskCategory,
        completed: false,
        priority: taskPriority,
        createdAt: new Date().toISOString(),
        date: taskDate,
      };
      setTasks([newTask, ...tasks]);
    }

    resetForm();
  };

  const deleteTask = (id: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => setTasks(tasks.filter(t => t.id !== id)) 
        },
      ]
    );
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskCategory(task.category);
    setTaskPriority(task.priority);
    setTaskDate(task.date);
    setIsModalVisible(true);
  };

  const resetForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskCategory('Work');
    setTaskPriority('medium');
    setTaskDate(new Date().toISOString().split('T')[0]);
    setEditingTask(null);
    setIsModalVisible(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const todayDate = new Date().toISOString().split('T')[0];
    
    if (selectedFilter === 'Today') {
      return matchesSearch && (task.date === todayDate || (task.date < todayDate && !task.completed));
    } else if (selectedFilter === 'Upcoming') {
      return matchesSearch && task.date > todayDate;
    } else if (selectedFilter === 'Past') {
      return matchesSearch && task.date < todayDate && !task.completed;
    } else if (selectedFilter === 'Completed') {
      return matchesSearch && task.completed;
    }
    
    return matchesSearch;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const getDayLabel = (dateString: string) => {
    const todayDate = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    if (dateString === todayDate) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    if (dateString === tomorrow) return 'Tomorrow';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
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

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterTabsWrapper}
          contentContainerStyle={styles.filterTabsContent}
        >
          {(['Today', 'Upcoming', 'Past', 'Completed', 'All'] as const).map((filter) => {
            const isActive = selectedFilter === filter;
            const todayDate = new Date().toISOString().split('T')[0];
            const count = tasks.filter(t => {
              if (filter === 'Today') return t.date === todayDate;
              if (filter === 'Upcoming') return t.date > todayDate;
              if (filter === 'Past') return t.date < todayDate && !t.completed;
              if (filter === 'Completed') return t.completed;
              return true;
            }).length;

            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.quickActionButton,
                  { backgroundColor: theme.cardBg, borderColor: isActive ? theme.primary : theme.border, minWidth: 100 },
                  isActive && { borderWidth: 1.5 }
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <View style={[
                  styles.quickActionIcon,
                  { backgroundColor: isActive ? theme.primary : (isDarkMode ? '#1E3A2F' : '#ECFDF5') }
                ]}>
                  <Text style={[
                    { fontWeight: '800', fontSize: 14 },
                    { color: isActive ? '#fff' : theme.primary }
                  ]}>{count}</Text>
                </View>
                <Text style={[
                  styles.quickActionText,
                  { color: isActive ? theme.text : theme.textSecondary, fontSize: 12 }
                ]}>{filter}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {selectedFilter === 'Today' ? "Today's Tasks" : 
                 selectedFilter === 'Upcoming' ? "Upcoming Tasks" : 
                 selectedFilter === 'Past' ? "Past Due Tasks" :
                 selectedFilter === 'Completed' ? "Completed Tasks" : "All Tasks"}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                {filteredTasks.length} tasks {selectedFilter === 'All' ? 'total' : 'found'}
              </Text>
            </View>
            <TouchableOpacity style={[styles.viewAllButton, { backgroundColor: isDarkMode ? '#1E3A2F' : '#ECFDF5' }]}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>View All</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>


          {filteredTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={48} color={theme.textSecondary} style={{ opacity: 0.5 }} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No tasks found for this day</Text>
            </View>
          ) : (
            filteredTasks.map((task, index) => (
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
                    {task.description ? (
                      <Text style={[styles.taskDescriptionText, { color: theme.textSecondary }]} numberOfLines={2}>
                        {task.description}
                      </Text>
                    ) : null}
                    <View style={styles.taskMeta}>
                      {task.date < new Date().toISOString().split('T')[0] && !task.completed && (
                        <View style={styles.overdueBadge}>
                          <Text style={styles.overdueText}>OVERDUE</Text>
                        </View>
                      )}
                      <View style={[styles.categoryBadge, { backgroundColor: isDarkMode ? '#1E3A2F' : '#ECFDF5', borderColor: isDarkMode ? '#10B981' : '#D1FAE5' }]}>
                        <Text style={[styles.categoryText, { color: theme.primary }]}>{task.category}</Text>
                      </View>
                      <View style={styles.taskMetaRight}>
                        <View style={styles.dateBadge}>
                          <Ionicons name="calendar-outline" size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
                          <Text style={[styles.dateText, { color: theme.textSecondary }]}>{getDayLabel(task.date)}</Text>
                        </View>
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
                  <TouchableOpacity 
                    style={[styles.taskActionButton, { backgroundColor: isDarkMode ? '#334155' : '#F9FAFB' }]}
                    onPress={() => openEditModal(task)}
                  >
                    <Ionicons name="create-outline" size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.taskActionButton, { backgroundColor: isDarkMode ? '#450a0a' : '#FEF2F2' }]}
                    onPress={() => deleteTask(task.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Add Task Button */}
        <TouchableOpacity 
          style={styles.addButton} 
          activeOpacity={0.8}
          onPress={() => setIsModalVisible(true)}
        >
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

      {/* Task Entry Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={resetForm}
      >
        <Pressable style={styles.modalOverlay} onPress={resetForm}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <Pressable style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {editingTask ? 'Edit Task' : 'New Task'}
                </Text>
                <TouchableOpacity onPress={resetForm}>
                  <Ionicons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Task Title</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                  placeholder="Enter task name..."
                  placeholderTextColor={theme.textSecondary}
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  autoFocus
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Description (Optional)</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                  placeholder="Enter details..."
                  placeholderTextColor={theme.textSecondary}
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Category</Text>
                <View style={styles.categoryPicker}>
                  {['Work', 'Design', 'Meeting', 'Personal'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catOption,
                        taskCategory === cat && { backgroundColor: theme.primary, borderColor: theme.primary }
                      ]}
                      onPress={() => setTaskCategory(cat)}
                    >
                      <Text style={[
                        styles.catOptionText,
                        { color: theme.textSecondary },
                        taskCategory === cat && { color: '#fff' }
                      ]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Date (YYYY-MM-DD)</Text>
                <View style={[styles.modalInput, { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bg, borderColor: theme.border }]}>
                  <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} style={{ marginRight: 10 }} />
                  <TextInput
                    style={{ flex: 1, color: theme.text, fontSize: 16, fontWeight: '500' }}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.textSecondary}
                    value={taskDate}
                    onChangeText={setTaskDate}
                  />
                </View>
                <View style={styles.datePresets}>
                  <TouchableOpacity 
                    style={[styles.presetBtn, taskDate === new Date().toISOString().split('T')[0] && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                    onPress={() => setTaskDate(new Date().toISOString().split('T')[0])}
                  >
                    <Text style={[styles.presetText, taskDate === new Date().toISOString().split('T')[0] && { color: '#fff' }]}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.presetBtn, taskDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                    onPress={() => setTaskDate(new Date(Date.now() - 86400000).toISOString().split('T')[0])}
                  >
                    <Text style={[styles.presetText, taskDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] && { color: '#fff' }]}>Yesterday</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.presetBtn, taskDate === new Date(Date.now() + 86400000).toISOString().split('T')[0] && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                    onPress={() => setTaskDate(new Date(Date.now() + 86400000).toISOString().split('T')[0])}
                  >
                    <Text style={[styles.presetText, taskDate === new Date(Date.now() + 86400000).toISOString().split('T')[0] && { color: '#fff' }]}>Tomorrow</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Priority</Text>
                <View style={styles.priorityPicker}>
                  {['low', 'medium', 'high'].map((prio) => (
                    <TouchableOpacity
                      key={prio}
                      style={[
                        styles.prioOption,
                        taskPriority === prio && { 
                          backgroundColor: prio === 'high' ? '#EF4444' : prio === 'medium' ? '#F59E0B' : '#10B981',
                          borderColor: prio === 'high' ? '#EF4444' : prio === 'medium' ? '#F59E0B' : '#10B981'
                        }
                      ]}
                      onPress={() => setTaskPriority(prio as any)}
                    >
                      <Text style={[
                        styles.prioOptionText,
                        { color: theme.textSecondary },
                        taskPriority === prio && { color: '#fff' }
                      ]}>
                        {prio.charAt(0).toUpperCase() + prio.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: theme.primary }]}
                onPress={handleAddTask}
              >
                <Text style={styles.submitButtonText}>
                  {editingTask ? 'Update Task' : 'Add Task'}
                </Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  catOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priorityPicker: {
    flexDirection: 'row',
    gap: 12,
  },
  prioOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  prioOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  datePresets: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'transparent',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
  },
  filterTabsWrapper: {
    marginTop: 20,
    marginBottom: 10,
  },
  filterTabsContent: {
    paddingHorizontal: 20,
    gap: 12,
    alignItems: 'center',
  },
  overdueBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  overdueText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '900',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  taskDescriptionText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});
