import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

const SUGGESTIONS = [
  'Explain machine learning in simple terms',
  'What is the difference between supervised and unsupervised learning?',
  'How do I get started with Python for data science?',
  'What is a neural network?',
]

export default function AIAssistant() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function ensureConversation() {
    if (conversationId) return conversationId
    const { data } = await supabase.from('ai_conversations').insert({ user_id: user.id, title: 'New conversation' }).select().single()
    setConversationId(data.id)
    return data.id
  }

  async function sendMessage(text) {
    if (!text.trim() || loading) return
    const userMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    const convId = await ensureConversation()

    await supabase.from('ai_messages').insert({ conversation_id: convId, role: 'user', content: text })

    const response = generateResponse(text)

    await supabase.from('ai_messages').insert({ conversation_id: convId, role: 'assistant', content: response })

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setLoading(false)
    }, 400)
  }

  function generateResponse(question) {
    const q = question.toLowerCase()
    if (q.includes('machine learning') && (q.includes('simple') || q.includes('what') || q.includes('explain'))) {
      return 'Machine learning is a way to teach computers to find patterns in data. Instead of giving the computer exact rules, you show it lots of examples and it learns to make predictions on its own. For example, you could show it thousands of emails labeled "spam" or "not spam," and it learns to identify spam in new emails.'
    }
    if (q.includes('supervised') && q.includes('unsupervised')) {
      return 'Supervised learning uses labeled data — you tell the model the correct answer during training (e.g., "this email is spam"). Unsupervised learning uses unlabeled data — the model finds structure on its own (e.g., grouping customers by behavior). Supervised is more common in practice because it gives clear, testable predictions.'
    }
    if (q.includes('python') && q.includes('data science')) {
      return 'To get started with Python for data science: 1) Install Python 3.10+ from python.org. 2) Learn the basics: variables, lists, dictionaries, loops. 3) Learn NumPy for fast array operations. 4) Learn Pandas for data manipulation (DataFrames are like spreadsheets in code). 5) Learn Matplotlib for visualization. The "Python for Data Science" course on Kisma AI walks you through all of this step by step.'
    }
    if (q.includes('neural network')) {
      return 'A neural network is a model inspired by the brain. It has layers of "neurons" connected by weighted links. Data enters the input layer, flows through hidden layers (which transform it), and produces a prediction at the output layer. The network learns by adjusting the weights to reduce prediction errors. Deep learning is just neural networks with many layers.'
    }
    if (q.includes('react') || q.includes('web development')) {
      return 'React is a JavaScript library for building user interfaces. You build UIs from reusable "components," each managing its own state. When data changes, React efficiently updates only the parts of the screen that changed. The "Modern Web Development" course covers React, hooks, responsive design, and deployment with Vite.'
    }
    if (q.includes('streak') || q.includes('motivation') || q.includes('motivated')) {
      return 'To keep your streak going: 1) Set a daily reminder. 2) Even 10 minutes counts — consistency beats intensity. 3) Pick a time that works for you and stick to it. 4) Use the dashboard to track your progress visually. 5) Complete one lesson per day to keep your streak alive. You can do it!'
    }
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return 'Hello! I am Kisma AI, your learning assistant. I can help you understand course concepts, suggest learning paths, or answer questions about technology topics. What would you like to learn about?'
    }
    if (q.includes('recommend') || q.includes('course') || q.includes('start')) {
      return 'Based on your interests, here are some starting points:\n\n- If you are new to programming: "Python for Data Science"\n- If you want to understand AI: "Machine Learning Basics"\n- If you want to build websites: "Modern Web Development"\n- If you want design skills: "UI/UX Design Principles"\n\nYou can browse all courses from the Courses page.'
    }
    return 'That is a great question! While I am a built-in assistant focused on the courses available on Kisma AI, I can help you understand concepts like machine learning, Python, web development, neural networks, and design principles. Try asking me about a specific topic, or check out the Courses page for structured lessons.'
  }

  return (
    <div className="page assistant-page">
      <div className="page__header">
        <h1 className="page__title">AI Learning Assistant</h1>
        <p className="page__subtitle">Ask me anything about your courses or learning journey</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="chat-welcome__icon">✨</div>
              <h2>Hi! I am Kisma AI</h2>
              <p>Your personal learning assistant. Ask me about any course topic, or try one of these:</p>
              <div className="chat-suggestions">
                {SUGGESTIONS.map(s => (
                  <button key={s} className="chat-suggestion" onClick={() => sendMessage(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg chat-msg--${msg.role}`}>
              <div className="chat-msg__avatar">
                {msg.role === 'user' ? 'You' : 'AI'}
              </div>
              <div className="chat-msg__bubble">
                {msg.content.split('\n').map((line, j) => (
                  line.trim() === '' ? <br key={j} /> : <div key={j}>{line}</div>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-msg chat-msg--assistant">
              <div className="chat-msg__avatar">AI</div>
              <div className="chat-msg__bubble chat-msg__bubble--typing">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-bar">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask Kisma AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            disabled={loading}
          />
          <button
            className="btn btn--primary chat-send"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
