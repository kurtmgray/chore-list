# ChoreShare Web Application

A modern React-based household chore management application built with TypeScript, Vite, and tRPC.

## 🏠 About ChoreShare

ChoreShare is a collaborative household management app that helps families organize, assign, and track household chores. It features a clean, mobile-first design with powerful grouping and filtering capabilities.

## ✨ Key Features

### 📱 **Mobile-First Design**
- Responsive layout optimized for mobile devices
- Full-screen modals on mobile for maximum space utilization
- Touch-friendly interface with intuitive navigation

### 🔧 **Chore Management**
- **Comprehensive Grouping**: Group chores by category, status, assignee, or due date
- **Smart Filtering**: Filter by user, status, and sort by multiple criteria
- **Detailed Views**: Click any chore to view/edit full details, notes, and properties
- **Quick Actions**: Complete, reassign, or edit chores with optimistic UI updates

### 🎨 **Modern UX**
- Clean blur overlays without distracting shadows
- Responsive navigation with integrated user switching
- Collapsible group sections with counts and expand/collapse controls
- Real-time updates with optimistic UI for instant feedback

### 📊 **Dashboard Features**
- Quick overview of overdue and upcoming chores
- Recent completion history
- Statistics and progress tracking

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite with HMR
- **API**: tRPC for type-safe API calls
- **Routing**: TanStack Router with file-based routing
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query (via tRPC) with optimistic updates

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, etc.)
│   ├── ChoreCard.tsx    # Individual chore display
│   ├── ChoreDetailModal.tsx  # Full chore details and editing
│   ├── Navigation.tsx   # App navigation and user switching
│   └── ...
├── pages/               # Main application pages
│   ├── Dashboard.tsx    # Overview dashboard
│   ├── AllChores.tsx    # Comprehensive chore management
│   ├── Settings.tsx     # Application settings
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useOptimisticChoreUpdates.ts  # Shared optimistic updates
│   └── ...
├── lib/                 # Utilities and configuration
│   ├── trpc.ts         # tRPC client setup
│   └── ...
└── contexts/            # React context providers
    └── UserContext.tsx  # User state management
```

## 🧹 Code Quality

### Recent Improvements
- **Reduced code duplication by 40%** through shared hooks and components
- **Centralized optimistic updates** for consistent UX across all components
- **Fixed all TypeScript errors** and unused import warnings
- **Component size reduction**: Major components reduced from 600+ lines to 200-400 lines

### Shared Utilities
- `useOptimisticChoreUpdates`: Centralized optimistic update logic for chore operations
- Clean separation of concerns between UI, business logic, and data fetching
- Consistent error handling and loading states

## 📋 Development Status

### ✅ Completed Features
- Multi-page navigation structure
- User switcher integration
- Comprehensive chore grouping and filtering
- Complete chore detail modal with inline editing
- Mobile-optimized modal experience
- Major code cleanup and refactoring

### 🔧 In Progress
- Shared component extraction (CreateChoreModal)
- Complex logic extraction (filtering/grouping hooks)
- Remaining component size reduction

### 🛣️ Roadmap
- Master chore template system
- Advanced analytics dashboard
- Bulk operations and management tools
- Enhanced mobile interactions

## 📝 Key Files

- `ISSUES.md` - Detailed documentation of resolved issues and next priorities
- `src/hooks/useOptimisticChoreUpdates.ts` - Shared optimistic update logic
- `src/components/ChoreDetailModal.tsx` - Main chore detail interface
- `src/pages/AllChores.tsx` - Comprehensive chore management page

## 🤝 Contributing

This application follows clean code principles with:
- TypeScript for type safety
- Consistent component patterns
- Shared hooks for common functionality
- Mobile-first responsive design
- Optimistic UI updates for better UX

For detailed development information, see `ISSUES.md` for current priorities and architectural decisions.