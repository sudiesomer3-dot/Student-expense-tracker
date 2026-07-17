import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#3B82F6', '#22C55E', '#F97316', '#A855F7', '#EF4444']

export default function Dashboard() {
  const { expenses, budgets } = useApp()
  const navigate = useNavigate()

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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-6xl mx-auto p-8">

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
                  <tr key={e.id} className="border-t border-gray-200">
                    <td className="p-2">{e.date}</td>
                    <td className="p-2">{e.description || '-'}</td>
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