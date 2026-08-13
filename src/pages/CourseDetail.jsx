import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session, user } = useAuth()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [enrolled, setEnrolled] = useState(false)
  const [progress, setProgress] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      const [{ data: courseData, error: courseErr }, { data: lessonData, error: lessonErr }] = await Promise.all([
        supabase.from('courses').select('*').eq('id', id).maybeSingle(),
        supabase.from('lessons').select('*').eq('course_id', id).order('order_index'),
      ])
      if (!active) return
      if (courseErr || !courseData) {
        setCourse(null)
        setLoading(false)
        return
      }
      setCourse(courseData)
      setLessons(lessonData || [])

      if (user) {
        const { data: enrollData } = await supabase.from('enrollments').select('course_id').eq('user_id', user.id).eq('course_id', id).maybeSingle()
        if (active) setEnrolled(!!enrollData)

        if (lessonData && lessonData.length > 0) {
          const { data: progressData } = await supabase.from('lesson_progress').select('lesson_id, completed').eq('user_id', user.id).in('lesson_id', lessonData.map(l => l.id))
          if (active) {
            const map = new Map()
            ;(progressData || []).forEach(p => map.set(p.lesson_id, p.completed))
            setProgress(map)
          }
        }
      }
      setLoading(false)
    }

    load()
    return () => { active = false }
  }, [id, user])

  const handleEnroll = async () => {
    if (!user) return
    setError('')
    setEnrolling(true)
    const { error: enrollErr } = await supabase.from('enrollments').insert({ course_id: id, user_id: user.id })
    setEnrolling(false)
    if (enrollErr) {
      if (enrollErr.code === '23505') {
        setEnrolled(true)
      } else {
        setError('Could not enroll. Please try again.')
      }
    } else {
      setEnrolled(true)
    }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!course) return (
    <div className="page">
      <Link to="/courses" className="back-link">← All courses</Link>
      <p>Course not found.</p>
    </div>
  )

  const completedCount = Array.from(progress.values()).filter(Boolean).length
  const totalLessons = lessons.length
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const firstUnfinished = lessons.find(l => !progress.get(l.id)) || lessons[0]

  return (
    <div className="page">
      <Link to="/courses" className="back-link">← All courses</Link>

      <div className="course-header" style={{ borderColor: course.color }}>
        <div className="course-header__icon" style={{ background: course.color }}>{course.icon}</div>
        <div className="course-header__info">
          <span className="tag tag--muted">{course.category}</span>
          <span className="tag tag--muted">{course.difficulty}</span>
          <h1 className="course-header__title">{course.title}</h1>
          <p className="course-header__desc">{course.description}</p>
        </div>
      </div>

      {enrolled && totalLessons > 0 && (
        <div className="course-progress-bar">
          <div className="course-progress-bar__label">
            <span>Progress: {completedCount} / {totalLessons} lessons</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="progress progress--lg"><div className="progress__bar" style={{ width: `${progressPercent}%` }} /></div>
        </div>
      )}

      <div className="course-actions">
        {error && <div className="form-error" style={{ marginBottom: '0.75rem' }}>{error}</div>}
        {!session ? (
          <div className="signin-prompt">
            <p>Sign in to enroll and track your progress.</p>
            <Link to="/signin" className="btn btn--primary btn--lg">Sign in to enroll</Link>
          </div>
        ) : !enrolled ? (
          <button className="btn btn--primary btn--lg" onClick={handleEnroll} disabled={enrolling}>
            {enrolling ? 'Enrolling...' : 'Enroll in course'}
          </button>
        ) : firstUnfinished ? (
          <button className="btn btn--primary btn--lg" onClick={() => navigate(`/courses/${id}/lessons/${firstUnfinished.id}`)}>
            {completedCount > 0 ? 'Continue learning' : 'Start first lesson'}
          </button>
        ) : (
          <span className="tag tag--success tag--lg">Course completed! 🎉</span>
        )}
      </div>

      <div className="lesson-list">
        <h2 className="lesson-list__title">Lessons ({totalLessons})</h2>
        {totalLessons === 0 ? (
          <p className="empty-text">No lessons available yet.</p>
        ) : (
          lessons.map((lesson, idx) => {
            const isComplete = progress.get(lesson.id)
            const lessonLink = session
              ? `/courses/${id}/lessons/${lesson.id}`
              : '/signin'
            return (
              <Link
                key={lesson.id}
                to={lessonLink}
                className={`lesson-item ${isComplete ? 'lesson-item--done' : ''}`}
              >
                <div className="lesson-item__check">
                  {isComplete ? '✓' : idx + 1}
                </div>
                <div className="lesson-item__body">
                  <h3>{lesson.title}</h3>
                  <span>{lesson.duration_minutes} min</span>
                </div>
                <div className="lesson-item__arrow">→</div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
