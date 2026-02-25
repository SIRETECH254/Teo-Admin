# Analytics Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Form Inputs](#form-inputs)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```javascript
import { useState } from 'react'
import { useAnalytics } from '../hooks/useStats'
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
```

## Context and State Management
- **TanStack Query hooks:** `useAnalytics` for data fetching.
- **State management:** Local component state managed with `useState` hooks.
- **Time range:** `range` string ('7d', '30d', '90d', '12m').

**`useAnalytics` hook (from `hooks/useStats.js`):**
```javascript
export const useAnalytics = ({ range = '30d' }) => {
    return useQuery({
        queryKey: ['analytics', range],
        queryFn: async () => {
            const response = await statsAPI.getAnalytics({ range })
            return response.data
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}
```

## UI Structure
- **Screen shell:** Full-height container with gray background (`bg-gray-50`).
- **Header section:** Title and time range selector.
- **Charts grid:** Three charts in a grid (Orders over time, Revenue over time, New customers over time).
- **Top products chart:** Horizontal bar chart showing top products by quantity.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  Analytics              [Time Range: Last 30 days ▼]       │
│                                                             │
│  ┌──────────────────┐ ┌──────────────────┐ ┌────────────┐│
│  │ Orders over time │ │ Revenue over time│ │ Customers  ││
│  │ [Line Chart]     │ │ [Area Chart]     │ │ [Bar Chart]││
│  └──────────────────┘ └──────────────────┘ └────────────┘│
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Top products (by quantity)                            │ │
│  │ [Horizontal Bar Chart]                                │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Analytics                    [Time Range: Last 30 days ▼]  │
│                                                               │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────┐│
│  │ Orders over time    │ │ Revenue over time   │ │ Customers││
│  │ [Line Chart]        │ │ [Area Chart]        │ │ [Bar]   ││
│  │                     │ │                     │ │         ││
│  └─────────────────────┘ └─────────────────────┘ └─────────┘│
│                                                               │
│  Top products (by quantity)                                   │
│  [Horizontal Bar Chart]                                      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Time Range Selector**
  ```javascript
  <select
      className="input2 w-auto"
      value={range}
      onChange={(e) => setRange(e.target.value)}
  >
      {ranges.map(r => (
          <option key={r.key} value={r.key}>{r.label}</option>
      ))}
  </select>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `statsAPI.getAnalytics`.
- **Analytics endpoint:** `GET /api/stats/analytics?range=30d` (admin only).
- **Query parameters:** `{ range: string }`.
- **Response contract:** `response.data` contains `{ ordersSeries, revenueSeries, customersSeries, topProducts }`.
- **Cache:** Analytics cached for 5 minutes.

## Components Used
- React + React Router DOM: No navigation hooks used.
- TanStack Query: `useQuery`.
- Recharts: `LineChart`, `Line`, `AreaChart`, `Area`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer`.
- Form elements: `select`, `option`, `div`.
- Tailwind CSS classes for styling with custom classes (`.title3`, `.input2`).

## Error Handling
- **Loading states:** Skeleton loaders displayed while `isLoading` is true.
- **Error states:** Errors are silently handled (no error display).

## Navigation Flow
- **Route:** `/analytics`.
- **Entry points:**
  - Direct navigation from sidebar/menu.
  - Direct URL navigation.
- **No navigation actions:** Analytics is primarily a display page.

## Functions Involved

- **No custom functions:** Component uses hooks and Recharts for rendering.

## Future Enhancements
- Add chart export functionality (PNG, PDF, CSV).
- Add chart customization options.
- Add chart comparison views.
- Add chart drill-down capabilities.
- Add chart annotations.
- Add chart filters (categories, products).
- Add chart real-time updates.
- Add chart sharing functionality.
- Add chart templates.
- Add chart performance optimization.
- Add chart accessibility improvements.
- Add chart mobile responsiveness.
