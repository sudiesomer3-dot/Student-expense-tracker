import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AddExpense from './pages/AddExpense'
import Budget from './pages/Budget'
import Reports from './pages/Reports'
import AIAssistant from './pages/AIAssistant'

function PrivateRoute({ children }) {
  const { user, loading } = useApp()
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/add-expense" element={<PrivateRoute><AddExpense /></PrivateRoute>} />
      <Route path="/budget" element={<PrivateRoute><Budget /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
      <Route path="/ai-assistant" element={<PrivateRoute><AIAssistant /></PrivateRoute>} />
    </Routes>
  )
}