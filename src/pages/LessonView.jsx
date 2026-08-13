import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

export default function LessonView() {
  const { id: courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [lesson, setLesson] = useState(null)
  const [allLessons, setAllLessons] = useState([])
  const [course, setCourse] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      const [{ data: lessonData }, { data: courseData }, { data: lessonsData }] = await Promise.all([
        supabase.from('lessons').select('*').eq('id', lessonId).maybeSingle(),
        supabase.from('courses').select('*').eq('id', courseId).maybeSingle(),
        supabase.from('lessons').select('id, title, order_index').eq('course_id', courseId).order('order_index'),
      ])
      if (!active) return
      setLesson(lessonData)
      setCourse(courseData)
      setAllLessons(lessonsData || [])

      if (user) {
        const { data: prog } = await supabase.from('lesson_progress').select('completed').eq('user_id', user.id).eq('lesson_id', lessonId).maybeSingle()
        if (active) setCompleted(prog?.completed || false)
      }
      setLoading(false)
    }

    load()
    return () => { active = false }
  }, [lessonId, courseId, user])

  const toggleComplete = async () => {
    if (!user) return
    setToggling(true)
    const newCompleted = !completed
    setCompleted(newCompleted)

    const { data: existing } = await supabase.from('lesson_progress').select('id').eq('user_id', user.id).eq('lesson_id', lessonId).maybeSingle()

    let writeError = false
    if (existing) {
      const { error } = await supabase.from('lesson_progress').update({ completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }).eq('id', existing.id)
      if (error) writeError = true
    } else {
      const { error } = await supabase.from('lesson_progress').insert({ user_id: user.id, lesson_id: lessonId, completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null })
      if (error) writeError = true
    }

    if (writeError) {
      setCompleted(!newCompleted)
    }
    setToggling(false)
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!lesson) return <div className="page"><p>Lesson not found.</p></div>

  const currentIdx = allLessons.findIndex(l => l.id === lessonId)
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null

  return (
    <div className="page lesson-view">
      <Link to={`/courses/${courseId}`} className="back-link">← Back to course</Link>

      <div className="lesson-view__header">
        <span className="tag tag--muted">Lesson {currentIdx + 1} of {allLessons.length}</span>
        <h1 className="lesson-view__title">{lesson.title}</h1>
        <span className="lesson-view__duration">{lesson.duration_minutes} min read</span>
      </div>

      <div className="lesson-content">
        {lesson.content.split('\n').map((line, i) => {
          if (line.trim() === '') return <div key={i} className="lesson-content__spacer" />
          if (line.startsWith('- ')) return <div key={i} className="lesson-content__bullet">{line.slice(2)}</div>
          if (/^\d+\.\s/.test(line)) return <div key={i} className="lesson-content__bullet">{line}</div>
          if (line === line.toUpperCase() && line.length > 3) return <h3 key={i} className="lesson-content__subheading">{line}</h3>
          return <p key={i} className="lesson-content__p">{line}</p>
        })}
      </div>

      <div className="lesson-view__actions">
        <button
          className={`btn ${completed ? 'btn--ghost' : 'btn--primary'} btn--lg`}
          onClick={toggleComplete}
          disabled={toggling}
        >
          {completed ? '✓ Completed' : 'Mark as complete'}
        </button>
      </div>

      <div className="lesson-nav">
        {prevLesson ? (
          <button className="btn btn--ghost" onClick={() => navigate(`/courses/${courseId}/lessons/${prevLesson.id}`)}>
            ← Previous
          </button>
        ) : <span />}
        {nextLesson ? (
          <button className="btn btn--primary" onClick={() => navigate(`/courses/${courseId}/lessons/${nextLesson.id}`)}>
            Next lesson →
          </button>
        ) : (
          <Link to={`/courses/${courseId}`} className="btn btn--primary">Finish course →</Link>
        )}
      </div>
    </div>
  )
}
