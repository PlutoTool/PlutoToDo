# Pluto: To-do

A modern, elegant, and feature-rich cross-platform todo application built with Rust Tauri 2 and TypeScript React. Part of the PlutoTool suite of productivity applications.

![Pluto: To-do](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Tech Stack](https://img.shields.io/badge/Tech-Tauri%202%20%7C%20React%20%7C%20TypeScript-green)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

## 🌟 About PlutoTool

Pluto: To-do is part of the **PlutoTool collection** - a comprehensive suite of productivity tools designed to help you stay organized and efficient. Visit [plutotool.com](https://plutotool.com) to discover more tools that can enhance your workflow and productivity.

The PlutoTool ecosystem includes:
- **Task Management** (this app) - Organize your tasks and projects
- **More tools coming soon** - Stay tuned for additional productivity solutions

You can access information about PlutoTool directly from the application by clicking the "About" button in the sidebar.

## 🆕 Recent Updates

### Latest Features (v1.0.0)
- **ℹ️ About Section** - New About modal with PlutoTool information and website link
- **✨ Advanced Sorting System** - Sort tasks by multiple fields with ascending/descending options
- **🔄 Bulk Operations** - Select and manage multiple tasks simultaneously
- **📊 Enhanced UI Components** - Improved dropdowns, modals, and form controls
- **⚡ Performance Optimizations** - Faster task rendering and state management
- **🎨 Better Visual Feedback** - Enhanced icons, animations, and user interactions

## ✨ Features

### 🎯 Core Task Management
- **Create, Edit, Delete Tasks** - Full CRUD operations with intuitive interface
- **Task Completion** - Toggle completion status with visual feedback and one-click actions
- **Subtasks Support** - Organize complex tasks with nested subtasks (2 levels deep)
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
- **Dark Mode Support** - Automatic system preference detection with manual toggle
- **About Modal** - Accessible information about the app and PlutoTool with direct website link
- **Responsive Design** - Optimized for desktop, tablet, and mobile
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

## 🚀 Quick Start

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
│   │   │   ├── task_commands.rs
│   │   │   └── category_commands.rs
│   │   └── utils/            # Utility functions and error handling
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri configuration
├── src/                      # React frontend
│   ├── components/          # React components
│   │   ├── ui/             # Base UI components
│   │   ├── TaskItem.tsx    # Individual task display
│   │   ├── TaskList.tsx    # Task list container
│   │   ├── TaskForm.tsx    # Task creation/editing form
│   │   └── Sidebar.tsx     # Navigation sidebar
│   ├── stores/             # Zustand state management
│   │   ├── taskStore.ts    # Task-related state
│   │   └── categoryStore.ts # Category-related state
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
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
- `parent_id` (TEXT) - Self-referencing foreign key for subtask hierarchy
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP) - Auto-generated creation timestamp
- `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP) - Auto-updated modification timestamp

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
- `Cmd/Ctrl + D` - Delete selected task
- `Cmd/Ctrl + A` - Select all tasks
- `Cmd/Ctrl + Shift + A` - Deselect all tasks
- `Enter` - Confirm/submit forms

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

### Future Enhancements (v1.2.0+)
- **🔗 Integrations** - Calendar sync (Google Calendar, Outlook)
- **📊 Advanced Reporting** - Detailed productivity reports and exports
- **👥 Collaboration** - Shared lists and team task management  
- **🔔 Smart Notifications** - Context-aware reminders and alerts
- **🌐 Web Version** - Browser-based access with PWA support
- **📱 Mobile Apps** - Native iOS and Android applications

### Long-term Vision
- **🤖 AI Integration** - Smart task suggestions and auto-categorization
- **🔌 Plugin System** - Third-party extensions and customizations
- **📦 Backup & Restore** - Automated backup solutions and data migration
- **🌍 Internationalization** - Multi-language support and localization

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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
