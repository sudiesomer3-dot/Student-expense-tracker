import { useState } from 'react'
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'

const CATEGORIES = [
  { name: 'Food', icon: '🍔' },
  { name: 'Transport', icon: '🚗' },
  { name: 'Bills', icon: '📄' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Fun', icon: '🎉' },
  { name: 'Other', icon: '📦' },
]

export default function Budget() {
  const { user, expenses, budgets } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [newLimit, setNewLimit] = useState('')
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.limit), 0)
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalRemaining = totalBudget - totalSpent
  const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const getBarColor = (pct) => {
    if (pct >= 100) return 'bg-red-500'
    if (pct >= 70) return 'bg-amber-400'
    return 'bg-blue-500'
  }

  const handleAddBudget = async (e) => {
    e.preventDefault()
    if (!newCategory || !newLimit) return
    await addDoc(collection(db, 'budgets'), {
      uid: user.uid,
      category: newCategory,
      limit: Number(newLimit),
      createdAt: new Date().toISOString()
    })
    setNewCategory('')
    setNewLimit('')
    setShowModal(false)
  }

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'budgets', id))
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Budget</h1>
          <span className="text-gray-500">◀ {currentMonth} ▶</span>
        </div>
        <p className="text-blue-400 text-xs mb-4">← Month selector — click arrows to change month</p>

        {/* Overall Summary */}
        <div className="border rounded-xl p-6 mb-6">
          <div className="grid grid-cols-3 text-center mb-4">
            <div>
              <p className="text-2xl font-bold">${totalBudget.toFixed(2)}</p>
              <p className="text-gray-400 text-sm">Total Budget</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">${totalSpent.toFixed(2)}</p>
              <p className="text-gray-400 text-sm">Spent</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">${totalRemaining.toFixed(2)}</p>
              <p className="text-gray-400 text-sm">Remaining</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${getBarColor(overallPct)}`}
              style={{ width: `${Math.min(overallPct, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Overall: ${totalSpent.toFixed(2)} of ${totalBudget.toFixed(2)} spent ({overallPct.toFixed(0)}%)</p>
        </div>

        {/* Budget by Category */}
        <p className="text-xs font-semibold text-gray-500 mb-3 uppercase">Budget by Category</p>
        <div className="flex flex-col gap-4">
          {CATEGORIES.map(cat => {
            const budget = budgets.find(b => b.category === cat.name)
            const spent = expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + Number(e.amount), 0)
            const limit = budget ? Number(budget.limit) : 0
            const pct = limit > 0 ? (spent / limit) * 100 : 0

            return (
              <div key={cat.name} className="flex items-center gap-4 border-b pb-4">
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{cat.name}</span>
                    {pct >= 100 && <span className="text-red-500 text-xs font-bold">▲ Over budget</span>}
                    <span className="text-sm text-gray-500">{pct.toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-gray-400">${spent.toFixed(2)} / ${limit.toFixed(2)}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${getBarColor(pct)}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
                {budget && (
                  <button onClick={() => handleDelete(budget.id)} className="text-xs text-red-400 hover:underline">Remove</button>
                )}
              </div>
            )
          })}
        </div>

        {/* Add Budget Button */}
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 bg-blue-500 text-white w-12 h-12 rounded-full text-2xl hover:bg-blue-600 shadow-lg"
        >
          +
        </button>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-8 w-80">
              <h2 className="font-bold text-lg mb-4">Set Budget</h2>
              <form onSubmit={handleAddBudget} className="flex flex-col gap-4">
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="border rounded p-2 outline-none"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <input
                  type="number"
                  value={newLimit}
                  onChange={e => setNewLimit(e.target.value)}
                  placeholder="Budget limit ($)"
                  className="border rounded p-2 outline-none"
                  min="0"
                />
                <button type="submit" className="bg-blue-500 text-white rounded p-2 font-semibold hover:bg-blue-600">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="text-gray-500 text-sm hover:underline">Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}