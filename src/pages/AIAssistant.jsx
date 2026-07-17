import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'

const SUGGESTED = [
  'How much did I spend this month?',
  'Which category costs the most?',
  'Am I over my budget?'
]

export default function AIAssistant() {
  const { expenses, budgets } = useApp()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.limit), 0)
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {})
  const highestCat = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

  const insight = highestCat
    ? `You are close to your monthly ${highestCat[0]} budget. Consider reducing ${highestCat[0].toLowerCase()} spending.`
    : 'Add some expenses to get personalized insights.'

  const getAIResponse = (question) => {
    const q = question.toLowerCase()
    if (q.includes('spend this month') || q.includes('how much')) {
      return `You have spent $${totalSpent.toFixed(2)} this month across all categories.`
    }
    if (q.includes('category') || q.includes('most')) {
      return highestCat
        ? `Your highest spending category is ${highestCat[0]}. You spent $${highestCat[1].toFixed(2)} on ${highestCat[0].toLowerCase()} this month.`
        : 'No expenses logged yet.'
    }
    if (q.includes('over') || q.includes('budget')) {
      const over = totalSpent > totalBudget
      return over
        ? `Yes, you are over budget by $${(totalSpent - totalBudget).toFixed(2)}. Consider cutting back on ${highestCat?.[0] || 'spending'}.`
        : `No, you are within budget. You have $${(totalBudget - totalSpent).toFixed(2)} remaining.`
    }
    return `Based on your spending data, you have spent $${totalSpent.toFixed(2)} total. Your highest category is ${highestCat?.[0] || 'N/A'}. Try to stay within your $${totalBudget.toFixed(2)} budget.`
  }

  const handleSend = async (question) => {
    const q = question || input
    if (!q.trim()) return
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      const response = getAIResponse(q)
      setMessages(prev => [...prev, { role: 'ai', text: response }])
      setLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto p-8">

        {/* AI Insight */}
        <div className="bg-gray-100 rounded-xl p-4 mb-6">
          <p className="font-bold text-sm">AI Insight</p>
          <p className="text-sm mt-1">{insight}</p>
        </div>

        {/* Chat Area */}
        <div className="bg-gray-100 rounded-xl p-4 mb-4 min-h-64 flex flex-col gap-4">
          {messages.length === 0 && (
            <p className="text-gray-400 text-sm text-center mt-8">Ask me anything about your spending!</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-xl px-4 py-2 text-sm text-gray-500">Thinking...</div>
            </div>
          )}

          {/* Suggested Questions */}
          <div className="flex flex-col gap-2 mt-auto">
            {SUGGESTED.map(q => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="self-end bg-blue-100 text-blue-700 rounded-xl px-3 py-1 text-xs hover:bg-blue-200"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about your spending..."
            className="flex-1 border border-gray-300 rounded px-4 py-2 outline-none text-sm"
          />
          <button
            onClick={() => handleSend()}
            className="bg-blue-500 text-white px-6 py-2 rounded font-semibold hover:bg-blue-600 text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}