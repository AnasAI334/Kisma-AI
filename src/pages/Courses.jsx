import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

export default function Courses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [enrolledIds, setEnrolledIds] = useState(new Set())
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      const { data: courseData } = await supabase.from('courses').select('*').order('title')
      if (!active) return
      setCourses(courseData || [])

      if (user) {
        const { data: enrollData } = await supabase.from('enrollments').select('course_id').eq('user_id', user.id)
        if (active) setEnrolledIds(new Set((enrollData || []).map(e => e.course_id)))
      }
      setLoading(false)
    }

    load()
    return () => { active = false }
  }, [user])

  const categories = ['All', ...new Set(courses.map(c => c.category))]
  const filtered = filter === 'All' ? courses : courses.filter(c => c.category === filter)

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Courses</h1>
        <p className="page__subtitle">Explore {courses.length} courses across {categories.length - 1} categories</p>
      </div>

      <div className="filter-bar">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-chip ${filter === cat ? 'filter-chip--active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid--3">
        {filtered.map(course => (
          <Link key={course.id} to={`/courses/${course.id}`} className="course-card">
            <div className="course-card__banner" style={{ background: course.color }}>
              {course.icon}
            </div>
            <div className="course-card__body">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-card__meta">
                <span className="tag">{course.category}</span>
                <span className="tag tag--muted">{course.difficulty}</span>
                {enrolledIds.has(course.id) && <span className="tag tag--success">Enrolled</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
