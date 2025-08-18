# Pluto: To-do

A modern, elegant, and### 🎯 Core Task Management
- **Create, Edit, Delete Tasks** - Full CRUD operations with intuitive interface
- **Task Detail Modal** - Comprehensive task detail view with inline editing and metadata display
- **Task Completion** - Toggle completion status with visual feedback and one-click actions
- **Smart Task Deletion** - Intelligent deletion options for tasks with subtasks (delete all or promote subtasks)
- **Bulk Delete Management** - Advanced bulk deletion with smart handling of parent-child relationships
- **Subtasks Support** - Organize complex tasks with nested subtasks (2 levels deep)
- **Hierarchical Task Management** - Expandable/collapsible tree view for task organization
- **Task Progress Tracking** - Visual progress indicators showing subtask completion percentages
- **Smart Task Completion** - Intelligent completion handling for tasks with incomplete subtasks
- **Priority Levels** - High, Medium, Low priority with color coding and visual indicators
- **Due Dates** - Calendar picker with overdue indicators and smart reminders
- **Rich Descriptions** - Detailed task descriptions with markdown support
- **Bulk Operations** - Select multiple tasks for bulk delete, completion, or updatesch cross-platform todo application built with Rust Tauri 2 and TypeScript React. Part of the PlutoTool suite of productivity applications.

![Pluto: To-do](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Tech Stack](https://img.shields.io/badge/Tech-Tauri%202%20%7C%20React%20%7C%20TypeScript-green)
![License](https://img.shields.io/badge/License-LGPL--3.0-yellow)
![Version](https://img.shields.io/badge/Version-1.1.0-orange)

## 🌟 About PlutoTool

Pluto: To-do is part of the **PlutoTool collection** - a comprehensive suite of productivity tools designed to help you stay organized and efficient. Visit [plutotool.com](https://plutotool.com) to discover more tools that can enhance your workflow and productivity.

The PlutoTool ecosystem includes:
- **Task Management** (this app) - Organize your tasks and projects
- **More tools coming soon** - Stay tuned for additional productivity solutions

You can access information about PlutoTool directly from the application by clicking the "About" button in the sidebar.

## 🆕 Recent Updates

### Latest Features (v1.1.0)
- **� Task Detail Modal** - Comprehensive task detail view with inline editing, subtask management, and metadata display
- **🗑️ Smart Delete Options** - Intelligent deletion modals for tasks with subtasks, offering promote or delete options
- **📋 Bulk Delete Management** - Advanced bulk deletion with smart handling of tasks containing subtasks
- **🌙 Dark Mode Improvements** - Enhanced dark mode support with proper styling for all UI components
- **�🔄 Automatic Update Checker** - Check for new releases directly from the sidebar
- **ℹ️ About Section** - New About modal with PlutoTool information and website link
- **✨ Advanced Sorting System** - Sort tasks by multiple fields with ascending/descending options
- **🔄 Bulk Operations** - Select and manage multiple tasks simultaneously
- **🌳 Enhanced Subtask System** - Hierarchical task management with progress tracking and smart completion
- **📊 Task Progress Indicators** - Visual progress bars for parent tasks showing subtask completion
- **🎯 Smart Task Completion** - Intelligent completion handling for tasks with incomplete subtasks
- **📱 Responsive Bulk Actions** - Mobile-optimized floating action buttons and bottom sheets
- **📊 Enhanced UI Components** - Improved dropdowns, modals, and form controls
- **⚡ Performance Optimizations** - Faster task rendering and state management
- **🎨 Better Visual Feedback** - Enhanced icons, animations, and user interactions

## ✨ Features

### 🎯 Core Task Management
- **Create, Edit, Delete Tasks** - Full CRUD operations with intuitive interface
- **Task Completion** - Toggle completion status with visual feedback and one-click actions
- **Subtasks Support** - Organize complex tasks with nested subtasks (2 levels deep)
- **Hierarchical Task Management** - Expandable/collapsible tree view for task organization
- **Task Progress Tracking** - Visual progress indicators showing subtask completion percentages
- **Smart Task Completion** - Intelligent handling when completing tasks with incomplete subtasks
- **Priority Levels** - High, Medium, Low priority with color coding and visual indicators
- **Due Dates** - Calendar picker with overdue indicators and smart reminders
- **Rich Descriptions** - Detailed task descriptions with markdown support
- **Bulk Operations** - Select multiple tasks for bulk delete, completion, or updates

### 🗂️ Organization Features
- **Categories/Lists** - Custom categories with color coding (Work, Personal, Shopping, Health, etc.)
- **Tags System** - Flexible tagging for cross-category organization and filtering
- **Smart Search** - Full-text search across titles, descriptions, and tags with instant results
- **Advanced Filtering** - Filter by completion status, priority level, due date ranges, category, and tags
- **Flexible Sorting** - Sort by name, due date, creation date, update date, priority, or completion status
- **Sort Direction Toggle** - Ascending/descending sorting with visual indicators

### 🎨 User Experience
- **Space-themed Design** - Cosmic color palette with deep blues and purples
- **Enhanced Dark Mode** - Comprehensive dark mode support with proper styling for all components
- **Task Detail Modal** - Rich task detail view with inline editing, subtask navigation, and progress tracking
- **Update Notifications** - Automatic update checking with detailed release notes and one-click downloads
- **About Modal** - Accessible information about the app and PlutoTool with direct website link
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Mobile-Optimized Bulk Actions** - Floating action buttons for desktop, bottom sheets for mobile
- **Expandable Task Hierarchy** - Collapsible tree view with visual depth indicators
- **Subtask Completion Modal** - Smart dialog for handling incomplete subtasks
- **Real-time Progress Indicators** - Live updating progress bars for parent tasks
- **Smooth Animations** - Micro-interactions and transitions for better UX
- **Keyboard Shortcuts** - Power user features for efficient navigation

### ⚡ Performance & Technical
- **Cross-Platform** - Windows, macOS, Linux support with native installers
- **Local SQLite Database** - Fast, secure, offline-first storage with automatic migrations
- **Real-time Updates** - Instant UI updates with optimistic loading and state management
- **Memory Efficient** - < 100MB idle memory usage with optimized Rust backend
- **Fast Startup** - < 2 seconds application launch with lazy loading
- **Batch Operations** - Efficient bulk operations for improved performance
- **Smart Caching** - Intelligent data caching for faster user interactions

## � Update System

### How Updates Work
PlutoToDo includes an intelligent update checking system that:

- **Automatic Checking**: Checks for updates on app startup with 1-hour caching
- **GitHub Integration**: Fetches releases from https://github.com/PlutoTool/PlutoToDo/releases
- **Smart Notifications**: Shows update button in sidebar when new version is available
- **Version Comparison**: Uses semantic versioning to compare current vs. latest releases
- **Release Notes**: Displays detailed changelog and new features in update modal
- **One-Click Downloads**: Direct link to GitHub releases for easy updates

### Update Process
1. **Check for Updates**: Click "Check for Updates" in the sidebar or wait for automatic check
2. **View Details**: If update available, click the highlighted update button to see release notes
3. **Download**: Click "Download Update" to visit the GitHub releases page
4. **Install**: Download and install the appropriate installer for your platform

### Update Settings
- **Caching**: Update checks are cached for 1 hour to avoid excessive API calls
- **Privacy**: No personal data is transmitted during update checks
- **Offline Mode**: App works normally when update checks fail due to network issues

## �🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Rust** (latest stable) - [Install via rustup](https://rustup.rs/)
- **Tauri CLI** - Will be installed automatically with dependencies

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PlutoTool/PlutoToDo.git
   cd PlutoToDo
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start development server**
   ```bash
   npm run tauri dev
   ```

The application will launch automatically in development mode with hot reload enabled.

### Building for Production

1. **Build the application**
   ```bash
   npm run tauri build
   ```

2. **Find your platform-specific installer**
   - **macOS**: `src-tauri/target/release/bundle/dmg/`
   - **Windows**: `src-tauri/target/release/bundle/msi/`
   - **Linux**: `src-tauri/target/release/bundle/deb/` or `src-tauri/target/release/bundle/appimage/`

## 🏗️ Architecture

### Technology Stack

#### Backend (Rust)
- **Framework**: Tauri 2.x (latest stable)
- **Database**: SQLite with rusqlite crate
- **Serialization**: serde & serde_json
- **Date/Time**: chrono for timestamp handling
- **Async Runtime**: tokio for non-blocking operations
- **Error Handling**: thiserror for structured error types

#### Frontend (TypeScript)
- **Framework**: React 18+ with TypeScript 5.8+
- **Build Tool**: Vite 7+ for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system and dark mode support
- **State Management**: Zustand for lightweight, performant state management
- **UI Components**: Custom components with Radix UI primitives for accessibility
- **Icons**: Lucide React icon library with consistent styling
- **Date Utilities**: date-fns for robust date manipulation and formatting
- **Form Handling**: React Hook Form with Zod validation for type-safe forms
- **Animations**: React Spring for smooth micro-interactions and transitions
- **Update System**: Custom update checker with GitHub API integration and caching

### Project Structure
```
pluto-todo/
├── src-tauri/                 # Rust backend
│   ├── src/
│   │   ├── main.rs           # Application entry point
│   │   ├── lib.rs            # Library setup and configuration
│   │   ├── models/           # Data models (Task, Category)
│   │   ├── database/         # Database layer
│   │   │   ├── connection.rs # SQLite connection management
│   │   │   ├── migrations.rs # Database schema migrations
│   │   │   └── repository.rs # Data access layer
│   │   ├── commands/         # Tauri commands (API endpoints)
│   │   │   ├── task_commands.rs # Task CRUD and hierarchy operations
│   │   │   └── category_commands.rs # Category management
│   │   └── utils/            # Utility functions and error handling
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri configuration
├── src/                      # React frontend
│   ├── components/          # React components
│   │   ├── ui/             # Base UI components (Button, Modal, etc.)
│   │   ├── TaskItem.tsx    # Individual task display (legacy)
│   │   ├── SubtaskItem.tsx # Enhanced hierarchical task display
│   │   ├── TaskList.tsx    # Task list container with bulk operations
│   │   ├── TaskForm.tsx    # Task creation/editing form
│   │   ├── TaskDetailModal.tsx # Comprehensive task detail modal with editing
│   │   ├── DeleteTaskOptionsModal.tsx # Smart deletion options for tasks with subtasks
│   │   ├── BulkDeleteOptionsModal.tsx # Bulk deletion management modal
│   │   ├── SortDropdown.tsx # Advanced sorting controls
│   │   ├── SubtaskCompletionModal.tsx # Smart completion dialog
│   │   ├── AboutModal.tsx  # Application information modal
│   │   └── Sidebar.tsx     # Navigation sidebar with update checker
│   ├── stores/             # Zustand state management
│   │   ├── taskStore.ts    # Task-related state with hierarchy support
│   │   └── categoryStore.ts # Category-related state
│   ├── hooks/              # Custom React hooks
│   │   ├── useSidebar.ts   # Sidebar state management
│   │   └── useUpdateChecker.ts # Update checking functionality
│   ├── utils/              # Utility functions
│   │   ├── taskHierarchy.ts # Task relationship and progress utilities
│   │   ├── updateChecker.ts # GitHub API integration for updates
│   │   ├── dateUtils.ts    # Date formatting and manipulation
│   │   ├── priorityUtils.ts # Priority color and display utilities
│   │   └── cn.ts          # Tailwind class name utilities
│   ├── types/              # TypeScript type definitions
│   └── styles/             # CSS and styling
├── public/                   # Static assets
├── package.json             # Node.js dependencies and scripts
└── README.md               # This file
```

## 📊 Database Schema

### Tables

#### `categories`
- `id` (TEXT, PRIMARY KEY) - UUID identifier for unique categorization
- `name` (TEXT, NOT NULL) - Human-readable category display name
- `color` (TEXT, NOT NULL) - Hex color code for consistent UI theming
- `icon` (TEXT) - Optional Lucide icon name for visual identification
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP) - Auto-generated creation timestamp

#### `tasks`
- `id` (TEXT, PRIMARY KEY) - UUID identifier for task uniqueness
- `title` (TEXT, NOT NULL) - Main task title (required field)
- `description` (TEXT) - Optional detailed markdown-supported description
- `completed` (BOOLEAN, DEFAULT FALSE) - Task completion status flag
- `priority` (TEXT, DEFAULT 'Medium') - Priority level enum (Low/Medium/High)
- `due_date` (DATETIME) - Optional deadline with timezone support
- `category_id` (TEXT) - Foreign key reference to categories table
- `parent_id` (TEXT) - Self-referencing foreign key for subtask hierarchy (supports 2 levels deep)
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP) - Auto-generated creation timestamp
- `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP) - Auto-updated modification timestamp

#### `task_progress` (Virtual/Calculated)
- `task_id` (TEXT) - Reference to parent task
- `total_subtasks` (INTEGER) - Total number of direct and nested subtasks
- `completed_subtasks` (INTEGER) - Number of completed subtasks
- `progress_percentage` (REAL) - Calculated completion percentage (0-100)
- `has_subtasks` (BOOLEAN) - Whether the task has any subtasks

#### `task_tags`
- `task_id` (TEXT) - Foreign key reference to tasks table
- `tag` (TEXT, NOT NULL) - Tag name for flexible categorization
- **Primary Key**: Composite key (task_id, tag) preventing duplicate tags per task
- **Indexes**: Optimized for fast tag-based queries and filtering

## ⌨️ Keyboard Shortcuts

### Navigation
- `Cmd/Ctrl + N` - Create new task
- `Cmd/Ctrl + F` - Focus search bar
- `Cmd/Ctrl + ,` - Open preferences/settings
- `Escape` - Close modals/cancel actions
- `Tab` - Navigate between form fields
- `Shift + Tab` - Navigate backwards between form fields

### Task Management
- `Space` - Toggle task completion (when task selected)
- `Cmd/Ctrl + E` - Edit selected task
- `Cmd/Ctrl + D` - Delete selected task (shows smart deletion options for tasks with subtasks)
- `Cmd/Ctrl + Shift + D` - Bulk delete selected tasks (shows bulk deletion options modal)
- `Cmd/Ctrl + I` - Open task detail modal (when task selected)
- `Cmd/Ctrl + A` - Select all tasks
- `Cmd/Ctrl + Shift + A` - Deselect all tasks
- `Enter` - Confirm/submit forms
- `Click Chevron` - Expand/collapse subtasks
- `Shift + Click` - Bulk select range of tasks

### Task Detail Modal
- `Escape` - Close modal/cancel editing
- `Cmd/Ctrl + E` - Edit current task
- `Cmd/Ctrl + S` - Save changes (when editing)
- `Cmd/Ctrl + Delete` - Delete current task
- `Cmd/Ctrl + N` - Add new subtask
- `Tab` - Navigate between subtasks
- `Enter` - Navigate to selected subtask

### Sorting & Filtering
- `Cmd/Ctrl + 1-6` - Quick sort by field (Name, Due Date, Created, Updated, Priority, Status)
- `Cmd/Ctrl + R` - Reverse sort order
- `Cmd/Ctrl + Shift + F` - Open advanced filters

## 🎨 Design System

### Color Palette
- **Primary Blue**: #2563eb - Main actions and focus states
- **Cosmic Purple**: #7c3aed - Accent colors and highlights
- **Success Green**: #10b981 - Completed tasks and success states
- **Warning Orange**: #f59e0b - Medium priority and warnings
- **Danger Red**: #ef4444 - High priority and destructive actions

### Typography
- **Font Family**: Inter - Clean, modern sans-serif
- **Font Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

## 🆕 New Features & Functions

### 📋 Task Detail Modal System

#### TaskDetailModal Component
The new `TaskDetailModal` provides a comprehensive task management interface:
- **Complete Task Overview** - View all task metadata in a single, organized interface
- **Inline Editing** - Edit tasks without leaving the detail view
- **Subtask Management** - Add, view, and navigate subtasks with progress tracking
- **Status Controls** - Quick completion toggle with visual feedback
- **Navigation System** - Breadcrumb-style navigation between parent and child tasks
- **Dark Mode Optimized** - Fully styled for both light and dark themes

#### Enhanced Task Interaction
```typescript
// New task detail functionality
openTaskDetail(taskId: string): void
navigateToSubtask(subtaskId: string): void
navigateToParent(parentId: string): void
toggleTaskFromDetail(taskId: string): Promise<void>
editTaskInline(task: Task): void
deleteTaskFromDetail(taskId: string): Promise<void>

// Modal state management
showTaskDetail: boolean
currentDetailTask: Task | null
taskDetailHistory: string[]  // For navigation breadcrumbs
```

### 🌳 Enhanced Subtask System

#### SubtaskItem Component
The new `SubtaskItem` component provides hierarchical task display with advanced features:
- **Expandable Tree View** - Click chevron icons to expand/collapse subtasks
- **Progress Tracking** - Visual progress bars showing completion percentage
- **Bulk Selection** - Checkbox selection for bulk operations
- **Smart Completion** - Intelligent handling of task completion with incomplete subtasks

#### SubtaskCompletionModal Component
A smart modal that appears when completing tasks with incomplete subtasks:
- **Completion Options** - Choose to complete all subtasks or just the parent task
- **Subtask Preview** - View list of incomplete subtasks before deciding
- **Visual Hierarchy** - Shows task depth with indentation

### 📊 Task Progress System

#### New Utility Functions in `taskHierarchy.ts`
```typescript
// Calculate task progress and completion statistics
buildTaskHierarchy(tasks: Task[]): TaskHierarchy[]
calculateProgressPercentage(taskId: string, allTasks: Task[]): number
getTotalSubtaskCount(taskId: string, allTasks: Task[]): number
getCompletedSubtaskCount(taskId: string, allTasks: Task[]): number

// Task relationship utilities
isAncestorOf(ancestorId: string, descendantId: string, allTasks: Task[]): boolean
getAllDescendants(taskId: string, allTasks: Task[]): Task[]
getRootTask(task: Task, allTasks: Task[]): Task
getTaskDepth(task: Task, allTasks: Task[]): number
```

#### Enhanced Task Store Functions
```typescript
// New state management for task expansion
expandedTasks: Set<string>
toggleTaskExpansion(taskId: string): void

// Advanced task completion with subtask handling
toggleTaskCompletionWithSubtasks(taskId: string, markSubtasksDone?: boolean): Promise<Task>
getIncompleteSubtasks(parentId: string): Promise<Task[]>
calculateTaskProgress(id: string): Promise<TaskProgress>

// Bulk operations
bulkDeleteTasks(taskIds: string[]): Promise<void>
bulkMarkTasksCompleted(taskIds: string[], completed: boolean): Promise<void>
```

### � Task Detail Modal

#### TaskDetailModal Component
A comprehensive modal for viewing and managing task details with advanced features:
- **Rich Task Information** - Complete task metadata including creation/update timestamps, category, priority, and tags
- **Inline Editing** - Edit task details directly within the modal without losing context
- **Status Management** - Toggle task completion with visual feedback and confirmation
- **Subtask Navigation** - Navigate between parent tasks and subtasks with breadcrumb-style navigation
- **Progress Visualization** - Real-time progress bars and completion statistics for subtasks
- **Quick Actions** - Edit, delete, and add subtasks with convenient action buttons
- **Dark Mode Support** - Fully optimized for both light and dark themes
- **Responsive Layout** - Adaptive design for desktop, tablet, and mobile viewports

#### Key Features
```typescript
// Enhanced task detail viewing with metadata
- Task title with completion status and priority indicators
- Rich description display with formatted text
- Due date with overdue warnings and calendar integration
- Category assignment with color-coded visual indicators
- Tag system with searchable and filterable tags
- Creation and modification timestamps

// Advanced subtask management
- Hierarchical navigation between parent and child tasks
- Progress tracking with visual completion percentages
- Quick subtask creation directly from the detail view
- Clickable subtask navigation for deep task exploration

// Seamless editing workflow
- In-place editing without losing modal context
- Form validation with real-time feedback
- Cancel/save functionality with state preservation
```

### 🗑️ Smart Task Deletion System

#### DeleteTaskOptionsModal Component
An intelligent modal that appears when deleting tasks with subtasks, providing smart deletion options:
- **Subtask Detection** - Automatically detects when a task has subtasks and shows appropriate options
- **Delete All Option** - Permanently delete the parent task and all its subtasks with clear warning
- **Promote Subtasks Option** - Delete only the parent task while promoting subtasks up one hierarchy level
- **Visual Warning System** - Clear visual indicators with task counts and impact descriptions
- **User-Friendly Interface** - Easy-to-understand options with descriptive text and icons

#### BulkDeleteOptionsModal Component
Advanced bulk deletion management for multiple selected tasks:
- **Smart Analysis** - Analyzes selected tasks to identify which ones have subtasks
- **Detailed Statistics** - Shows breakdown of tasks with and without subtasks
- **Bulk Delete Options** - Choose to delete all tasks and subtasks or promote subtasks
- **Impact Preview** - Clear visualization of what will be deleted vs. promoted
- **Confirmation Safety** - Multiple confirmation steps to prevent accidental data loss

#### Key Features
```typescript
// Smart deletion logic for individual tasks
interface DeleteTaskOptionsModalProps {
  taskTitle: string;           // Display task name for confirmation
  subtaskCount: number;        // Show number of affected subtasks
  onDeleteWithSubtasks: () => void;      // Delete parent and all children
  onDeleteAndPromoteSubtasks: () => void; // Delete parent, promote children
}

// Bulk deletion with hierarchy awareness
interface BulkDeleteOptionsModalProps {
  totalTasks: number;          // Total number of selected tasks
  tasksWithSubtasks: number;   // Count of parent tasks with children
  onDeleteAll: () => void;     // Delete all selected tasks and their subtasks
  onPromoteSubtasks: () => void; // Delete selected tasks but promote their subtasks
}

// Enhanced deletion workflow
- Visual warnings with task impact analysis
- Clear descriptions of each deletion option
- Hierarchical promotion logic for maintaining task organization
- Undo-safe operations with clear confirmation dialogs
```

### �🔄 Automatic Update System

#### Update Checker Utilities in `updateChecker.ts`
```typescript
// Core update checking functions
checkForUpdates(): Promise<UpdateInfo>
checkForUpdatesWithCache(): Promise<UpdateInfo>
compareVersions(currentVersion: string, newVersion: string): boolean

// Caching system for efficient update checking
getCachedUpdateInfo(): UpdateInfo | null
cacheUpdateInfo(updateInfo: UpdateInfo): void
```

#### useUpdateChecker Hook
```typescript
// React hook for update management
const { updateInfo, isChecking, error, checkForUpdates } = useUpdateChecker()
```

### 📋 Advanced Sorting System

#### SortDropdown Component
Enhanced sorting with multiple criteria:
- **Sort Fields** - Name, Due Date, Created Date, Updated Date, Priority, Status
- **Sort Orders** - Ascending/Descending with visual indicators
- **Responsive Design** - Optimized labels for mobile and desktop
- **Visual Feedback** - Icons showing current sort direction

### 🔄 Bulk Operations System

#### Bulk Action Features
- **Multi-Selection** - Checkbox selection across all tasks and subtasks
- **Floating Action Menu** - Desktop: Bottom-right floating menu, Mobile: Bottom sheet
- **Bulk Actions Available**:
  - Mark multiple tasks as done/undone
  - Delete multiple tasks at once with smart hierarchy handling
  - Clear all selections
- **Smart Deletion Modals** - Intelligent deletion options for tasks with subtasks
- **Confirmation Dialogs** - Smart confirmation with task counts and hierarchy impact analysis
- **Responsive UI** - Adaptive interface for different screen sizes

#### Enhanced Deletion Features
- **Individual Task Deletion** - Smart options when deleting tasks with subtasks (delete all vs. promote)
- **Bulk Deletion Management** - Advanced handling of multiple tasks with different hierarchy structures
- **Subtask Promotion** - Option to promote subtasks when deleting parent tasks
- **Visual Impact Analysis** - Clear preview of what will be deleted vs. promoted before confirmation

## 🔧 Development

### Available Scripts
- `npm run dev` - Start Vite development server (frontend only)
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build locally
- `npm run tauri dev` - Start Tauri development with hot reload (full app)
- `npm run tauri build` - Build application for production with installers

### Environment Setup
1. **Install Rust**: Follow the official [Rust installation guide](https://www.rust-lang.org/tools/install)
2. **Install Node.js**: Download from [nodejs.org](https://nodejs.org/) or use a version manager
3. **Platform-specific dependencies**:
   - **macOS**: Xcode Command Line Tools
   - **Windows**: Microsoft C++ Build Tools
   - **Linux**: See [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

### IDE Recommendations
- **VS Code** with extensions:
  - **Tauri** - Official Tauri development support
  - **rust-analyzer** - Advanced Rust language server
  - **TypeScript and JavaScript Language Features** - Built-in TS/JS support
  - **Tailwind CSS IntelliSense** - CSS class autocomplete and validation
  - **ES7+ React/Redux/React-Native snippets** - React development shortcuts
  - **Prettier** - Code formatting consistency
  - **ESLint** - JavaScript/TypeScript linting

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
- **Issue**: `cargo build` fails with linker errors
  - **Solution**: Ensure platform-specific build tools are installed (see Environment Setup)
- **Issue**: `npm install` fails with peer dependency warnings
  - **Solution**: Use `npm install --legacy-peer-deps` to resolve dependency conflicts

#### Runtime Issues
- **Issue**: Database connection errors
  - **Solution**: Check file permissions and ensure SQLite is properly initialized
- **Issue**: App window doesn't appear on launch
  - **Solution**: Try `npm run tauri dev -- --debug` for verbose logging

#### Development Environment
- **Issue**: Hot reload not working
  - **Solution**: Restart the development server and clear browser cache
- **Issue**: TypeScript compilation errors
  - **Solution**: Run `npx tsc --noEmit` to check for type issues

### Performance Tips
- Close unnecessary applications to free up system resources
- Use `npm run tauri build` for production testing
- Monitor memory usage with development tools
- Clear application data if experiencing slowdowns

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Getting Started
1. **Fork the repository** on GitHub
2. **Clone your fork** locally: `git clone https://github.com/PlutoTool/PlutoToDo.git`
3. **Create a feature branch**: `git checkout -b feature/your-feature-name`
4. **Install dependencies**: `npm install --legacy-peer-deps`
5. **Start development**: `npm run tauri dev`

### Development Guidelines
- Follow the existing code style and conventions
- Add TypeScript types for all new code
- Test your changes thoroughly across platforms
- Update documentation for new features
- Write clear, descriptive commit messages

### Submitting Changes
1. **Test your changes**: Ensure the app builds and runs correctly
2. **Update documentation**: Add or update relevant documentation
3. **Commit your changes**: `git commit -m "feat: add your feature description"`
4. **Push to your fork**: `git push origin feature/your-feature-name`
5. **Create a Pull Request** with a clear description of your changes

### Code of Conduct
- Be respectful and inclusive in all interactions
- Focus on constructive feedback and collaboration
- Help maintain a welcoming community for all contributors

For major changes, please open an issue first to discuss what you would like to change.

## 🗓️ Roadmap

### Upcoming Features (v1.1.0)
- **📱 Mobile Responsiveness** - Enhanced touch interface and mobile optimization
- **🔄 Data Sync** - Optional cloud synchronization across devices
- **📋 Task Templates** - Reusable task templates for common workflows
- **📈 Analytics Dashboard** - Productivity insights and completion statistics
- **🎨 Theme Customization** - Custom color themes and layout options
- **🔍 Advanced Search** - Filter by date ranges, tags, and task hierarchy
- **⚡ Keyboard Navigation** - Full keyboard support for power users

### Future Enhancements (v1.2.0+)
- **🔗 Integrations** - Calendar sync (Google Calendar, Outlook)
- **📊 Advanced Reporting** - Detailed productivity reports and exports
- **👥 Collaboration** - Shared lists and team task management  
- **🔔 Smart Notifications** - Context-aware reminders and alerts
- **🌐 Web Version** - Browser-based access with PWA support
- **📱 Mobile Apps** - Native iOS and Android applications
- **🏷️ Advanced Tagging** - Tag hierarchies and smart tag suggestions

### Long-term Vision
- **🤖 AI Integration** - Smart task suggestions and auto-categorization
- **🔌 Plugin System** - Third-party extensions and customizations
- **📦 Backup & Restore** - Automated backup solutions and data migration
- **🌍 Internationalization** - Multi-language support and localization

## 📝 License

This project is licensed under the GNU Lesser General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tauri Team** - For the amazing cross-platform framework
- **React Team** - For the robust UI library
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icon set
- **Rust Community** - For the powerful and safe systems programming language

---

<div align="center">
  <p>Built with ❤️ using Rust and TypeScript</p>
  <p>Made for organizing your universe, one task at a time 🌌</p>
  <p><strong>Part of the PlutoTool ecosystem</strong> - Visit <a href="https://plutotool.com">plutotool.com</a> for more productivity tools</p>
</div>
