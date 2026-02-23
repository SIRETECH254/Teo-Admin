# Redux Documentation

## Overview

This document provides comprehensive documentation for Redux state management in the TEO-ADMIN application. The Redux setup uses Redux Toolkit for simplified state management and Redux Persist for state persistence across browser sessions.

**Location:** All Redux files are located in the `src/store/` folder.

---

## Table of Contents

1. [Installation](#installation)
2. [Project Structure](#project-structure)
3. [Store Configuration](#store-configuration)
4. [Slices](#slices)
5. [Usage in Components](#usage-in-components)
6. [Best Practices](#best-practices)
7. [Redux DevTools](#redux-devtools)
8. [Troubleshooting](#troubleshooting)

---

## Installation

The following packages are used for state management in this project:

```bash
npm install @reduxjs/toolkit react-redux redux-persist
```

---

## Project Structure

```
src/store/
├── index.js              # Store configuration and exports
└── slices/
    └── authSlice.js      # Authentication and User state
```

### File Descriptions

- **`store/index.js`**: Main store configuration file.
  - Sets up Redux Persist with `localStorage`.
  - Combines all reducers.
  - Disables serializable checks for `redux-persist` compatibility.
  
- **`store/slices/authSlice.js`**: Authentication slice.
  - Manages `user`, `isAuthenticated`, `isLoading`, and `error` state.
  - Exports actions for authentication lifecycle.

---

## Store Configuration

### Store Setup

The store is configured in `src/store/index.js`:

```javascript
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'
import authReducer from './slices/authSlice'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth']
}

const rootReducer = combineReducers({
    auth: authReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Required for Redux Persist
        }),
})

export const persistor = persistStore(store)
```

---

## Slices

### Auth Slice

The auth slice manages authentication state including user data and status.

#### Initial State

```javascript
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
}
```

#### Available Actions

- **`setAuthLoading(boolean)`**: Sets the loading state.
- **`setAuthSuccess(user)`**: Sets user data, marks `isAuthenticated` as true, and clears errors.
- **`setAuthFailure(error)`**: Sets the error message and resets auth status if necessary.
- **`clearAuth()`**: Resets all fields to null/false (used for logout).
- **`setUser(user)`**: Updates user data without changing auth status.

---

## Usage in Components

### Provider Setup

The Redux Provider is set up in `src/main.jsx`:

```javascript
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
)
```

### Accessing State

Use the `useSelector` hook from `react-redux`:

```javascript
import { useSelector } from 'react-redux'

function Dashboard() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  
  return (
    <div>
      {isAuthenticated ? `Welcome back, ${user.firstName}` : 'Please Log In'}
    </div>
  )
}
```

### Dispatching Actions

Use the `useDispatch` hook from `react-redux`:

```javascript
import { useDispatch } from 'react-redux'
import { setAuthSuccess } from './store/slices/authSlice'

function Login() {
  const dispatch = useDispatch()

  const handleLogin = (userData) => {
    dispatch(setAuthSuccess(userData))
  }
}
```

---

## Best Practices

1. **State Flatness**: Avoid deeply nested objects in the state to make updates simpler and more performant.
2. **Persistence Whitelist**: Only persist critical state (like `auth`) to avoid performance issues and stale data in UI-only states.
3. **Use Action Constants**: Use the auto-generated action creators from the slice rather than manual string types.
4. **Middleware**: Do not add logic to the store configuration unless it is shared across all slices.

---

## Redux DevTools

Redux DevTools are enabled by default in development mode. You can inspect the state tree and track every action dispatched by installing the Chrome/Firefox extension.

---

## Troubleshooting

- **State not persisting**: Ensure the `whitelist` in `persistConfig` includes the correct slice name (e.g., `'auth'`).
- **Serialization Errors**: If you see errors regarding non-serializable values, ensure you aren't passing functions or class instances into action payloads.
- **Auth Rehydration**: If the user is logged out on page refresh, check the `PersistGate` setup in `main.jsx`.

---

**Last Updated:** February 2026  
**Version:** 1.1.0 (JS Implementation)
