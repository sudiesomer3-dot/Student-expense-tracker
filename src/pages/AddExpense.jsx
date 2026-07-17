import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Fun', 'Other']

export default function AddExpense() {
  const { user } = useApp()
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.')
      return
    }
    if (!category) {
      setError('Please select a category.')
      return
    }
    try {
      await addDoc(collection(db, 'expenses'), {
        uid: user.uid,
        amount: Number(amount),
        category,
        date,
        description,
        createdAt: new Date().toISOString()
      })
      navigate('/')
    } catch (err) {
      setError('Failed to save expense. Try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-2xl mx-auto p-8">
        <button onClick={() => navigate('/')} className="text-sm text-gray-500 mb-4 hover:underline">
          ← Add Expense
        </button>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div>
            <label className="text-sm font-semibold">Amount *</label>
            <div className="flex items-center border border-blue-400 rounded mt-1">
              <span className="px-3 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-2 outline-none"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Category *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mt-1 outline-none"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">Date *</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mt-1 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a note about this expense..."
              className="w-full border border-gray-300 rounded p-2 mt-1 outline-none h-24 resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded p-3 font-semibold hover:bg-blue-600"
          >
            Save Expense
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-center text-gray-500 hover:underline text-sm"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  )
}