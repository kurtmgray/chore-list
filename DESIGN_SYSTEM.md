# ChoreShare Design System
*LucidChart-Inspired Mobile-First Design*

## Design Philosophy

### Core Principles
- **LucidChart-inspired**: Clean, purposeful, smart color usage with excellent information density
- **Mobile-first**: Touch-friendly interactions, thumb navigation, optimal content density
- **Modern geometric typography**: Clean, readable, distinctive font choices
- **Information hierarchy**: Clear visual priority system that guides user attention

### Brand Personality
- **Professional yet approachable**: Clean efficiency with human warmth
- **Purposeful minimalism**: Every element serves a function
- **Calm productivity**: Reduces cognitive load while enabling quick actions

## Color System

### Primary Palette
```css
--primary-50: #eff6ff
--primary-100: #dbeafe
--primary-500: #3b82f6  /* Main primary */
--primary-600: #2563eb  /* Interactive states */
--primary-700: #1d4ed8  /* Pressed states */
```

### Accent & Functional Colors
```css
--accent-orange: #f97316    /* CTAs and highlights */
--success-green: #059669    /* Completed states */
--warning-amber: #d97706    /* Due/overdue states */
--error-red: #dc2626       /* Errors and urgent */
```

### Neutral Palette
```css
--neutral-50: #f8fafc      /* Lightest background */
--neutral-100: #f1f5f9     /* Card backgrounds */
--neutral-200: #e2e8f0     /* Borders */
--neutral-400: #94a3b8     /* Disabled text */
--neutral-600: #475569     /* Secondary text */
--neutral-800: #1e293b     /* Primary text */
--neutral-900: #0f172a     /* Headers */
```

### Background System
```css
--bg-primary: #fefefe      /* Main app background (off-white) */
--bg-surface: #ffffff      /* Card/modal backgrounds */
--bg-elevated: #f8fafc     /* Elevated surfaces */
```

## Typography System

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

### Type Scale
```css
--text-xs: 0.75rem    /* 12px - Labels, captions */
--text-sm: 0.875rem   /* 14px - Body text, descriptions */
--text-base: 1rem     /* 16px - Primary body text */
--text-lg: 1.125rem   /* 18px - Subheadings */
--text-xl: 1.25rem    /* 20px - Card titles */
--text-2xl: 1.5rem    /* 24px - Section headers */
--text-3xl: 1.875rem  /* 30px - Page titles */
```

### Font Weights
```css
--font-normal: 400    /* Body text */
--font-medium: 500    /* Emphasis, labels */
--font-semibold: 600  /* Subheadings, buttons */
--font-bold: 700      /* Headers, important elements */
```

### Letter Spacing
```css
--tracking-tight: -0.025em   /* Headers */
--tracking-normal: 0em       /* Body text */
--tracking-wide: 0.025em     /* Labels, buttons */
```

## Spacing System

### Base Scale (0.25rem = 4px)
```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-12: 3rem     /* 48px */
```

### Component Spacing
- **Mobile padding**: 16px (space-4) standard, 12px (space-3) for dense areas
- **Desktop padding**: 24px (space-6) standard
- **Card internal**: 16px (space-4) padding
- **Section gaps**: 24px (space-6) mobile, 32px (space-8) desktop

## Layout System

### Breakpoints
```css
--mobile: 0px        /* 0-639px */
--tablet: 640px      /* 640-1023px */
--desktop: 1024px    /* 1024px+ */
```

### Container Widths
```css
--container-mobile: 100%
--container-tablet: 640px
--container-desktop: 1024px
--container-wide: 1280px
```

### Grid System
- **Mobile**: Single column, stacked layout
- **Tablet**: 2-column grid for cards, single for content
- **Desktop**: 3-column grid, 2-column for wide content

## Component Guidelines

### Cards
- **Border radius**: 12px (rounded-xl)
- **Shadow**: Subtle, consistent elevation
- **Background**: Pure white (#ffffff)
- **Border**: 1px solid neutral-200
- **Padding**: 16px internal

### Buttons

#### Primary
- **Background**: primary-600
- **Hover**: primary-700
- **Text**: white
- **Padding**: 12px 24px
- **Border radius**: 8px

#### Secondary
- **Background**: neutral-100
- **Hover**: neutral-200
- **Text**: neutral-800
- **Border**: 1px solid neutral-200

#### Icon Buttons
- **Size**: 44px minimum (touch target)
- **Padding**: 12px
- **Border radius**: 8px

### Status Colors
- **Completed**: success-green background with white text
- **Overdue**: error-red background with white text
- **Due today**: warning-amber background with white text
- **Upcoming**: primary-100 background with primary-700 text

## Mobile-First Patterns

### Navigation
- **Bottom tab bar**: Primary navigation
- **Floating action button**: Key actions (New Chore)
- **Back gesture**: iOS-style swipe from edge
- **Header**: Minimal, essential info only

### Interactions
- **Touch targets**: Minimum 44px
- **Swipe actions**: Reveal secondary actions
- **Pull to refresh**: Standard iOS pattern
- **Long press**: Context menus

### Information Density
- **Compact layouts**: More content visible
- **Progressive disclosure**: Hide complexity
- **Scannable lists**: Quick visual scanning
- **Smart defaults**: Reduce user decisions

## Animation & Motion

### Timing Functions
```css
--ease-out: cubic-bezier(0, 0, 0.2, 1)     /* Standard easing */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1) /* Emphasis */
```

### Durations
```css
--duration-fast: 150ms      /* Micro-interactions */
--duration-normal: 200ms    /* Standard transitions */
--duration-slow: 300ms      /* Page transitions */
```

### Principles
- **Subtle and purposeful**: Enhance UX, don't distract
- **Consistent timing**: Same duration for similar actions
- **Respect accessibility**: Honor reduced motion preferences
- **Performance first**: Use transform and opacity when possible

## Accessibility

### Color Contrast
- **Text on background**: Minimum 4.5:1 ratio
- **Large text**: Minimum 3:1 ratio
- **Interactive elements**: Clear focus states

### Touch Targets
- **Minimum size**: 44px × 44px
- **Spacing**: 8px minimum between targets
- **Visual feedback**: Clear pressed states

### Typography
- **Base size**: 16px minimum for body text
- **Line height**: 1.5 for readability
- **Font weight**: Medium (500) minimum for small text

## Implementation Notes

### CSS Custom Properties
All design tokens should be implemented as CSS custom properties for easy theming and maintenance.

### Responsive Strategy
- **Mobile-first CSS**: Start with mobile styles, enhance for larger screens
- **Container queries**: Use for component-level responsiveness when supported
- **Flexible grids**: CSS Grid with auto-fit for adaptive layouts

### Performance Considerations
- **Font loading**: Preload Inter font with font-display: swap
- **Color optimization**: Use consistent palette to reduce CSS size
- **Animation performance**: Prefer transform/opacity over layout properties

---

*This design system should be treated as a living document, updated as the product evolves.*