import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export default function SignUp() {
  const { session, loading, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from || '/dashboard'

  if (loading) return <div className="full-loader"><div className="spinner" /></div>
  if (session) {
    navigate(redirectTo, { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setSubmitting(true)
    const { data, error } = await signUp(email, password, displayName)
    setSubmitting(false)
    if (error) {
      setError(error.message === 'User already registered' ? 'An account with this email already exists.' : error.message)
    } else if (data.user && !data.session) {
      setError('Account created. Please check your email to confirm your account, then sign in.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="logo auth-card__logo">
          <span className="logo__mark">K</span>
          <span className="logo__text">Kisma AI</span>
        </Link>
        <h1 className="auth-card__title">Create your account</h1>
        <p className="auth-card__subtitle">Start learning in minutes — it's free</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Your name</label>
            <input id="name" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder="Jane Doe" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="At least 6 characters" />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="auth-card__footer">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
