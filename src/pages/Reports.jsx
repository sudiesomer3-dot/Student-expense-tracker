import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'

export default function Reports() {
  const { expenses, budgets } = useApp()
  const [filterMonth, setFilterMonth] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const months = [...new Set(expenses.map(e => e.date?.slice(0, 7)))].sort()
  const categories = [...new Set(expenses.map(e => e.category))]

  const filtered = expenses.filter(e => {
    const matchMonth = filterMonth ? e.date?.startsWith(filterMonth) : true
    const matchCat = filterCategory ? e.category === filterCategory : true
    return matchMonth && matchCat
  })

  const totalSpending = filtered.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.limit), 0)
  const budgetRemaining = totalBudget - totalSpending

  const categoryTotals = filtered.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {})
  const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">

        {/* Filters */}
        <p className="text-sm text-gray-500 mb-3">report filter</p>
        <div className="flex gap-4 mb-8">
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded px-4 py-2 text-sm outline-none"
          >
            <option value="">Month ▼</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded px-4 py-2 text-sm outline-none"
          >
            <option value="">Category ▼</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={() => { setFilterMonth(''); setFilterCategory('') }}
            className="bg-gray-100 border border-gray-300 rounded px-4 py-2 text-sm"
          >
            Date Range ▼
          </button>
          <button
            className="bg-blue-500 text-white rounded px-6 py-2 text-sm font-semibold hover:bg-blue-600"
          >
            Apply Filter
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-100 rounded-xl p-6">
            <p className="text-gray-500 text-sm">Total Spending</p>
            <p className="text-2xl font-bold mt-1">${totalSpending.toFixed(2)}</p>
          </div>
          <div className="bg-gray-100 rounded-xl p-6">
            <p className="text-gray-500 text-sm">Highest Category</p>
            <p className="text-2xl font-bold mt-1">{highestCategory}</p>
          </div>
          <div className="bg-gray-100 rounded-xl p-6">
            <p className="text-gray-500 text-sm">Budget Remaining</p>
            <p className="text-2xl font-bold mt-1">${budgetRemaining.toFixed(2)}</p>
          </div>
        </div>

        {/* Report Table */}
        <div className="bg-gray-100 rounded-xl p-6">
          <p className="font-bold mb-4">Report Table</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Category</th>
                <th className="text-left p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-gray-400">No expenses found.</td></tr>
              ) : (
                filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map(e => (
                  <tr key={e.id} className="border-t border-gray-200">
                    <td className="p-2">{e.date}</td>
                    <td className="p-2">{e.category}</td>
                    <td className="p-2 text-red-500">-${Number(e.amount).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}