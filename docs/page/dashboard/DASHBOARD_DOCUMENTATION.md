# Dashboard Screen Documentation

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
import { useMemo, useState, useEffect, useCallback } from 'react'
import { useOverviewStats, useAnalytics } from '../hooks/useStats'
import { orderAPI } from '../api'
import { FiDollarSign, FiShoppingBag, FiUsers, FiActivity, FiArrowUpRight, FiArrowDownRight, FiMail, FiChevronDown } from 'react-icons/fi'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
```

## Context and State Management
- **TanStack Query hooks:** `useOverviewStats`, `useAnalytics` for data fetching.
- **State management:** Local component state managed with `useState` hooks.
- **Time range:** `selectedRange` string ('7d', '14d', '30d', '90d', '120d', '6m', '12m').
- **Recent orders:** `recentOrders` array loaded via direct API call.

**`useOverviewStats` hook (from `hooks/useStats.js`):**
```javascript
export const useOverviewStats = () => {
    return useQuery({
        queryKey: ['overviewStats'],
        queryFn: async () => {
            const response = await statsAPI.getOverviewStats()
            return response.data
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}
```

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
- **Header section:** Title, description, and time range selector.
- **Stats cards:** Four stat cards displaying Total Revenue, Orders Paid, New Customers, and Pending Payments with change indicators.
- **Sales chart:** Area chart showing paid orders over time.
- **Recent orders list:** Sidebar showing recent orders with customer info and payment status.

## Planned Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  Dashboard              [Time Range: Last 30 days ▼]       │
│  Overview of your store performance                         │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Revenue  │ │ Orders   │ │ Customers│ │ Pending  │     │
│  │ KSH X    │ │ X        │ │ X        │ │ X        │     │
│  │ ↑ X%     │ │ ↑ X%     │ │ ↑ X%     │ │ —        │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                             │
│  ┌──────────────────────────┐ ┌──────────────────────┐   │
│  │ Sales Overview           │ │ Recent Orders         │   │
│  │ [Area Chart]             │ │ [Order List]          │   │
│  └──────────────────────────┘ └──────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Dashboard                    [Time Range: Last 30 days ▼]  │
│  Overview of your store performance                           │
│                                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│  │ 💵 Revenue  │ │ 🛍️ Orders   │ │ 👥 Customers│ │ ⚡ Pending││
│  │ KSH 125,000 │ │ 45          │ │ 12          │ │ 3        ││
│  │ ↑ 12.5%     │ │ ↑ 8.2%      │ │ ↑ 5.1%      │ │ —        ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘│
│                                                               │
│  ┌──────────────────────────────┐ ┌──────────────────────┐ │
│  │ Sales Overview               │ │ Recent Orders        │ │
│  │ [Area Chart - Paid Orders]   │ │ [Order 1]            │ │
│  │                              │ │ [Order 2]            │ │
│  │                              │ │ [Order 3]            │ │
│  └──────────────────────────────┘ └──────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Form Inputs

- **Time Range Selector**
  ```javascript
  <select
      value={selectedRange}
      onChange={handleRangeChange}
      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
  >
      {timeRangeOptions.map((option) => (
          <option key={option.value} value={option.value}>
              {option.label}
          </option>
      ))}
  </select>
  ```

- **Stat Card** (with change indicator)
  ```javascript
  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500">{title}</div>
          <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
          </div>
      </div>
      <div className="mt-3 text-2xl font-bold text-gray-900">{value}</div>
      <div className="mt-2 flex items-center text-sm">
          {change.dir === 'up' && (
              <>
                  <FiArrowUpRight className="text-emerald-500 mr-1" />
                  <span className="text-emerald-600">{change.pct}%</span>
              </>
          )}
          {change.dir === 'down' && (
              <>
                  <FiArrowDownRight className="text-rose-500 mr-1" />
                  <span className="text-rose-600">{change.pct}%</span>
              </>
          )}
          {change.dir === 'neutral' && (
              <>
                  <span className="text-blue-500 mr-1">—</span>
                  <span className="text-blue-600">0%</span>
              </>
          )}
          <span className="text-gray-400 ml-2">{getComparisonText(selectedRange)}</span>
      </div>
  </div>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.js` via `statsAPI.getOverviewStats`, `statsAPI.getAnalytics`, and `orderAPI.getOrders`.
- **Overview stats endpoint:** `GET /api/stats/overview` (admin only).
- **Analytics endpoint:** `GET /api/stats/analytics?range=30d` (admin only).
- **Recent orders endpoint:** `GET /api/orders?page=1&limit=5` (admin only).
- **Query parameters:** `{ range: string }` for analytics.
- **Response contract:** Overview stats contains `{ totalRevenue, totalPaidOrders, totalCustomers, totalPendingPayments }`, analytics contains time series data.
- **Cache:** Stats cached for 5 minutes, analytics cached for 5 minutes.

## Components Used
- React + React Router DOM: No navigation hooks used.
- TanStack Query: `useQuery`.
- Recharts: `AreaChart`, `Area`, `CartesianGrid`, `Tooltip`, `XAxis`, `YAxis`, `ResponsiveContainer`.
- Form elements: `select`, `option`, `div`.
- `react-icons/fi` for icons (FiDollarSign, FiShoppingBag, FiUsers, FiActivity, FiArrowUpRight, FiArrowDownRight, FiMail, FiChevronDown).
- Tailwind CSS classes for styling with custom classes (`.title3`).

## Error Handling
- **Loading states:** Placeholder values ("…") displayed while `isLoadingOverview` is true.
- **Error states:** Errors are silently handled (no error display).
- **Empty states:** "No recent orders" message when `recentOrders.length === 0`.

## Navigation Flow
- **Route:** `/` (root route, shows Dashboard for authenticated users).
- **Entry points:**
  - Default route after login.
  - Direct URL navigation.
  - From other pages via navigation menu.
- **No navigation actions:** Dashboard is primarily a display page.

## Functions Involved

- **`calcChange`** — Calculates percentage change between periods.
  ```javascript
  const calcChange = useCallback((series, range) => {
      if (!series || series.length === 0) return { pct: 0, dir: 'neutral' }
      const sum = (arr, keyA, keyB) => arr.reduce((s, p) => s + Number(p[keyA] ?? p[keyB] ?? 0), 0)
      
      const getPeriodLength = (range) => {
          switch (range) {
              case '7d': return 3
              case '14d': return 7
              case '30d': return 7
              case '90d': return 15
              case '120d': return 20
              case '6m': return 30
              case '12m': return 60
              default: return 7
          }
      }
      
      const periodLength = getPeriodLength(range)
      const currentPeriod = sum(series.slice(-periodLength), 'count', 'amount')
      const previousPeriod = sum(series.slice(-periodLength * 2, -periodLength), 'count', 'amount')
      
      if (previousPeriod === 0) return { pct: 100, dir: 'up' }
      const pct = ((currentPeriod - previousPeriod) / Math.abs(previousPeriod)) * 100
      const roundedPct = Math.round(pct * 10) / 10
      
      if (roundedPct === 0) return { pct: 0, dir: 'neutral' }
      return { pct: roundedPct, dir: roundedPct > 0 ? 'up' : 'down' }
  }, [])
  ```

- **`formatCurrency`** — Formats number as currency (KES).
  ```javascript
  const formatCurrency = useCallback((v) => 
      new Intl.NumberFormat('en-KE', { 
          style: 'currency', 
          currency: 'KES', 
          maximumFractionDigits: 0 
      }).format(Number(v || 0)), 
      []
  )
  ```

- **`timeAgo`** — Formats date as relative time (e.g., "2h ago").
  ```javascript
  const timeAgo = useCallback((isoDate) => {
      if (!isoDate) return '—'
      const d = new Date(isoDate)
      const diff = Math.floor((Date.now() - d.getTime()) / 1000)
      if (diff < 60) return `${diff}s ago`
      const m = Math.floor(diff / 60)
      if (m < 60) return `${m}m ago`
      const h = Math.floor(m / 60)
      if (h < 24) return `${h}h ago`
      const days = Math.floor(h / 24)
      if (days < 30) return `${days}d ago`
      const months = Math.floor(days / 30)
      return `${months}mo ago`
  }, [])
  ```

- **`getComparisonText`** — Returns comparison text for selected range.
  ```javascript
  const getComparisonText = useCallback((range) => {
      const rangeMap = {
          '7d': 'compared to last 7 days',
          '14d': 'compared to last 14 days',
          '30d': 'compared to last 30 days',
          '90d': 'compared to last 90 days',
          '120d': 'compared to last 120 days',
          '6m': 'compared to last 6 months',
          '12m': 'compared to last 12 months'
      }
      return rangeMap[range] || 'compared to last 7 days'
  }, [])
  ```

- **`loadRecentOrders`** — Loads recent orders via API.
  ```javascript
  const loadRecentOrders = useCallback(async () => {
      try {
          const res = await orderAPI.getOrders({ page: 1, limit: 5 })
          setRecentOrders(res.data?.data?.orders || [])
      } catch {
          setRecentOrders([])
      }
  }, [])
  ```

- **Recent orders loading effect** — Loads recent orders on mount.
  ```javascript
  useEffect(() => {
      loadRecentOrders()
  }, [loadRecentOrders])
  ```

## Future Enhancements
- Add real-time updates via WebSocket.
- Add dashboard customization (widget arrangement).
- Add dashboard export functionality.
- Add dashboard sharing.
- Add dashboard filters (date range, categories).
- Add dashboard drill-down capabilities.
- Add dashboard alerts/notifications.
- Add dashboard performance metrics.
- Add dashboard comparison views.
- Add dashboard historical data.
- Add dashboard forecasting.
- Add dashboard recommendations.
