# Pull-to-Refresh Implementation Guide

## Overview
The pull-to-refresh feature allows mobile users to refresh data by pulling down from the top of the screen. It's automatically disabled on modals, dialogs, and scrollable content to prevent conflicts.

## Automatic Exclusions

Pull-to-refresh is automatically disabled when touching these elements:

### 1. Radix UI Components
- `[data-radix-dialog-content]` - Radix Dialog
- `[data-radix-alert-dialog-content]` - Radix Alert Dialog

### 2. Vaul Drawer (Bottom Sheets)
- `[data-vaul-drawer]` - Vaul drawer component
- `[data-vaul-drawer-wrapper]` - Vaul drawer wrapper

### 3. ARIA Roles
- `[role="dialog"]` - Any dialog element
- `[role="alertdialog"]` - Any alert dialog element

### 4. Common CSS Classes
- `.modal` - Modal elements
- `.drawer` - Drawer elements
- `.bottom-sheet` - Bottom sheet elements

### 5. Scrollable Content
- Any element with `overflow-y: scroll` or `overflow-y: auto` that's not at scroll position 0

## Manual Exclusion

If you have a custom component that should prevent pull-to-refresh, add the `data-pull-to-refresh-ignore` attribute:

```tsx
// Example: Custom modal
<div data-pull-to-refresh-ignore>
  <YourModalContent />
</div>

// Example: Custom bottom sheet
<div className="custom-sheet" data-pull-to-refresh-ignore>
  <SheetContent />
</div>

// Example: Scrollable list that shouldn't trigger refresh
<div className="scrollable-list" data-pull-to-refresh-ignore>
  {items.map(item => <Item key={item.id} {...item} />)}
</div>
```

## Configuration

All thresholds can be adjusted in `src/config/pullToRefresh.ts`:

```typescript
export const REFRESH_THRESHOLD = 120 // Pull distance to trigger refresh
export const MAX_PULL_DISTANCE = 200 // Max pull before resistance
export const PULL_ACTIVATION_THRESHOLD = 30 // Distance before showing indicator
export const MOBILE_BREAKPOINT = 900 // Max width for mobile
```

## How It Works

1. **Touch Detection**: Listens for touch events on mobile devices (≤900px)
2. **Exclusion Check**: Verifies touch isn't on a modal/dialog/scrollable element
3. **Scroll Check**: Only activates when page is scrolled to top (scrollY = 0)
4. **Activation Threshold**: Indicator appears after pulling 30px
5. **Refresh Threshold**: Refresh triggers after pulling 120px and releasing
6. **Data Refresh**: Invalidates all TanStack Query caches, triggering refetch

## Troubleshooting

### Pull-to-refresh triggers on my custom modal
Add the `data-pull-to-refresh-ignore` attribute to your modal container:
```tsx
<CustomModal data-pull-to-refresh-ignore>
  {/* content */}
</CustomModal>
```

### Pull-to-refresh triggers on scrollable content
The system automatically detects scrollable elements. If it's not working, ensure:
1. The element has `overflow-y: scroll` or `overflow-y: auto` in CSS
2. The element has actual scrollable content (scrollHeight > clientHeight)

### Want to disable pull-to-refresh on a specific page
Wrap the page content with the ignore attribute:
```tsx
function SpecialPage() {
  return (
    <div data-pull-to-refresh-ignore>
      {/* This entire page won't trigger pull-to-refresh */}
    </div>
  )
}
```

## Best Practices

1. **Use semantic HTML**: Prefer `role="dialog"` over custom classes
2. **Test on real devices**: Touch behavior differs between browsers
3. **Keep thresholds reasonable**: 120px is a good balance for most users
4. **Don't override scroll**: Let native scrolling work naturally
5. **Provide feedback**: The indicator shows users the gesture is recognized

## Performance

- Uses passive event listeners for 60fps scroll performance
- GPU-accelerated animations with CSS transforms
- Minimal re-renders with proper React hooks
- No memory leaks with proper cleanup

## Accessibility

- ARIA `role="status"` for screen readers
- Dynamic `aria-label` describing current state
- `aria-live="polite"` for non-intrusive announcements
- Announces "Refreshing content" when refresh triggers
