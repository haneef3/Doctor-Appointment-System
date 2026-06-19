// src/context/AppContext.jsx
// ─────────────────────────────────────────────────────────────
// This is a lightweight GLOBAL STATE using React Context + useReducer
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useReducer, useCallback } from 'react'

const AppContext = createContext(null)

// ── LocalStorage Initializer ──────────────────────────────────
const savedUser = JSON.parse(localStorage.getItem('medicare_user')) || null

const initialState = {
  user: savedUser,      // { id, name, email, role }
  toasts: [],           // [{ id, message, type }]
}

let toastId = 0

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload }
    case 'LOGOUT':
      return { ...state, user: null }
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) }
    default:
      return state
  }
}

// ── Provider ──────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const login = useCallback((userData) => {
    localStorage.setItem('medicare_user', JSON.stringify(userData))
    dispatch({ type: 'LOGIN', payload: userData })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('medicare_user')
    dispatch({ type: 'LOGOUT' })
  }, [])

  // Toast helper — auto-removes after 3s
  const toast = useCallback((message, type = 'success') => {
    const id = ++toastId
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } })
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3200)
  }, [])

  return (
    <AppContext.Provider value={{ ...state, login, logout, toast }}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook
export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
