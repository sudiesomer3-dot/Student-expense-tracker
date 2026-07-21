import { useState } from 'react'
import { doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#3B82F6', '#22C55E', '#F97316', '#A855F7', '#EF4444']

export default function Dashboard() {
  const { expenses, budgets } = useApp()
  const navigate = useNavigate()
  const [message, setMessage] = useState({ text: '', type: '' })

  // Delete modal state
  const [deletingExpenseId, setDeletingExpenseId] = useState(null)

  // Edit modal state
  const [editingExpense, setEditingExpense] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editError, setEditError] = useState('')

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.limit), 0)
  const totalBalance = totalBudget - totalExpenses

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {})

  const barData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))
  const pieData = barData.length > 0 ? barData : [{ name: 'No Data', value: 1 }]

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)

  const confirmDelete = async () => {
    if (!deletingExpenseId) return
    const id = deletingExpenseId
    setDeletingExpenseId(null)
    try {
      await deleteDoc(doc(db, 'expenses', id))
      setMessage({ text: 'Expense deleted successfully!', type: 'success' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to delete expense.', type: 'error' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    }
  }

  const handleEditClick = (expense) => {
    setEditingExpense(expense)
    setEditAmount(expense.amount)
    setEditCategory(expense.category)
    setEditDate(expense.date)
    setEditDescription(expense.description || '')
    setEditError('')
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditError('')
    if (!editAmount || Number(editAmount) <= 0) {
      setEditError('Please enter a valid amount.')
      return
    }
    if (!editCategory) {
      setEditError('Please select a category.')
      return
    }
    try {
      await updateDoc(doc(db, 'expenses', editingExpense.id), {
        amount: Number(editAmount),
        category: editCategory,
        date: editDate,
        description: editDescription
      })
      setEditingExpense(null)
      setMessage({ text: 'Expense updated successfully!', type: 'success' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setEditError('Failed to update expense. Try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-6xl mx-auto p-8">

        {/* Action Status Messages */}
        {message.text && (
          <div className={`p-4 mb-6 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}>
            <span>{message.type === 'success' ? '✅' : '❌'} {message.text}</span>
            <button onClick={() => setMessage({ text: '', type: '' })} className="hover:opacity-75 font-bold cursor-pointer text-base">×</button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-100 rounded-xl p-6">
            <p className="text-gray-500 text-sm">Total Balance</p>
            <p className="text-2xl font-bold mt-1">${totalBalance.toFixed(2)}</p>
          </div>
          <div className="bg-gray-100 rounded-xl p-6">
            <p className="text-gray-500 text-sm">Total Expense</p>
            <p className="text-2xl font-bold mt-1">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-gray-100 rounded-xl p-6">
            <p className="text-gray-500 text-sm">Budget Remaining</p>
            <p className="text-2xl font-bold mt-1">${totalBalance.toFixed(2)}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-100 rounded-xl p-6">
            <p className="font-bold mb-4">Spending by Category</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-gray-100 rounded-xl p-6">
            <p className="font-bold mb-4">Expense Breakdown</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-gray-100 rounded-xl p-6">
          <p className="font-bold mb-4">Recent Expenses</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Description</th>
                <th className="text-left p-2">Category</th>
                <th className="text-left p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-400">No expenses yet. <button onClick={() => navigate('/add-expense')} className="text-blue-500 underline">Add one</button></td></tr>
              ) : (
                recentExpenses.map(e => (
                  <tr key={e.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-3">{e.date}</td>
                    <td className="p-3">{e.description || '-'}</td>
                    <td className="p-3">{e.category}</td>
                    <td className="p-3 text-red-500">
                      <div className="flex justify-between items-center">
                        <span>-${Number(e.amount).toFixed(2)}</span>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditClick(e)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition select-none"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingExpenseId(e.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition select-none"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Edit Expense Modal Overlay */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl mx-4 border border-gray-100">
            <div className="flex items-center justify-between border-b pb-3 mb-5">
              <h2 className="font-bold text-xl text-gray-800">Edit Expense</h2>
              <button type="button" onClick={() => setEditingExpense(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer">×</button>
            </div>

            {editError && (
              <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-sm mb-4">
                ⚠️ {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount ($) *</label>
                <div className="flex items-center border border-blue-400 rounded-lg mt-1 overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition">
                  <span className="pl-3 py-2 text-gray-500 select-none">$</span>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2 outline-none font-medium text-gray-800"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category *</label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 mt-1 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium text-gray-800 bg-white"
                  required
                >
                  <option value="">Select category</option>
                  {['Food', 'Transport', 'Bills', 'Shopping', 'Fun', 'Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date *</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 mt-1 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description (optional)</label>
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="Add details..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 mt-1 outline-none h-24 resize-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-gray-800"
                />
              </div>

              <div className="flex gap-3 justify-end mt-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-semibold transition cursor-pointer shadow-md shadow-blue-100"
                >
                  Update Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {deletingExpenseId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl mx-4 border border-gray-100 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Expense?</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete this expense? This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setDeletingExpenseId(null)}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-semibold transition cursor-pointer"
              >
                No, Keep it
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold transition cursor-pointer shadow-md shadow-red-100"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}