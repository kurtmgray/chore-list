# ChoreShare Issues & Improvements

## 🔧 Navigation & UX Issues

### 1. User Switcher Placement - **HIGH PRIORITY**
**Problem**: User switcher placement feels awkward on both mobile and desktop
- **Desktop**: Fixed top-right position conflicts with sidebar design
- **Mobile**: Header placement doesn't feel natural

**Solution Needed**: 
- **Desktop**: Move to sidebar header area, integrate with navigation
- **Mobile**: Consider bottom sheet or profile icon in header

### 2. Chore List Grouping - **HIGH PRIORITY**
**Problem**: Large flat list of chores looks disorganized even when sorted
- Current sorting helps but visual grouping would be much clearer
- Category grouping makes most logical sense

**Solution**: 
- Add "Group by" options: Category, Status, Assignee, Due Date
- Default to "Category" grouping
- Collapsible group sections with counts
- Maintain sorting within groups

### 3. Chore Detail Modal - **MEDIUM PRIORITY**
**Problem**: No way to view full chore details, description, or edit notes
- Clicking chore cards should show more information
- Need ability to view and edit notes/description

**Solution**:
- Click chore card → Detail modal
- Show: Title, description, category, frequency, notes, properties
- Allow editing: Notes, description
- Show completion history

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

## 🐛 Minor Issues

### 5. TypeScript Warnings
- Vite config has deprecated TanStack Router import warnings
- Some unused variables in components (currentUser, categories)
- `any` types in some areas need proper typing

### 6. Mobile Navigation Polish
- Bottom navigation could use haptic feedback
- Active state animation could be more pronounced
- Consider badges for overdue count on nav items

---

## 📋 Implementation Priority

**Phase 4 Completion (Current)**:
1. ✅ Multi-page navigation structure
2. 🔧 Fix user switcher placement
3. 🔧 Add chore grouping functionality  
4. 🔧 Implement chore detail modal

**Phase 5 (Polish)**:
5. 📱 Navigation polish & micro-interactions
6. 🏗️ TypeScript cleanup
7. 🎨 Enhanced mobile experience

**Future Phases**:
8. 🏗️ Master chore bank architecture research
9. 📊 Advanced analytics and insights
10. 🔄 Bulk operations and management tools