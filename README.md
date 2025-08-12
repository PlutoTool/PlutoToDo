# Pluto: To-do

A modern, elegant, and feature-rich cross-platform todo application built with Rust Tauri 2 and TypeScript React.

![Pluto: To-do](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Tech Stack](https://img.shields.io/badge/Tech-Tauri%202%20%7C%20React%20%7C%20TypeScript-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🎯 Core Task Management
- **Create, Edit, Delete Tasks** - Full CRUD operations with intuitive interface
- **Task Completion** - Toggle completion status with visual feedback
- **Subtasks Support** - Organize complex tasks with nested subtasks (2 levels deep)
- **Priority Levels** - High, Medium, Low priority with color coding
- **Due Dates** - Calendar picker with overdue indicators
- **Rich Descriptions** - Detailed task descriptions with markdown support

### 🗂️ Organization Features
- **Categories/Lists** - Custom categories (Work, Personal, Shopping, Health, etc.)
- **Tags System** - Flexible tagging for cross-category organization
- **Smart Search** - Full-text search across titles and descriptions
- **Advanced Filtering** - Filter by completion, priority, due date, category, tags
- **Multiple Sorting** - Sort by due date, priority, creation date, alphabetical

### 🎨 User Experience
- **Space-themed Design** - Cosmic color palette with deep blues and purples
- **Dark Mode Support** - Automatic system preference detection with manual toggle
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Smooth Animations** - Micro-interactions and transitions for better UX
- **Keyboard Shortcuts** - Power user features for efficient navigation

### ⚡ Performance & Technical
- **Cross-Platform** - Windows, macOS, Linux support
- **Local SQLite Database** - Fast, secure, offline-first storage
- **Real-time Updates** - Instant UI updates with optimistic loading
- **Memory Efficient** - < 100MB idle memory usage
- **Fast Startup** - < 2 seconds application launch

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
   npm install
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
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for lightweight state management
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React icon library
- **Date Utilities**: date-fns for date manipulation
- **Form Handling**: React Hook Form with Zod validation

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
- `id` (TEXT, PRIMARY KEY) - Unique category identifier
- `name` (TEXT, NOT NULL) - Category display name
- `color` (TEXT, NOT NULL) - Hex color code for UI
- `icon` (TEXT) - Icon name for display
- `created_at` (DATETIME) - Creation timestamp

#### `tasks`
- `id` (TEXT, PRIMARY KEY) - Unique task identifier
- `title` (TEXT, NOT NULL) - Task title
- `description` (TEXT) - Optional detailed description
- `completed` (BOOLEAN) - Completion status
- `priority` (TEXT) - Priority level (Low/Medium/High)
- `due_date` (DATETIME) - Optional due date
- `category_id` (TEXT) - Foreign key to categories
- `parent_id` (TEXT) - Foreign key for subtasks
- `created_at` (DATETIME) - Creation timestamp
- `updated_at` (DATETIME) - Last modification timestamp

#### `task_tags`
- `task_id` (TEXT) - Foreign key to tasks
- `tag` (TEXT) - Tag name
- Primary key: (task_id, tag)

## ⌨️ Keyboard Shortcuts

- `Cmd/Ctrl + N` - Create new task
- `Cmd/Ctrl + F` - Focus search bar
- `Space` - Toggle task completion (when task selected)
- `Cmd/Ctrl + D` - Delete selected task
- `Escape` - Close modals/cancel actions
- `Enter` - Confirm/submit forms
- `Tab` - Navigate between form fields

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
- `npm run dev` - Start Vite development server
- `npm run build` - Build frontend for production
- `npm run tauri dev` - Start Tauri development with hot reload
- `npm run tauri build` - Build application for production

### Environment Setup
1. **Install Rust**: Follow the official [Rust installation guide](https://www.rust-lang.org/tools/install)
2. **Install Node.js**: Download from [nodejs.org](https://nodejs.org/) or use a version manager
3. **Platform-specific dependencies**:
   - **macOS**: Xcode Command Line Tools
   - **Windows**: Microsoft C++ Build Tools
   - **Linux**: See [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

### IDE Recommendations
- **VS Code** with extensions:
  - Tauri
  - rust-analyzer
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code of Conduct
- Development workflow
- Submitting pull requests
- Issue reporting

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
</div>
