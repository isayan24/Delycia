# Delycia UI Design System Reference

This document serves as the single source of truth for the "Large Order History" design pattern, extracted from `LargeOrderCard.tsx`. Refer to these tokens and patterns to maintain visual consistency across the application.

## 🎨 Color Palette

| Category | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| **Background (Main)** | `bg-white` | `bg-[#2d1e14]` | Main card and container backgrounds |
| **Background (Soft)** | `bg-slate-50/30` | `bg-background-dark/30` | Page wrapper or section backgrounds |
| **Background (Accent)** | `bg-orange-50` | `bg-[#3a291d]` | Icon backgrounds, soft highlighting |
| **Primary Text** | `text-slate-900` | `text-white` | Headings and primary information |
| **Secondary Text** | `text-[#a16b45]` | `text-[#a16b45]` | Labels, metadata, and accent text |
| **Borders** | `border-[#ead9cd]` | `border-primary/10` | Standard container borders |
| **Divider** | `divide-[#ead9cd]` | `divide-primary/10` | Internal dividers and table borders |

### Functional Accents
- **Primary (Brand):** `text-primary`, `bg-orange-600` (Buttons)
- **Success/Delivered:** `text-emerald-600`, `bg-emerald-50`
- **Error/Cancelled/Merge:** `text-rose-600`, `bg-rose-50`
- **Processing:** `text-orange-600`, `bg-orange-50`

---

## 📐 Layout & Spacing

- **Border Radius:** `rounded-xl` (Cards/Containers), `rounded-lg` (Icons/Smaller items), `rounded-full` (Badges/Avatars).
- **Standard Padding:** `p-6` for headers, `p-8` for expanded sections.
- **Card Gutter:** `space-y-8` for vertical rhythm between major cards.
- **Micro-spacing:** `gap-6` for header elements, `gap-10` for grid columns.

---

## ✨ Shadows & Effects

- **Default Shadow:** `shadow-sm`
- **Card Hover:** `hover:shadow-xl hover:shadow-primary/5`
- **Transitions:** Always use `transition-all` or `transition-colors` for smooth interactions.
- **Expansion Animation:** `animate-in fade-in slide-in-from-top-2 duration-300`

---

## 🧱 Component Patterns

### 1. The "Large Card" Pattern
```tsx
<div className="group bg-white dark:bg-[#2d1e14] rounded-xl border border-[#ead9cd] dark:border-primary/10 hover:shadow-xl hover:shadow-primary/5 transition-all">
  {/* Header (Always Visible) */}
  <div className="p-6 cursor-pointer select-none">...</div>
  
  {/* Expanded Content (Conditional) */}
  <div className="border-t border-[#ead9cd] dark:border-primary/10 p-8 bg-background-light/50 dark:bg-background-dark/30 animate-in fade-in slide-in-from-top-2 duration-300">...</div>
</div>
```

### 2. Badge Status Labels
- **Typography:** `text-[10px] font-bold uppercase tracking-wider`
- **Padding:** `px-2.5 py-0.5`
- **Rounded:** `rounded-full`

### 3. Glassmorphism Icons
- **Structure:** `size-16 rounded-xl flex items-center justify-center shrink-0`
- **Colors:** Use "Background (Accent)" for the container and "Functional Accents" for the icon itself.

---

## 🏗️ Technical Approach

1. **Memoization:** Wrap all major UI components in `React.memo` to prevent re-renders.
2. **Prop Stability:** Pass function references directly instead of inline arrows.
3. **Partitioning:** Keep components clean by extracting logical UI bits into local sub-components (e.g., `OrderHeader`, `TotalsBreakdown`) within the same file.
