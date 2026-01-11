import {
  Task,
  loadCategories,
  loadTasks,
  loadThemePreference,
  loadUserName,
  saveCategories,
  saveTasks,
  saveThemePreference,
  saveUserName
} from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
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
  const [categories, setCategories] = useState(['Work', 'Design', 'Meeting', 'Personal', 'Development']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [showOverdueInToday, setShowOverdueInToday] = useState(true);
  const [showCompletedInToday, setShowCompletedInToday] = useState(true);
  const [showCompletedInUpcoming, setShowCompletedInUpcoming] = useState(true);
  const [showCompletedInAll, setShowCompletedInAll] = useState(true);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [statsScope, setStatsScope] = useState<'All' | 'Today'>('Today');
  const [userName, setUserName] = useState('User');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  // Theme colors - Professional Palette
  const theme = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC', // Slate 900 / Slate 50
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF', // Slate 800 / White
    primary: '#10B981', // Emerald 500
    primaryDark: '#059669', // Emerald 600
    accent: '#3B82F6', // Blue 500
    text: isDarkMode ? '#F1F5F9' : '#0F172A', // Slate 100 / Slate 900
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B', // Slate 400 / Slate 500
    border: isDarkMode ? '#334155' : '#E2E8F0', // Slate 700 / Slate 200
    headerBg: isDarkMode ? '#111827' : '#10B981', // Gray 900 / Emerald 500
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  };

  const saveTasksToStorage = useCallback(async () => {
    try {
      await saveTasks(tasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
      Alert.alert('Error', 'Failed to save tasks to storage');
    }
  }, [tasks]);

  // Load data from storage on component mount
  useEffect(() => {
    const initApp = async () => {
      await loadTasksFromStorage();
      await loadUserInfo();
    };
    initApp();
  }, []);

  const loadUserInfo = async () => {
    const name = await loadUserName();
    const storedCategories = await loadCategories();
    const isDark = await loadThemePreference();
    
    setUserName(name);
    setCategories(storedCategories);
    setIsDarkMode(isDark);
  };

  // Persist data whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveTasksToStorage();
    }
  }, [tasks, isLoading, saveTasksToStorage]);

  useEffect(() => {
    if (!isLoading) {
      saveCategories(categories);
    }
  }, [categories, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveThemePreference(isDarkMode);
    }
  }, [isDarkMode, isLoading]);

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
    
    // Base time/status filter
    let baseFiltered = matchesSearch;
    if (selectedFilter === 'Today') {
      const isOverdueIncluded = showOverdueInToday ? (task.date < todayDate && !task.completed) : false;
      const isCompletedIncluded = showCompletedInToday ? true : !task.completed;
      baseFiltered = matchesSearch && (task.date === todayDate || isOverdueIncluded) && isCompletedIncluded;
    } else if (selectedFilter === 'Upcoming') {
      const isCompletedIncluded = showCompletedInUpcoming ? true : !task.completed;
      baseFiltered = matchesSearch && task.date > todayDate && isCompletedIncluded;
    } else if (selectedFilter === 'Past') {
      baseFiltered = matchesSearch && task.date < todayDate && !task.completed;
    } else if (selectedFilter === 'Completed') {
      baseFiltered = matchesSearch && task.completed;
    } else {
      // All filter
      const isCompletedIncluded = showCompletedInAll ? true : !task.completed;
      baseFiltered = matchesSearch && isCompletedIncluded;
    }

    return baseFiltered;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const addNewCategory = () => {
    if (newCategoryName.trim() === '') return;
    if (categories.includes(newCategoryName.trim())) {
      Alert.alert('Error', 'Category already exists');
      return;
    }
    setCategories([...categories, newCategoryName.trim()]);
    setTaskCategory(newCategoryName.trim());
    setNewCategoryName('');
  };

  const deleteCategory = (category: string) => {
    if (categories.length <= 1) {
      Alert.alert('Error', 'At least one category is required');
      return;
    }
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category}"? Tasks in this category will be moved to "Personal".`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            setCategories(categories.filter(c => c !== category));
            setTasks(tasks.map(t => t.category === category ? { ...t, category: 'Personal' } : t));
            if (selectedCategory === category) setSelectedCategory('All');
            if (taskCategory === category) setTaskCategory('Personal');
          } 
        },
      ]
    );
  };

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

  const todayDate = new Date().toISOString().split('T')[0];
  const statsTasks = statsScope === 'Today' ? tasks.filter(t => t.date === todayDate) : tasks;
  
  const completedTasks = statsTasks.filter(t => t.completed).length;
  const totalStatsTasks = statsTasks.length;
  const pendingTasks = totalStatsTasks - completedTasks;
  const completionRate = totalStatsTasks > 0 ? Math.round((completedTasks / totalStatsTasks) * 100) : 0;

  const getCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const handleDateSelect = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setTaskDate(selected.toISOString().split('T')[0]);
    setIsDatePickerVisible(false);
  };

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
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {isEditingName ? (
                <TextInput
                  style={[styles.nameInput, { color: '#fff' }]}
                  value={userName}
                  onChangeText={setUserName}
                  onBlur={() => {
                    setIsEditingName(false);
                    saveUserName(userName);
                  }}
                  autoFocus
                  maxLength={15}
                />
              ) : (
                <TouchableOpacity 
                  onPress={() => setIsEditingName(true)} 
                  style={styles.greetingTouch}
                  activeOpacity={0.7}
                >
                  <Text style={styles.greeting}>Hello, {userName} 👋</Text>
                  <Ionicons name="pencil-sharp" size={14} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.headerTitle}>DnwTaskMaster</Text>
          </View>
          <TouchableOpacity 
            style={[styles.profileButton, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
            onPress={toggleDarkMode}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isDarkMode ? "sunny" : "moon"} 
              size={22} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : '#fff' }]}>
          <Ionicons name="search" size={20} color={isDarkMode ? theme.primary : '#64748B'} style={styles.searchIcon} />
          <TextInput
            placeholder="Search tasks..."
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
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

      {/* Collapsible Stats Section */}
      <View style={[styles.collapsibleStats, { backgroundColor: theme.cardBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.statsHeader} 
          onPress={() => setIsStatsExpanded(!isStatsExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.statsHeaderLeft}>
            <View style={[styles.statsDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.statsHeaderText, { color: theme.text }]}>Dashboard Insights</Text>
            <View style={[styles.statsScopeBadge, { backgroundColor: isDarkMode ? '#334155' : '#F3F4F6' }]}>
              <Text style={[styles.statsScopeText, { color: theme.textSecondary }]}>{statsScope}</Text>
            </View>
          </View>
          <Ionicons name={isStatsExpanded ? "chevron-up" : "chevron-down"} size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        {isStatsExpanded && (
          <View style={styles.statsExpandedContent}>
            <View style={styles.statsScopeSelector}>
              {(['Today', 'All'] as const).map((scope) => (
                <TouchableOpacity 
                  key={scope}
                  onPress={() => setStatsScope(scope)}
                  style={[
                    styles.scopeBtn, 
                    statsScope === scope && { backgroundColor: theme.primary, borderColor: theme.primary }
                  ]}
                >
                  <Text style={[styles.scopeBtnText, { color: statsScope === scope ? '#fff' : theme.textSecondary }]}>
                    {scope}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.miniStatCard, { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB' }]}>
                <Ionicons name="checkmark-done" size={20} color="#10B981" />
                <View>
                  <Text style={[styles.miniStatNumber, { color: theme.text }]}>{completedTasks}</Text>
                  <Text style={[styles.miniStatLabel, { color: theme.textSecondary }]}>Done</Text>
                </View>
              </View>
              <View style={[styles.miniStatCard, { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB' }]}>
                <Ionicons name="alert-circle" size={20} color="#F59E0B" />
                <View>
                  <Text style={[styles.miniStatNumber, { color: theme.text }]}>{pendingTasks}</Text>
                  <Text style={[styles.miniStatLabel, { color: theme.textSecondary }]}>Pending</Text>
                </View>
              </View>
              <View style={[styles.miniStatCard, { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB' }]}>
                <Ionicons name="speedometer" size={20} color={theme.primary} />
                <View>
                  <Text style={[styles.miniStatNumber, { color: theme.text }]}>{completionRate}%</Text>
                  <Text style={[styles.miniStatLabel, { color: theme.textSecondary }]}>Rate</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: 10 }} />

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
                  { backgroundColor: theme.cardBg },
                  isActive && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => setSelectedFilter(filter)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.quickActionText,
                  { color: isActive ? '#fff' : theme.textSecondary }
                ]}>{filter}</Text>
                {count > 0 && (
                  <View style={[styles.filterBadge, { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : theme.border }]}>
                    <Text style={[styles.filterBadgeText, { color: isActive ? '#fff' : theme.textSecondary }]}>{count}</Text>
                  </View>
                )}
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
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              {selectedFilter === 'Today' && (
                <TouchableOpacity 
                  style={[styles.toggleBtn, { backgroundColor: showOverdueInToday ? theme.primary : (isDarkMode ? '#334155' : '#F3F4F6') }]} 
                  onPress={() => setShowOverdueInToday(!showOverdueInToday)}
                >
                  <Text style={[styles.toggleText, { color: showOverdueInToday ? '#fff' : theme.textSecondary }]}>Show Overdue</Text>
                </TouchableOpacity>
              )}
              {selectedFilter === 'Today' && (
                <TouchableOpacity 
                  style={[styles.toggleBtn, { backgroundColor: showCompletedInToday ? theme.primary : (isDarkMode ? '#334155' : '#F3F4F6') }]} 
                  onPress={() => setShowCompletedInToday(!showCompletedInToday)}
                >
                  <Text style={[styles.toggleText, { color: showCompletedInToday ? '#fff' : theme.textSecondary }]}>Show Done</Text>
                </TouchableOpacity>
              )}
              {selectedFilter === 'Upcoming' && (
                <TouchableOpacity 
                  style={[styles.toggleBtn, { backgroundColor: showCompletedInUpcoming ? theme.primary : (isDarkMode ? '#334155' : '#F3F4F6') }]} 
                  onPress={() => setShowCompletedInUpcoming(!showCompletedInUpcoming)}
                >
                  <Text style={[styles.toggleText, { color: showCompletedInUpcoming ? '#fff' : theme.textSecondary }]}>Show Completed</Text>
                </TouchableOpacity>
              )}
              {selectedFilter === 'All' && (
                <TouchableOpacity 
                  style={[styles.toggleBtn, { backgroundColor: showCompletedInAll ? theme.primary : (isDarkMode ? '#334155' : '#F3F4F6') }]} 
                  onPress={() => setShowCompletedInAll(!showCompletedInAll)}
                >
                  <Text style={[styles.toggleText, { color: showCompletedInAll ? '#fff' : theme.textSecondary }]}>Show Completed</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.viewAllButton, { backgroundColor: isDarkMode ? '#1E3A2F' : '#ECFDF5' }]}>
                <Text style={[styles.seeAllText, { color: theme.primary }]}>View All</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.primary} />
              </TouchableOpacity>
            </View>
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
                      <TouchableOpacity onPress={() => setSelectedTaskDetail(task)}>
                        <Text style={[styles.taskDescriptionText, { color: theme.textSecondary }]} numberOfLines={1}>
                          {task.description}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                    <View style={styles.taskMeta}>
                      <View style={[styles.categoryBadge, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#F1F5F9' }]}>
                        <Text style={[styles.categoryText, { color: theme.primary }]}>{task.category}</Text>
                      </View>
                      <View style={styles.taskMetaRight}>
                        <View style={styles.dateBadge}>
                          <Ionicons name="calendar-outline" size={12} color={theme.textSecondary} />
                          <Text style={[styles.dateText, { color: theme.textSecondary }]}>{getDayLabel(task.date)}</Text>
                        </View>
                        {task.date < new Date().toISOString().split('T')[0] && !task.completed && (
                          <View style={[styles.statusTag, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <Text style={[styles.statusTagText, { color: theme.danger }]}>OVERDUE</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.taskActions}>
                  <View style={[
                    styles.priorityLine, 
                    { backgroundColor: task.priority === 'high' ? theme.danger : task.priority === 'medium' ? theme.warning : theme.success }
                  ]} />
                  <TouchableOpacity 
                    style={[styles.taskActionButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}
                    onPress={() => openEditModal(task)}
                  >
                    <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.attributionContainer}>
          <Text style={[styles.attributionText, { color: theme.textSecondary }]}>
            DnwTaskMaster v1.0
          </Text>
          <Text style={[styles.creatorText, { color: theme.primary }]}>
            Developed by dilushadnw
          </Text>
          
          <TouchableOpacity 
            style={[styles.contactButton, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
            onPress={() => Linking.openURL('https://linktr.ee/dilushadnw')}
            activeOpacity={0.7}
          >
            <Ionicons name="link-outline" size={16} color={theme.primary} />
            <Text style={[styles.contactButtonText, { color: theme.text }]}>Get In Touch</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.floatingAddButton, { backgroundColor: theme.primary }]}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

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
                  {categories.map((cat) => (
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
                <TouchableOpacity 
                  style={[styles.manageCategoriesBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', borderColor: theme.border }]}
                  onPress={() => setIsCategoryModalVisible(true)}
                >
                  <Ionicons name="settings-outline" size={16} color={theme.primary} />
                  <Text style={[styles.manageCategoriesText, { color: theme.primary }]}>Manage Categories</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Date</Text>
                <TouchableOpacity 
                  style={[styles.modalInput, { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bg, borderColor: theme.border }]}
                  onPress={() => setIsDatePickerVisible(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={theme.primary} style={{ marginRight: 10 }} />
                  <Text style={{ flex: 1, color: theme.text, fontSize: 16, fontWeight: '500' }}>
                    {getDayLabel(taskDate)} ({taskDate})
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
                
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

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                {editingTask && (
                  <TouchableOpacity 
                    style={[styles.submitButton, { flex: 1, backgroundColor: theme.danger }]}
                    onPress={() => {
                      deleteTask(editingTask.id);
                      resetForm();
                    }}
                  >
                    <Text style={styles.submitButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[styles.submitButton, { flex: 2, backgroundColor: theme.primary }]}
                  onPress={handleAddTask}
                >
                  <Text style={styles.submitButtonText}>
                    {editingTask ? 'Update Task' : 'Add Task'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* Category Management Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isCategoryModalVisible}
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsCategoryModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg, maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Manage Categories</Text>
              <TouchableOpacity onPress={() => setIsCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, { marginTop: 10 }]}>
              <View style={styles.addCategoryRow}>
                <TextInput
                  style={[styles.modalInput, { flex: 1, height: 44, backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                  placeholder="New Category Name..."
                  placeholderTextColor={theme.textSecondary}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />
                <TouchableOpacity 
                  style={[styles.addCategoryBtn, { backgroundColor: theme.primary }]}
                  onPress={addNewCategory}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={{ marginTop: 20 }}>
              {categories.map((cat) => (
                <View key={cat} style={[styles.categoryItem, { borderColor: theme.border }]}>
                  <Text style={[styles.categoryItemText, { color: theme.text }]}>{cat}</Text>
                  <TouchableOpacity onPress={() => deleteCategory(cat)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Task Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedTaskDetail}
        onRequestClose={() => setSelectedTaskDetail(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedTaskDetail(null)}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Task Details</Text>
              <TouchableOpacity onPress={() => setSelectedTaskDetail(null)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {selectedTaskDetail && (
              <ScrollView>
                <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedTaskDetail.title}</Text>
                
                <View style={styles.detailMetaRow}>
                  <View style={[styles.categoryBadge, { backgroundColor: isDarkMode ? '#1E3A2F' : '#ECFDF5', borderColor: isDarkMode ? '#10B981' : '#D1FAE5' }]}>
                    <Text style={[styles.categoryText, { color: theme.primary }]}>{selectedTaskDetail.category}</Text>
                  </View>
                  <View style={[
                    styles.priorityIndicator,
                    selectedTaskDetail.priority === 'high' && styles.priorityHigh,
                    selectedTaskDetail.priority === 'medium' && styles.priorityMedium,
                    selectedTaskDetail.priority === 'low' && styles.priorityLow,
                  ]}>
                    <Text style={styles.priorityText}>{selectedTaskDetail.priority.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={[styles.detailSection, { borderTopWidth: 1, borderTopColor: theme.border }]}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Description</Text>
                  <Text style={[styles.detailDescription, { color: theme.text }]}>
                    {selectedTaskDetail.description || 'No description provided.'}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Due Date</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Ionicons name="calendar-outline" size={18} color={theme.primary} style={{ marginRight: 8 }} />
                    <Text style={[styles.detailDate, { color: theme.text }]}>{getDayLabel(selectedTaskDetail.date)}</Text>
                  </View>
                </View>
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: theme.primary, marginTop: 20 }]}
              onPress={() => setSelectedTaskDetail(null)}
            >
              <Text style={styles.submitButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Custom Calendar Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDatePickerVisible}
        onRequestClose={() => setIsDatePickerVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsDatePickerVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => changeMonth(-1)}>
                <Ionicons name="chevron-back" size={24} color={theme.primary} />
              </TouchableOpacity>
              <Text style={[styles.calendarMonthText, { color: theme.text }]}>
                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => changeMonth(1)}>
                <Ionicons name="chevron-forward" size={24} color={theme.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekDays}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <Text key={i} style={[styles.weekDayText, { color: theme.textSecondary }]}>{day}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {getCalendarDays().map((day, i) => (
                <TouchableOpacity
                  key={i}
                  disabled={day === null}
                  style={[
                    styles.calendarDay,
                    day !== null && taskDate === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toISOString().split('T')[0] && 
                    { backgroundColor: theme.primary, borderRadius: 10 }
                  ]}
                  onPress={() => day && handleDateSelect(day)}
                >
                  <Text style={[
                    styles.dayText,
                    { color: day === null ? 'transparent' : theme.text },
                    day !== null && taskDate === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toISOString().split('T')[0] && 
                    { color: '#fff' }
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: isDarkMode ? '#334155' : '#F3F4F6', marginTop: 20 }]}
              onPress={() => setIsDatePickerVisible(false)}
            >
              <Text style={[styles.submitButtonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Category Management Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCategoryModalVisible}
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsCategoryModalVisible(false)}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <Pressable style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Manage Categories
                </Text>
                <TouchableOpacity onPress={() => setIsCategoryModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 400 }}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Add New Category</Text>
                  <View style={styles.addCategoryRow}>
                    <TextInput
                      style={[styles.modalInput, { flex: 1, backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                      placeholder="Category name..."
                      placeholderTextColor={theme.textSecondary}
                      value={newCategoryName}
                      onChangeText={setNewCategoryName}
                    />
                    <TouchableOpacity 
                      style={[styles.addCategoryBtn, { backgroundColor: theme.primary }]}
                      onPress={addNewCategory}
                    >
                      <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Your Categories</Text>
                  {categories.map((cat) => (
                    <View 
                      key={cat} 
                      style={[styles.categoryItem, { borderBottomColor: theme.border }]}
                    >
                      <Text style={[styles.categoryItemText, { color: theme.text }]}>{cat}</Text>
                      <TouchableOpacity 
                        onPress={() => deleteCategory(cat)}
                        style={{ padding: 8 }}
                      >
                        <Ionicons name="trash-outline" size={20} color={theme.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: theme.primary, marginTop: 20 }]}
                onPress={() => setIsCategoryModalVisible(false)}
              >
                <Text style={styles.submitButtonText}>Done</Text>
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
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    overflow: 'hidden',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    zIndex: 1,
  },
  greetingTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greeting: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  nameInput: {
    fontSize: 15,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 100,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  collapsibleStats: {
    marginTop: -20,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 10,
    borderBottomWidth: 1,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsHeaderText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statsScopeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statsScopeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statsExpandedContent: {
    marginTop: 20,
    gap: 20,
  },
  statsScopeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  scopeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  scopeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  miniStatNumber: {
    fontSize: 18,
    fontWeight: '900',
  },
  miniStatLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  filterTabsWrapper: {
    marginTop: 20,
    marginBottom: 10,
  },
  filterTabsContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  quickActionButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  catFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  catFilterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tasksSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 15,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
  },
  taskCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskDescriptionText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
    lineHeight: 18,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskMetaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '900',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 10,
  },
  priorityLine: {
    width: 4,
    height: 30,
    borderRadius: 2,
  },
  taskActionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attributionContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  attributionText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  creatorText: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  bottomSpacer: {
    height: 100,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
    zIndex: 999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  modalInput: {
    height: 55,
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  textArea: {
    height: 100,
    paddingTop: 15,
    textAlignVertical: 'top',
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  catOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  prioOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  prioOptionText: {
    fontSize: 13,
    fontWeight: '800',
  },
  priorityPicker: {
    flexDirection: 'row',
    gap: 10,
  },
  submitButton: {
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addCategoryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addCategoryBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  categoryItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 15,
  },
  detailMetaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  priorityIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  priorityHigh: { backgroundColor: '#FEE2E2' },
  priorityMedium: { backgroundColor: '#FEF3C7' },
  priorityLow: { backgroundColor: '#D1FAE5' },
  priorityText: { fontSize: 11, fontWeight: '800' },
  detailSection: {
    paddingVertical: 15,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  detailDate: {
    fontSize: 16,
    fontWeight: '700',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarMonthText: {
    fontSize: 18,
    fontWeight: '900',
  },
  calendarWeekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '800',
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  datePresets: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  manageCategoriesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  manageCategoriesText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
