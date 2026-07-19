import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'

export default function Reports() {
  const { expenses, budgets } = useApp()
  const [filterMonth, setFilterMonth] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const months = [
    ...new Set(
      expenses
        .map(expense => expense.date?.slice(0, 7))
        .filter(Boolean)
    ),
  ].sort()

  const categories = [
    ...new Set(
      expenses
        .map(expense => expense.category)
        .filter(Boolean)
    ),
  ]

  const filtered = expenses.filter(expense => {
    const matchMonth = filterMonth
      ? expense.date?.startsWith(filterMonth)
      : true

    const matchCategory = filterCategory
      ? expense.category === filterCategory
      : true

    return matchMonth && matchCategory
  })

  const totalSpending = filtered.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  const totalBudget = budgets.reduce(
    (sum, budget) => sum + Number(budget.limit),
    0
  )

  const budgetRemaining = totalBudget - totalSpending

  const categoryTotals = filtered.reduce((totals, expense) => {
    totals[expense.category] =
      (totals[expense.category] || 0) + Number(expense.amount)

    return totals
  }, {})

  const highestCategory =
    Object.entries(categoryTotals).sort(
      (first, second) => second[1] - first[1]
    )[0]?.[0] || '-'

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert('There are no expenses to export.')
      return
    }

    const headers = [
      'Date',
      'Category',
      'Description',
      'Amount',
    ]

    const rows = filtered.map(expense => [
      expense.date || '',
      expense.category || '',
      expense.description || '',
      Number(expense.amount).toFixed(2),
    ])

    const csvContent = [headers, ...rows]
      .map(row =>
        row
          .map(value => {
            const escapedValue = String(value).replace(/"/g, '""')
            return `"${escapedValue}"`
          })
          .join(',')
      )
      .join('\n')

    const blob = new Blob(
      ['\uFEFF' + csvContent],
      { type: 'text/csv;charset=utf-8;' }
    )

    const downloadUrl = URL.createObjectURL(blob)
    const downloadLink = document.createElement('a')

    downloadLink.href = downloadUrl
    downloadLink.download = 'expense-report.csv'

    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)

    URL.revokeObjectURL(downloadUrl)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto p-8">

        {/* Filters */}
        <p className="text-sm text-gray-500 mb-3">
          Report Filter
        </p>

        <div className="flex flex-wrap gap-4 mb-8">
          <select
            value={filterMonth}
            onChange={event =>
              setFilterMonth(event.target.value)
            }
            className="bg-gray-100 border border-gray-300 rounded px-4 py-2 text-sm outline-none"
          >
            <option value="">All Months</option>

            {months.map(month => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={event =>
              setFilterCategory(event.target.value)
            }
            className="bg-gray-100 border border-gray-300 rounded px-4 py-2 text-sm outline-none"
          >
            <option value="">All Categories</option>

            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setFilterMonth('')
              setFilterCategory('')
            }}
            className="bg-gray-100 border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-200"
          >
            Clear Filters
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-green-500 text-white rounded px-6 py-2 text-sm font-semibold hover:bg-green-600"
          >
            Export to CSV
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-100 rounded-xl p-6">
            <p className="text-gray-500 text-sm">
              Total Spending
            </p>

            <p className="text-2xl font-bold mt-1">
              ${totalSpending.toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-100 rounded-xl p-6">
            <p className="text-gray-500 text-sm">
              Highest Category
            </p>

            <p className="text-2xl font-bold mt-1">
              {highestCategory}
            </p>
          </div>

          <div className="bg-gray-100 rounded-xl p-6">
            <p className="text-gray-500 text-sm">
              Budget Remaining
            </p>

            <p className="text-2xl font-bold mt-1">
              ${budgetRemaining.toFixed(2)}
            </p>
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
                <th className="text-left p-2">
                  Description
                </th>
                <th className="text-left p-2">Amount</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-4 text-center text-gray-400"
                  >
                    No expenses found.
                  </td>
                </tr>
              ) : (
                [...filtered]
                  .sort(
                    (first, second) =>
                      new Date(second.date) -
                      new Date(first.date)
                  )
                  .map(expense => (
                    <tr
                      key={expense.id}
                      className="border-t border-gray-200"
                    >
                      <td className="p-2">
                        {expense.date}
                      </td>

                      <td className="p-2">
                        {expense.category}
                      </td>

                      <td className="p-2">
                        {expense.description || '-'}
                      </td>

                      <td className="p-2 text-red-500">
                        -${Number(expense.amount).toFixed(2)}
                      </td>
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
