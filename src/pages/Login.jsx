import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (err) {
      setError('Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-[#1E1E2E] px-6 py-4">
        <span className="text-lg font-bold">
          <span className="text-gray-300">Spend</span>
          <span className="text-blue-400">Smart</span>
        </span>
      </nav>
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="bg-gray-100 rounded-xl p-10 w-80 flex flex-col items-center gap-4">
          <span className="text-lg font-bold">
            <span className="text-gray-400">Spend</span>
            <span className="text-blue-400">Smart</span>
          </span>
          <h2 className="text-lg font-bold">Sign in to SpendSmart</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold">User ID:</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-300 rounded p-2 mt-1 outline-none"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Password:</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-300 rounded p-2 mt-1 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-300 hover:bg-gray-400 rounded p-2 font-semibold mt-2"
            >
              Login in
            </button>
          </form>
          <div className="bg-gray-300 rounded p-2 text-sm">
            New User?{' '}
            <Link to="/register" className="font-bold hover:underline">
              Sign up now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}