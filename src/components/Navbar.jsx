import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  const navLinks = [
    { path: '/add-expense', label: 'Expenses' },
    { path: '/', label: 'Dashboard' },
    { path: '/budget', label: 'Budget' },
    { path: '/reports', label: 'Reports' },
    { path: '/ai-assistant', label: 'AI Assistant' },
  ]

  return (
    <nav className="bg-[#1E1E2E] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <span className="text-lg font-bold">
          <span className="text-gray-300">Spend</span>
          <span className="text-blue-400">Smart</span>
        </span>
        <div className="flex gap-6">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm ${location.pathname === link.path ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
      >
        Logout
      </button>
    </nav>
  )
}