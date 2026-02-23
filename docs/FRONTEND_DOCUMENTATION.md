# TEO-ADMIN - Frontend Documentation

## Table of Contents
- [Technology Stack](#technology-stack)
- [Required Packages](#required-packages)
- [Architecture Overview](#architecture-overview)
- [Pages & Screens](#pages--screens)
- [Components](#components)
- [Hooks](#hooks)
- [Constants](#constants)
- [Routing Structure](#routing-structure)
- [Styling Approach](#styling-approach)
- [UI Design System](#ui-design-system)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Getting Started](#getting-started)
- [Code Style & Best Practices](#code-style--best-practices)
- [Security Considerations](#security-considerations)
- [Testing](#testing)
- [Additional Resources](#additional-resources)
- [Version Information](#version-information)
- [Support & Contribution](#support--contribution)

---

## Technology Stack

- **Framework:** React 19
- **Language:** JavaScript (with PropTypes/JSDoc)
- **Routing:** React Router Dom v7
- **Styling:** Tailwind CSS v4
- **Build System:** Vite
- **State Management:** Redux Toolkit & TanStack Query (React Query)
- **Platform:** Web (responsive admin dashboard)

---

## Required Packages

### Core Dependencies
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^7.8.1",
  "vite": "^7.1.0"
}
```

### Routing
```json
{
  "react-router-dom": "^7.8.1"
}
```

### Styling & UI
```json
{
  "tailwindcss": "^4.1.12",
  "@tailwindcss/vite": "^4.1.12",
  "react-hot-toast": "^2.6.0",
  "react-icons": "^5.5.0"
}
```

### HTTP & API
```json
{
  "axios": "^1.11.0"
}
```

### State Management
```json
{
  "@reduxjs/toolkit": "^2.8.2",
  "react-redux": "^9.2.0",
  "redux-persist": "^6.0.0",
  "@tanstack/react-query": "^5.85.5"
}
```

### Charts & Analytics
```json
{
  "recharts": "^2.15.4"
}
```

### Forms & Validation
```json
{
  "yup": "^1.7.0"
}
```

---

## Architecture Overview

### Folder Structure
```
admin/
├── src/
│   ├── pages/                   # Page components
│   │   ├── auth/                # Auth pages (Login, ForgotPassword, etc.)
│   │   ├── products/            # Product management
│   │   ├── orders/              # Order management
│   │   ├── customers/           # Customer management
│   │   ├── inventory/           # Inventory management
│   │   ├── classifications/     # Categories, Brands, Tags, Collections
│   │   ├── variant/             # Variant management
│   │   ├── coupons/             # Coupon management
│   │   ├── packaging/           # Packaging management
│   │   ├── settings/            # User and store settings
│   │   ├── Analytics.jsx
│   │   └── Dashboard.jsx
│   │
│   ├── components/
│   │   ├── ui/                  # Reusable UI primitives
│   │   ├── common/              # Shared layout components (Header, Sidebar)
│   │   ├── products/            # Product-specific components
│   │   ├── orders/              # Order-specific components
│   │   ├── customers/           # Customer-specific components
│   │   ├── inventory/           # Inventory-specific components
│   │   └── forms/               # Form-specific components
│   │
│   ├── api/                     # API client and domain modules
│   │   ├── config.js            # Axios instance & interceptors
│   │   └── index.js             # Domain API modules
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── api/                 # API-related hooks
│   │   ├── ui/                  # UI-related hooks
│   │   └── use*.js              # Domain-specific hooks (useProducts, useOrders)
│   │
│   ├── store/                   # Redux store & slices
│   │   ├── index.js
│   │   └── slices/
│   │
│   ├── contexts/                # React Contexts (AuthContext)
│   ├── utils/                   # Utilities (validation, etc.)
│   │   └── validation.js
│   │
│   ├── App.jsx                  # Root component & Routing
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles & Tailwind layers
```

---

## Pages & Screens

### 1. Dashboard (`/`)
**Purpose:** Overview of store performance and quick stats.
**Features:** Sales charts, recent orders summary, inventory alerts.

### 2. Product Management (`/products`)
**Purpose:** Comprehensive product catalog management.
**Sub-pages:**
- List View (`/products`)
- Add Product (`/products/add`)
- Edit Product (`/products/:id/edit`)
- Product Details (`/products/:id/details`)

### 3. Order Management (`/orders`)
**Purpose:** Track and fulfill customer orders.
**Sub-pages:**
- Order List (`/orders`)
- Order Details (`/orders/:id`)

### 4. Customer Management (`/customers`)
**Purpose:** Manage user accounts and customer profiles.
**Sub-pages:**
- Customer List (`/customers`)
- Add Customer (`/customers/new`)
- Edit Customer (`/customers/:id/edit`)

### 5. Classifications
**Purpose:** Organize products via various taxonomies.
- **Categories:** Hierarchical organization.
- **Brands:** Product manufacturers.
- **Collections:** Curated product groups.
- **Tags:** Descriptive labels.

### 6. Variants & Inventory
- **Variants (`/variants`):** Manage product attributes (Size, Color).
- **Inventory (`/inventory`):** Stock level tracking and updates.

### 7. Marketing & Tools
- **Coupons (`/coupons`):** Discount code management.
- **Packaging (`/packaging`):** Custom shipping box/wrap options.

---

## UI Design System

### Overview
TEO-ADMIN uses a **Deep Purple** theme for primary actions, providing a modern and professional aesthetic.

### Brand Palette (Purple)

| Role           | Hex       | Usage                          | Tailwind Class       |
|----------------|-----------|--------------------------------|----------------------|
| Primary        | `#4B2E83` | Brand identity, primary text   | `text-primary`       |
| Secondary      | `#E879F9` | Accents, highlights            | `text-secondary`     |
| Primary Button | `#3A1F66` | Action buttons                 | `bg-primary-button`  |
| Secondary Button| `#FDE7FF` | Soft actions                  | `bg-secondary-button`|
| Light          | `#F8F5FF` | Section backgrounds            | `bg-light`           |

### Component Styles (via `@layer components`)

- **.btn-primary:** Rounded-lg, purple background, white text, scale-105 on hover.
- **.btn-secondary:** Pinkish-light background, purple text.
- **.btn-outline:** Transparent with purple border.
- **.title:** Text-4xl, bold, primary purple.
- **.input:** Rounded-lg, gray-300 border, purple ring on focus.

---

## State Management

1. **Redux Toolkit:** Used for global application state (Auth, UI toggles). Persisted via `redux-persist`.
2. **TanStack Query:** Manages server-side state, caching, and synchronization for all domain data (Products, Orders, etc.).
3. **AuthContext:** Provides authentication state and methods (`login`, `logout`) throughout the app.

---

## API Integration

### API Client (`src/api/config.js`)
- **Base URL:** `https://teo-kicks.onrender.com/api`
- **Interceptors:**
  - **Request:** Automatically attaches `Authorization: Bearer <token>` from localStorage.
  - **Response:** Handles `401 Unauthorized` by attempting a token refresh.

### Domain API Modules (`src/api/index.js`)
The `api/index.js` file exports specialized objects for each domain:
- `productAPI`, `orderAPI`, `userAPI`, `categoryAPI`, `brandAPI`, `couponAPI`, `statsAPI`, etc.

---

## Getting Started

1. **Clone & Navigate:** `cd TEO-ADMIN/admin`
2. **Install:** `npm install`
3. **Environment:** Check `.env` for the API URL.
4. **Run Dev:** `npm run dev`
5. **Build:** `npm run build`

---

## Version Information
- **Document Version:** 1.1.0
- **Last Updated:** February 2026
- **Status:** Active Development
