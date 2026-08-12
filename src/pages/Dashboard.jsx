import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'

export default function Dashboard() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [streak, setStreak] = useState(null)
  const [stats, setStats] = useState({ completed: 0, totalLessons: 0, coursesStarted: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true

    async function load() {
      const [{ data: enrollData }, { data: streakData }, { data: progressData }] = await Promise.all([
        supabase.from('enrollments').select('course_id, enrolled_at, courses(id, title, icon, color, category, difficulty)').eq('user_id', user.id).order('enrolled_at', { ascending: false }),
        supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('lesson_progress').select('lesson_id, completed, lessons(id, course_id)').eq('user_id', user.id),
      ])

      if (!active) return

      setEnrollments(enrollData || [])
      setStreak(streakData)

      const completed = (progressData || []).filter(p => p.completed).length
      const courseIds = new Set((progressData || []).map(p => p.lessons?.course_id))
      setStats({ completed, totalLessons: progressData?.length || 0, coursesStarted: courseIds.size })
      setLoading(false)
    }

    load()
    return () => { active = false }
  }, [user])

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Dashboard</h1>
        <p className="page__subtitle">Welcome back, {user?.email?.split('@')[0]}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card--streak">
          <div className="stat-card__icon">🔥</div>
          <div className="stat-card__value">{streak?.current_streak || 0}</div>
          <div className="stat-card__label">Day streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">✓</div>
          <div className="stat-card__value">{stats.completed}</div>
          <div className="stat-card__label">Lessons completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">📚</div>
          <div className="stat-card__value">{enrollments.length}</div>
          <div className="stat-card__label">Courses enrolled</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">🏆</div>
          <div className="stat-card__value">{streak?.longest_streak || 0}</div>
          <div className="stat-card__label">Longest streak</div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">Continue learning</h2>
          <Link to="/courses" className="link-btn">Browse all courses →</Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📖</div>
            <h3>No courses yet</h3>
            <p>Enroll in your first course to start learning.</p>
            <Link to="/courses" className="btn btn--primary">Browse courses</Link>
          </div>
        ) : (
          <div className="grid grid--2">
            {enrollments.map((enrollment) => {
              const course = enrollment.courses
              if (!course) return null
              return (
                <Link key={enrollment.course_id} to={`/courses/${course.id}`} className="continue-card">
                  <div className="continue-card__icon" style={{ background: course.color }}>{course.icon}</div>
                  <div className="continue-card__body">
                    <h3 className="continue-card__title">{course.title}</h3>
                    <span className="continue-card__category">{course.category} · {course.difficulty}</span>
                  </div>
                  <div className="continue-card__arrow">→</div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">AI Learning Assistant</h2>
          <Link to="/assistant" className="link-btn">Open chat →</Link>
        </div>
        <Link to="/assistant" className="assistant-promo">
          <div className="assistant-promo__icon">✨</div>
          <div>
            <h3>Ask Kisma AI anything</h3>
            <p>Get instant help with your courses, concepts, and learning questions.</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
