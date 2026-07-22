import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
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
      switch (err.code) {
        case 'auth/invalid-credential':
          setError('Incorrect email or password.')
          break

        case 'auth/user-not-found':
          setError('No account found with that email.')
          break

        case 'auth/wrong-password':
          setError('Incorrect password.')
          break

        case 'auth/invalid-email':
          setError('Please enter a valid email address.')
          break

        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.')
          break

        default:
          setError('Unable to sign in. Please try again.')
      }
    }
  }

  const handleForgotPassword = async () => {
    setError('')

    if (!email) {
      setError('Please enter your email address first.')
      return
    }

    try {
      await sendPasswordResetEmail(auth, email)
      setError('Password reset email sent! Check your inbox.')
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with that email.')
      } else {
        setError('Unable to send password reset email.')
      }
    }
  }

  const handleGoogleLogin = async () => {
    setError('')

    const provider = new GoogleAuthProvider()

    try {
      await signInWithPopup(auth, provider)
      navigate('/')
    } catch (err) {
      setError('Google sign-in failed. Please try again.')
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


          <h2 className="text-lg font-bold">
            Sign in to SpendSmart
          </h2>


          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}


          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">

            <div>
              <label className="text-sm font-semibold">
                User ID:
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-300 rounded p-2 mt-1 outline-none"
                required
              />
            </div>


            <div>
              <label className="text-sm font-semibold">
                Password:
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-300 rounded p-2 mt-1 outline-none"
                required
              />
            </div>


            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-500 hover:underline text-sm"
              >
                Forgot Password?
              </button>
            </div>


            <button
              type="submit"
              className="w-full bg-gray-300 hover:bg-gray-400 rounded p-2 font-semibold"
            >
              Log In
            </button>


            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="flex-1 h-px bg-gray-300"></div>
              OR
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>


            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-gray-300 rounded p-2 font-semibold hover:bg-gray-100"
            >
              Continue with Google
            </button>

          </form>


          <div className="bg-gray-300 rounded p-2 text-sm">
            New User?{' '}
            <Link
              to="/register"
              className="font-bold hover:underline"
            >
              Sign up now
            </Link>
          </div>

        </div>
      </div>

    </div>
  )
}
