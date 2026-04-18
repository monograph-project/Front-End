# Admin Pages Common Styling Guide

## Core Layout Structure

```
.container = "flex-1 overflow-y-auto p-4 md:p-5 flex flex-col bg-shell dark:bg-dark-shell gap-6"
.header = "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
.header-title = "text-2xl font-bold text-primary dark:text-dark-primary mb-1"
.header-subtitle = "text-muted dark:text-dark-muted"
```

## Filter Bar

```
.filter-container = "rounded-md overflow-hidden border border-default dark:border-dark-default shadow-sm"
.filter-header = "flex flex-col px-4 py-3 sm:flex-row gap-3 bg-shell dark:bg-dark-shell border-b border-default dark:border-dark-default"
.search-input-container = "relative flex-1"
.search-icon = "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 stroke-muted dark:stroke-dark-muted"
.search-input = "w-full pl-10 pr-4 py-2 bg-card dark:bg-dark-card border border-default dark:border-dark-default rounded-md text-sm focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted dark:placeholder:text-dark-muted"
.status-select-container = "w-48"
```

## Table Container

```
.table-container = "flex-1 border border-default dark:border-dark-default rounded-md"
.table-filter-header = "flex mb-3 flex-col px-4 py-3 sm:flex-row gap-3 bg-shell dark:bg-dark-shell border-b border-default dark:border-dark-default"
.table-inner = "w-full p-2 overflow-hidden"
.table = "shadow-sm"
```

## Table Columns

```
.checkbox-column = "w-10"
.id-column = "font-mono text-xs"
.avatar-column = "flex items-center gap-3"
.avatar-name = "font-medium text-sm text-primary dark:text-dark-primary line-clamp-1"
.email = "text-xs text-muted dark:text-dark-muted"
.department-badge = "px-2.5 py-1 bg-card dark:bg-dark-card border border-default dark:border-dark-default rounded-full text-xs font-medium capitalize"
.status-badge-active = "bg-success text-success-light dark:bg-dark-success dark:text-dark-success-light"
.status-badge-pending = "bg-warning text-warning-light dark:bg-dark-warning dark:text-dark-warning-light"
.status-badge-suspended = "bg-error text-error-light dark:bg-dark-error dark:text-dark-error-light"
.status-badge-default = "bg-muted text-muted-foreground"
.date-column = "text-xs whitespace-nowrap"
.actions-column = "w-16"
.action-icon = "w-4 h-4 text-muted dark:text-dark-muted hover:text-primary dark:hover:text-dark-primary transition-colors cursor-pointer"
```

## Status Badge Pattern

```
.status-badge = `px-2.5 py-1 rounded-full text-xs font-semibold ${
  status === "active" ? "bg-success text-success-light dark:bg-dark-success dark:text-dark-success-light"
  : status === "pending" ? "bg-warning text-warning-light dark:bg-dark-warning dark:text-dark-warning-light"
  : status === "suspended" ? "bg-error text-error-light dark:bg-dark-error dark:text-dark-error-light"
  : "bg-muted text-muted-foreground"
}`
```

## Empty State

```
.empty-state-container = "text-center py-12 text-muted dark:text-dark-muted"
.empty-icon-container = "w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3"
.empty-title = "font-medium"
.empty-subtitle = "text-xs opacity-75"
.empty-icon = "w-5 h-5 text-muted-foreground"
```

## Pagination

```
.pagination-container = "pt-4"
```

## Button

```
.add-button = "icon={<Icon d={IC.plus} className="size-4" />}"
```

## Responsive Behavior

```
Mobile: flex-col stacking for header & filters
Desktop: sm:flex-row for horizontal layout
```

## Dark Mode Classes Used

```
- dark:bg-dark-shell
- dark:border-dark-default
- dark:text-dark-primary
- dark:text-dark-muted
- dark:bg-dark-card
- dark:focus:border-accent
- dark:stroke-dark-muted
- dark:bg-dark-success etc. for status badges
```

## Borders & Rounded Corners

```
Primary border: border border-default dark:border-dark-default
Input border: border border-default dark:border-dark-default
Filter bar border: border-b border-default dark:border-dark-default
Container rounded: rounded-md, rounded-lg
Badge rounded: rounded-full
Avatar: rounded-full
```

## Spacing & Padding

```
Container padding: p-4 md:p-5
Filter padding: px-4 py-3
Table padding: p-2, p-3
Badge padding: px-2.5 py-1
Gap: gap-6, gap-4, gap-3, gap-2
Margin: mb-1, mb-3, pt-4
```

## Typography

```
h1: text-2xl font-bold
ID: font-mono text-xs
Name: font-medium text-sm
Email: text-xs
Status: text-xs font-semibold
Date: text-xs
Subtitle: text-muted
```

## Colors & Focus States

```
Primary text: text-primary / dark:text-dark-primary
Muted: text-muted / dark:text-dark-muted
Success: bg-success text-success-light / dark:bg-dark-success dark:text-dark-success-light
Warning: bg-warning text-warning-light / dark:bg-dark-warning dark:text-dark-warning-light
Error: bg-error text-error-light / dark:bg-dark-error dark:text-dark-error-light
Focus: focus:border-accent focus:ring-accent/20
Hover: hover:text-primary dark:hover:text-dark-primary
```

## Animations & Transitions

```
.transition-all (inputs, icons)
.line-clamp-1 (name overflow)
.whitespace-nowrap (dates)
```

**Copy-paste these classes across all admin pages for perfect consistency!** 🎨
