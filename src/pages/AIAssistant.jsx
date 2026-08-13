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
  const { session, user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function ensureConversation() {
    if (conversationId) return conversationId
    const { data, error: convErr } = await supabase
      .from('ai_conversations')
      .insert({ user_id: user.id, title: 'New conversation' })
      .select()
      .single()
    if (convErr || !data) throw new Error('Could not create conversation')
    setConversationId(data.id)
    return data.id
  }

  async function sendMessage(text) {
    if (!text.trim() || loading) return
    setError('')
    const userMessage = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const convId = await ensureConversation()
      await supabase.from('ai_messages').insert({ conversation_id: convId, role: 'user', content: text })

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody.error || `Request failed (${response.status})`)
      }

      const data = await response.json()
      if (!data.reply) throw new Error('No reply from AI service')

      await supabase.from('ai_messages').insert({ conversation_id: convId, role: 'assistant', content: data.reply })
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page assistant-page">
      <div className="page__header">
        <h1 className="page__title">AI Tutor</h1>
        <p className="page__subtitle">Ask me anything about your courses or learning journey</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="chat-welcome__icon">✨</div>
              <h2>Hi! I am Kisma AI</h2>
              <p>Your personal AI tutor. Ask me about any topic, or try one of these:</p>
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

        {error && <div className="chat-error">{error}</div>}

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
