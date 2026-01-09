# DnwTaskMaster - Local Storage Setup

## 🚀 Installation Guide (සිංහලෙන්)

### Step 1: AsyncStorage Package එක Install කරන්න

PowerShell execution policy issue එක නිසා, පළමුව PowerShell එක **Administrator mode** එකෙන් open කරන්න and මේ command එක run කරන්න:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

එහෙම නැත්තං project folder එකට ගිහින් command prompt (cmd) එකෙන් run කරන්න:

```bash
npm install @react-native-async-storage/async-storage
```

හෝ Expo CLI use කරලා:

```bash
npx expo install @react-native-async-storage/async-storage
```

### Step 2: App එක Run කරන්න

```bash
npm start
# හෝ
npx expo start
```

## 📱 Features

### දැන් App එකෙ තියන Features:

1. **Tasks Local Storage එකට Save වෙනවා** ✅

   - App එක close කරලා ආයෙ open කරත් tasks තියෙනවා

2. **Auto Save** ✅

   - Task එකක් complete/un-complete කරත් automatically save වෙනවා

3. **Default Tasks** ✅
   - පළමු වතාවට app එක open කරද්දී sample tasks 5ක් load වෙනවා

## 🔧 Local Storage Functions

### ලේසියෙන් තේරුම් ගන්න පුළුවන් විදිහට:

**`utils/storage.ts`** file එකෙ තියෙන functions:

- **`saveTasks(tasks)`** - Tasks save කරනවා
- **`loadTasks()`** - Tasks load කරනවා
- **`addTask(task)`** - New task එකක් add කරනවා
- **`updateTask(id, updates)`** - Task එකක් update කරනවා
- **`deleteTask(id)`** - Task එකක් delete කරනවා
- **`toggleTaskCompletion(id)`** - Task completion toggle කරනවා
- **`clearAllTasks()`** - හැම task එකම clear කරනවා

## 📝 Code එක Use කරන විදිහ

### Example 1: Tasks Load කරන එක

```typescript
import { loadTasks } from "@/utils/storage";

const tasks = await loadTasks();
console.log("Loaded tasks:", tasks);
```

### Example 2: New Task එකක් Add කරන එක

```typescript
import { addTask } from "@/utils/storage";

const newTask = await addTask({
  title: "My new task",
  category: "Work",
  completed: false,
  priority: "high",
});
```

### Example 3: Task එකක් Complete කරන එක

```typescript
import { toggleTaskCompletion } from "@/utils/storage";

await toggleTaskCompletion("task-id-here");
```

## 🎯 දැනට කරලා තියන දේවල්

- ✅ AsyncStorage utility functions
- ✅ Auto save on task changes
- ✅ Auto load on app start
- ✅ Error handling with alerts
- ✅ Default tasks for first-time users

## 🔜 Future Enhancements (පස්සෙ add කරන්න පුළුවන්)

- Add new task form
- Edit task functionality
- Delete task functionality
- Filter tasks by category
- Search tasks
- Sort tasks by priority/date

## 💡 Notes

- මේ app එකෙ tasks device එකේ local storage එකට save වෙනවා
- Internet connection එකක් ඕනෙ නෑ
- App එක uninstall කරද්දී විතරයි data එක clear වෙන්නෙ
