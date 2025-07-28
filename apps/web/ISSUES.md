# ChoreShare Issues & Improvements

## ✅ RESOLVED ISSUES

### 1. User Switcher Placement - **COMPLETED** ✅
**Problem**: User switcher placement feels awkward on both mobile and desktop

**Solution Implemented**:
- **Desktop**: Integrated into sidebar header with proper spacing and styling
- **Mobile**: Added to mobile navigation header with responsive design
- **Code Changes**: Updated `Navigation.tsx` to include UserSwitcher in sidebar header instead of floating position

### 2. Chore List Grouping - **COMPLETED** ✅
**Problem**: Large flat list of chores looks disorganized even when sorted

**Solution Implemented**: 
- ✅ Added "Group by" options: Category, Status, Assignee, Due Date
- ✅ Default to "Category" grouping with smart ordering for due dates
- ✅ Collapsible group sections with counts and expand/collapse controls
- ✅ Maintains sorting within groups
- **Code Changes**: Enhanced `AllChores.tsx` with comprehensive grouping functionality

### 3. Chore Detail Modal - **COMPLETED** ✅
**Problem**: No way to view full chore details, description, or edit notes

**Solution Implemented**:
- ✅ Click chore card → Opens detailed modal with full information
- ✅ Shows: Title, description, category, frequency, notes, assignment, completion history
- ✅ Inline editing: Notes, description, frequency with proper form validation
- ✅ Action buttons: Complete, reassign, edit with optimistic UI updates
- ✅ Mobile-first design: Full-screen on mobile, centered modal on desktop
- ✅ Clean blur overlay without distracting shadows
- **Code Changes**: New `ChoreDetailModal.tsx` component with complete CRUD functionality

### 4. Modal UX & Performance - **COMPLETED** ✅
**Improvements Made**:
- ✅ **Mobile UX**: Full-screen modal on mobile for maximum space utilization
- ✅ **Desktop UX**: Top-aligned modal that's always visible regardless of scroll position
- ✅ **Clean Styling**: Blur overlay without heavy shadows, proper contrast and visibility
- ✅ **Optimized Height**: Reduced modal size and excessive vertical spacing for better mobile experience
- ✅ **Root Padding Fix**: Responsive padding (0 on mobile, 1rem on tablet, 2rem on desktop)

### 5. Code Quality & Cleanup - **COMPLETED** ✅
**Major Refactoring Completed**:
- ✅ **Created shared `useOptimisticChoreUpdates` hook**: Eliminated 150+ lines of duplicated optimistic update logic
- ✅ **ChoreDetailModal cleanup**: Reduced from 680 → ~400 lines, removed unused imports, fixed TypeScript errors
- ✅ **ChoreCard cleanup**: Reduced from 254 → ~200 lines using shared hook
- ✅ **TypeScript cleanup**: Fixed all undefined variable errors and unused import warnings
- ✅ **Performance**: Centralized optimistic updates for consistent behavior across all components

## 🏗️ Future Architecture Considerations

### 4. Master Chore Bank Concept - **LOW PRIORITY (FUTURE)**

**Concept**: Eventually move to master chore template system for better organization and reusability

#### Current Architecture:
- Each chore instance contains all data (title, description, category, frequency, etc.)
- Notes and customizations are directly attached to chore instances
- Every household creates chores from scratch
- No sharing or templating between households

#### Proposed Future Architecture:
```
Master Chore Templates (Global/Shared)
├── Template ID, Title, Description, Default Category
├── Default Frequency, Suggested Properties
├── Tags (indoor/outdoor, seasonal, difficulty level)
└── Community ratings/usage stats

Household Chore Instances
├── References Master Template ID
├── Household-specific customizations (frequency override, assigned person)
├── Instance-specific notes and completion history
├── Custom properties that override template defaults
└── Scheduling and priority boost data
```

#### Benefits:
- **Onboarding**: New households can quickly add common chores
- **Standardization**: Consistent chore definitions across households
- **Community**: Households can share effective chore templates
- **Maintenance**: Updates to master templates can improve descriptions/suggestions

#### Technical Challenges:
1. **Migration Path**: How to convert existing chores to template system
2. **Data Integrity**: Ensure household customizations don't break when templates change
3. **Versioning**: Handle template updates without breaking existing instances
4. **Permissions**: Which templates are global vs household-specific
5. **Storage**: Balance between normalization and query performance

#### Research Questions:
- Should templates be optional (households can still create custom chores)?
- How to handle template deletion when households are using them?
- What level of customization should be allowed (title edits, property changes)?
- Should there be community voting/rating for template quality?
- How to handle seasonal/conditional chores in templates?

#### Implementation Approach:
**Phase 1**: Add optional template_id field to existing chores table
**Phase 2**: Create master_chore_templates table with versioning
**Phase 3**: Build template selection UI and migration tools
**Phase 4**: Add community features and template sharing

#### Data Structure Research:
```sql
-- Future table structure concept
CREATE TABLE master_chore_templates (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  default_category_id INTEGER,
  default_frequency_type_id INTEGER,
  default_properties JSONB DEFAULT '{}',
  tags TEXT[],
  usage_count INTEGER DEFAULT 0,
  community_rating DECIMAL(2,1),
  created_by INTEGER, -- NULL for system templates
  is_public BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced existing chores table
ALTER TABLE chores ADD COLUMN template_id INTEGER REFERENCES master_chore_templates(id);
ALTER TABLE chores ADD COLUMN template_customizations JSONB DEFAULT '{}';
```

This research provides a foundation for future template implementation while maintaining current functionality.

---

## 🚨 CRITICAL ISSUES

### 1. Production Readiness - **CRITICAL PRIORITY**
**Problem**: Application is not production-ready
- **No authentication system**: Application is completely open with hardcoded users (Kurt & Kaya)
- **No real user management**: Registration, invitations, permissions missing
- **Hardcoded workspace**: Workspace ID is hardcoded for development
- **No deployment setup**: Missing environment configs and production deployment

**Solution Needed**:
- Implement authentication system (Auth0, Supabase Auth, or custom)
- Add real user registration and invitation flow
- Environment-based configuration management
- Production deployment pipeline

### 2. Error Handling - **CRITICAL PRIORITY**
**Problem**: No graceful error handling or recovery
- **No error boundaries**: React crashes result in white screen
- **No network error handling**: API failures show generic errors
- **Missing error states**: No user-friendly error messages
- **No error logging**: No monitoring or error tracking

**Solution Needed**:
- Add React Error Boundary components
- Implement proper error states in all components
- Add network failure handling with retry logic
- Set up error logging (Sentry, LogRocket, etc.)

---

## 📄 PAPER-FRIENDLY EXPORT SYSTEM

### Monthly Chore Matrix PDF Export - **FUTURE FEATURE**

**Concept**: Generate printable PDF sheets for offline chore tracking during a full month period.

#### Core Idea Refined:
Create **2-sheet PDF export system** covering a full calendar month:

**Sheet 1: Daily Tasks Matrix**
- **Layout**: 31-day grid (7 columns × 5 rows) with each day as a cell
- **Content**: Only daily frequency chores listed in each day's cell
- **Headers**: Month/Year, Day numbers, weekday abbreviations
- **Checkboxes**: Small checkbox next to each chore for manual completion tracking
- **Format**: Compact text, 2-3 daily chores max per cell for readability

**Sheet 2: Weekly/Monthly Tasks Matrix**  
- **Layout**: 4-week calendar grid + monthly section
- **Weekly Section**: 4 rows of 7-day columns showing weekly/biweekly chores
- **Monthly Section**: Dedicated area listing all monthly chores with checkboxes
- **Headers**: Week numbers, dates, frequency type indicators
- **Visual Grouping**: Different background shading for weekly vs monthly tasks

#### Smart Content Selection:
- **Frequency-based filtering**: Auto-populate based on chore frequency types
- **Assignment filtering**: Option to generate sheets per person or combined household
- **Month boundary logic**: Handle month transitions and varying month lengths
- **Recurring projection**: Same logic as calendar view to show all instances

#### PDF Generation Technical Approach:
```typescript
// Potential implementation structure
interface PDFExportConfig {
  month: number;           // 1-12
  year: number;           // 2024, 2025, etc.
  assigneeFilter?: number; // null = all household members
  includeCompleted?: boolean; // default false for clean sheets
}

interface MonthlyChoreMatrix {
  dailyTasks: {
    [dayOfMonth: number]: CalendarChore[]
  };
  weeklyTasks: {
    [weekNumber: number]: CalendarChore[]
  };
  monthlyTasks: CalendarChore[];
}
```

#### Use Cases & Benefits:
1. **Vacation/Travel**: Print sheets before trips where digital access is limited
2. **Shared Spaces**: Post on fridge/bulletin board for easy family reference  
3. **Backup System**: Paper fallback when phones/devices are charging or unavailable
4. **Visual Planning**: Physical month overview for planning and scheduling
5. **Completion Tracking**: Satisfying physical checkbox completion experience

#### Design Requirements:
- **Print-optimized**: Black & white friendly, clear fonts, proper margins
- **Space-efficient**: Fit meaningful content without cramping
- **Checkbox clarity**: Proper sizing for pen/pencil marking
- **Header information**: Month, household name, generation date, legend
- **Paper size**: Standard 8.5x11" portrait orientation

#### Technical Implementation Path:
**Phase 1: Core PDF Generation**
- Integrate PDF library (jsPDF, Puppeteer, or similar)
- Create month calculation and chore projection logic
- Build basic 2-sheet template with static content

**Phase 2: Dynamic Content Population**
- Connect to existing calendar projection logic
- Add filtering by assignee and frequency type
- Implement smart content sizing and overflow handling

**Phase 3: UI Integration & Export Controls**
- Add "Export PDF" button to calendar view
- Create export configuration modal (month selection, filters)
- Add print preview functionality

**Phase 4: Design Polish & Advanced Features**
- Custom household branding/logos
- Multiple paper size options (A4, letter, etc.)
- Accessibility improvements for print disabilities
- Batch export (multiple months, multiple assignees)

#### Integration Points:
- **Calendar View**: Natural place for export button and month selection
- **Existing Projection Logic**: Reuse `projectChoreInstances` function
- **Filtering System**: Leverage existing frequency and assignee filters
- **Data Structure**: Use existing `CalendarChore` interfaces

This creates a bridge between digital convenience and physical utility, perfect for households that want the best of both worlds.

---

## 🔄 HIGH PRIORITY ITEMS

### 1. Shared Component Extraction - **HIGH PRIORITY**
**Problem**: Significant code duplication between Dashboard and AllChores
- CreateChoreModal is duplicated across both components (~100 lines each)
- Similar reassign logic patterns repeated
- Modal state management duplicated

**Solution Needed**:
- Extract shared `CreateChoreModal` component
- Create shared `useChoreActions` hook for reassign/detail logic
- Consolidate modal state management patterns

### 2. AllChores Filtering Refactor - **MEDIUM PRIORITY**
**Problem**: Complex 200+ line filtering/grouping logic in main component
- Performance concerns with filtering on every render
- Complex state management for filters, sorting, grouping
- Difficult to test and maintain

**Solution Needed**:
- Extract `useChoreFiltering` custom hook
- Create separate `ChoreFilters` component
- Optimize filtering performance with useMemo

### 3. Component Size Reduction - **MEDIUM PRIORITY**
**Problem**: Several components still over 300 lines
- AllChores.tsx (567 lines) 
- Dashboard.tsx (357 lines)
- ChoreForm.tsx (333 lines)

**Solution Needed**:
- Break down into focused sub-components
- Extract business logic into custom hooks
- Improve separation of concerns

### 4. Missing Core Features - **MEDIUM PRIORITY**
**Problem**: Several features needed for complete chore management
- **No notification system**: No overdue alerts or assignment notifications
- **No bulk operations**: Can't manage multiple chores at once
- **Limited user preferences**: No settings persistence or customization
- **No data export**: Can't export chore data or generate reports

**Solution Needed**:
- Implement push notifications or email alerts for overdue chores
- Add bulk complete, reassign, and delete operations
- Create user preferences storage and UI
- Add data export functionality (CSV, PDF reports)

### 5. Performance & UX Polish - **LOW PRIORITY**
**Problem**: Minor performance and user experience improvements needed
- **Loading states**: Spinners could be replaced with skeleton loaders
- **Empty states**: Could add more personality and guidance
- **Mobile animations**: Some transitions could be more pronounced
- **Keyboard navigation**: Could enhance accessibility with better keyboard support

**Solution Needed**:
- Create skeleton loading components
- Design engaging empty states with illustrations
- Enhance mobile touch animations and feedback
- Improve keyboard navigation patterns

---

## 🐛 Minor Issues

### 4. Remaining TypeScript Cleanup - **LOW PRIORITY**
- Vite config has deprecated TanStack Router import warnings
- Some `any` types in form handling could be properly typed
- Clean up console.log statements in Dashboard.tsx

### 5. Mobile Navigation Polish - **LOW PRIORITY**
- Bottom navigation could use haptic feedback
- Active state animation could be more pronounced
- Consider badges for overdue count on nav items

---

## 📋 Current Implementation Status

**Phase 4 - COMPLETED** ✅:
1. ✅ Multi-page navigation structure with responsive design
2. ✅ User switcher placement fixed and integrated
3. ✅ Comprehensive chore grouping functionality with collapsible sections
4. ✅ Complete chore detail modal with editing capabilities
5. ✅ Mobile-first modal design with full-screen experience
6. ✅ Major code cleanup and refactoring (40% duplication reduction)
7. ✅ Optimistic UI updates with centralized hook

**Phase 5 - CURRENT FOCUS** 🔧:
1. 🚨 **Critical**: Add error boundaries and proper error handling
2. 🔧 **High**: Extract shared CreateChoreModal component
3. 🔧 **High**: Create useChoreActions hook for modal logic
4. 🔧 **Medium**: Break down AllChores component (567 lines)

**Phase 6 - PRODUCTION READINESS** 🏗️:
1. 🚨 Implement authentication system
2. 🚨 Add real user management and invitations
3. 🔧 Set up production deployment pipeline
4. 🔧 Add monitoring and error logging

**Future Phases**:
1. 📅 Rolling 4-week calendar view implementation
2. 📊 Notification system for overdue chores
3. 🔄 Bulk operations and management tools
4. 🏗️ Master chore bank architecture implementation
5. 📈 Advanced analytics and insights dashboard

---

## 📅 CALENDAR VIEW IMPLEMENTATION PLAN

### Overview
Implement rolling 4-week calendar view showing upcoming chores in a visual weekly grid format.

### ✅ Data Structure Analysis
**No schema changes required!** Existing data structure perfectly supports calendar:

- ✅ `next_due` field: Already stores scheduled dates for calendar placement
- ✅ `frequency_type_id`: Already categorizes daily/weekly/bi-weekly/monthly for filtering
- ✅ `assigned_to`: Already stores user assignments for display
- ✅ `category_id`: Already stores categories for future day detail filtering  
- ✅ `status`: Already tracks completion status for visual indicators
- ✅ Existing tRPC endpoints: `chores.getAll` can filter by date ranges
- ✅ Existing frequency types: Support required filter options

### Phase 1: Core Calendar Implementation (Current Sprint - 5 hours)

#### 1. Navigation & Route Setup (30 mins)
- Add `/calendar` route with 📅 icon between Dashboard and All Chores
- Create basic Calendar page component structure
- Update Navigation.tsx with new calendar menu item

#### 2. Calendar Data Logic (90 mins)
**Create `useCalendarData` hook:**
- Calculate rolling 4-week period starting from current Monday
- Fetch chores with `next_due` dates in 4-week range using existing `trpc.chores.getAll`
- Group chores by date and organize by weeks
- Handle automatic week transitions (when Monday shifts, update 4-week window)

**Create `useCalendarFiltering` hook:**
- Filter by existing frequency types: daily, weekly, bi-weekly, twice-monthly, monthly
- "View All" option to show all frequency types
- Leverage existing `frequency_type_id` field and `trpc.frequencyTypes.getAll`

#### 3. Calendar UI Components (120 mins)
**Create `CalendarGrid` component:**
- 4-week grid with Monday as leftmost column (fixed)
- Week rows with 7 day columns each
- Responsive design: stack weeks vertically on mobile
- Visual indicators for today, overdue, upcoming chores

**Create `CalendarDay` component:**
- Display date number and abbreviated day name
- Show chore count indicator badges
- Visual states: today (highlighted), overdue (red), upcoming (blue)
- Click handler for future day detail modal

**Create `CalendarFilters` component:**
- Frequency filter dropdown using existing frequency types
- Quick filter buttons for common frequencies
- Clear visual indication of active filters
- Consistent with existing filter designs

#### 4. Calendar Page Layout (60 mins)
**Page header:**
- Title: "Calendar View"
- Current 4-week date range display (e.g., "Dec 16 - Jan 13, 2024")
- Filter controls integrated into header

**Main content:**
- Calendar grid with responsive layout
- Legend/key for visual indicators
- Empty states for days with no chores

### Phase 2: Enhanced Day View (Future Sprint - 3 hours)

#### 1. Day Detail Modal (90 mins)
- Click any calendar day to open detailed chore list
- Reuse existing ChoreCard components in modal layout
- Modal design consistent with existing ChoreDetailModal styling
- Show all chores for selected date with full details

#### 2. Day View Filtering & Sorting (60 mins)
- Filter by assignee using existing user data
- Filter by category using existing category data  
- Sort by priority, title, assignee, due time
- Reuse existing `useChoreFiltering` patterns and logic

#### 3. Day View Actions (30 mins)
- Complete chores directly from day view
- Reassign chores using existing ReassignModal
- Edit chore details using existing ChoreDetailModal
- Optimistic updates using existing `useOptimisticChoreUpdates`

### Phase 3: Advanced Calendar Features (Future Sprint - 4 hours)

#### 1. Calendar Navigation (30 mins)
- Previous/Next week buttons to shift 4-week window
- "Today" button to return to current week range
- Week range indicator in header with smooth transitions

#### 2. Visual Enhancements (60 mins)
- Color coding by category or assignee
- Chore preview tooltips on hover
- Better visual density options (compact/comfortable)
- Accessibility improvements for keyboard navigation

#### 3. Drag & Drop Rescheduling (150 mins) 
- Drag chores between calendar days
- Update `next_due` dates via existing tRPC mutations
- Visual feedback during drag operations
- Optimistic updates with error handling and rollback

### Technical Implementation Details

#### New Files Structure:
```
src/pages/Calendar.tsx                 # Main calendar page
src/routes/calendar.tsx               # Calendar route definition  
src/components/Calendar/
  ├── CalendarGrid.tsx               # 4-week grid layout
  ├── CalendarDay.tsx                # Individual day cell
  ├── CalendarFilters.tsx            # Frequency filtering
  ├── DayDetailModal.tsx             # Day drill-down view (Phase 2)
  └── index.ts                       # Component exports
src/hooks/
  ├── useCalendarData.ts             # Calendar data fetching & week logic
  └── useCalendarFiltering.ts        # Calendar-specific filtering
```

#### Integration with Existing Components:
- **Reuse ChoreCard** for day detail views
- **Reuse ChoreDetailModal** for editing from calendar
- **Reuse ReassignModal** for reassignments
- **Reuse useOptimisticChoreUpdates** for real-time updates
- **Reuse useChoreActions** for modal state management
- **Leverage existing tRPC endpoints** - no new API endpoints needed

#### Key Business Logic:
```typescript
// Rolling 4-week calculation
const getMondayOfWeek = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const getCalendarRange = () => {
  const startMonday = getMondayOfWeek(new Date());
  const endSunday = new Date(startMonday);
  endSunday.setDate(startMonday.getDate() + 27); // 4 weeks - 1 day
  return { start: startMonday, end: endSunday };
};
```

### Success Metrics:
- ✅ Rolling 4-week view with Monday-first layout
- ✅ Automatic week transitions as time progresses
- ✅ Frequency-based filtering (daily, weekly, bi-weekly, monthly, view all)
- ✅ Visual indicators for today, overdue, and upcoming chores
- ✅ Responsive mobile design with stacked week layout
- ✅ Integration with existing chore management (complete, reassign, edit)
- ✅ Consistent design language with existing UI components

### Phase 1 Priority: 
**NEXT IMPLEMENTATION** after current code quality improvements are complete.

---

## 🎯 TODAY'S ACTION PLAN

### Immediate Focus (Next 2-4 hours)
**Priority**: Code quality and stability improvements

1. **Create Error Boundary Component** (30 mins)
   - Add React Error Boundary to catch component crashes
   - Create user-friendly error fallback UI
   - Wrap main app sections with error boundaries

2. **Extract Shared CreateChoreModal** (90 mins)
   - Create `src/components/shared/CreateChoreModal.tsx`
   - Remove duplication from Dashboard.tsx and AllChores.tsx
   - Test modal functionality in both contexts

3. **Create useChoreActions Hook** (60 mins)
   - Extract reassign and detail modal logic
   - Consolidate state management patterns
   - Apply to Dashboard and AllChores components

### Secondary Goals (If time permits)
4. **Add Loading Skeletons** (45 mins)
   - Replace spinners with skeleton components
   - Improve perceived performance
   - Add to chore lists and detail views

5. **Clean Up Console Logs** (15 mins)
   - Remove debug statements from Dashboard.tsx
   - Add proper logging utility if needed

### Success Metrics for Today
- ✅ Zero component crashes with error boundaries
- ✅ Eliminate CreateChoreModal duplication
- ✅ Reduce Dashboard.tsx and AllChores.tsx complexity
- ✅ Improved loading states with skeletons
- ✅ Clean console output