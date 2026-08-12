import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Landing() {
  const [courseCount, setCourseCount] = useState(0)

  useEffect(() => {
    supabase.from('courses').select('id', { count: 'exact', head: true }).then(({ count }) => setCourseCount(count || 0))
  }, [])

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="container landing-header__inner">
          <Link to="/" className="logo">
            <span className="logo__mark">K</span>
            <span className="logo__text">Kisma AI</span>
          </Link>
          <nav className="landing-nav">
            <a href="#features">Features</a>
            <a href="#courses">Courses</a>
            <Link to="/signin" className="btn btn--ghost">Sign in</Link>
            <Link to="/signup" className="btn btn--primary">Get started</Link>
          </nav>
          <button className="menu-toggle" aria-label="Toggle menu" onClick={(e) => {
            const nav = e.target.closest('.landing-header').querySelector('.landing-nav')
            nav.classList.toggle('landing-nav--open')
          }}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <span className="badge">AI-powered learning</span>
            <h1>Learn smarter,<br />not harder.</h1>
            <p>Kisma AI helps you master new skills with personalized learning paths, AI-generated lessons, and progress tracking — all in one place.</p>
            <div className="hero__actions">
              <Link to="/signup" className="btn btn--primary btn--lg">Start learning free</Link>
              <Link to="/courses" className="btn btn--ghost btn--lg">Browse courses</Link>
            </div>
            {courseCount > 0 && <p className="hero__stat">{courseCount} courses available</p>}
          </div>
          <div className="hero__visual">
            <div className="card-stack">
              <div className="card-stack__item card-stack__item--1">
                <div className="card-stack__label">Lesson 3</div>
                <div className="card-stack__title">Intro to Machine Learning</div>
                <div className="progress"><div className="progress__bar" style={{ width: '65%' }} /></div>
              </div>
              <div className="card-stack__item card-stack__item--2">
                <div className="card-stack__label">Streak</div>
                <div className="card-stack__big">12 days</div>
              </div>
              <div className="card-stack__item card-stack__item--3">
                <div className="card-stack__label">Next up</div>
                <div className="card-stack__title">Neural Networks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="container">
          <h2 className="section__title">Everything you need to learn</h2>
          <p className="section__subtitle">Tools designed to keep you motivated and on track.</p>
          <div className="grid grid--3">
            <div className="feature-card">
              <div className="feature-card__icon">AI</div>
              <h3>Personalized paths</h3>
              <p>AI builds a learning plan tailored to your goals and pace.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">HD</div>
              <h3>Bite-sized lessons</h3>
              <p>Short, focused lessons that fit into any schedule.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">PR</div>
              <h3>Track progress</h3>
              <p>See your streaks, completions, and skill growth over time.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="section section--alt">
        <div className="container">
          <h2 className="section__title">Popular courses</h2>
          <p className="section__subtitle">Start with a course curated by Kisma AI.</p>
          <div className="grid grid--3">
            <div className="course-card">
              <div className="course-card__banner course-card__banner--1">ML</div>
              <div className="course-card__body">
                <h3>Machine Learning Basics</h3>
                <p>Understand the fundamentals of ML models and training.</p>
                <span className="tag">12 lessons</span>
              </div>
            </div>
            <div className="course-card">
              <div className="course-card__banner course-card__banner--2">WD</div>
              <div className="course-card__body">
                <h3>Modern Web Development</h3>
                <p>Build responsive apps with React and modern tooling.</p>
                <span className="tag">18 lessons</span>
              </div>
            </div>
            <div className="course-card">
              <div className="course-card__banner course-card__banner--3">PY</div>
              <div className="course-card__body">
                <h3>Python for Data Science</h3>
                <p>Analyze data and build visualizations with Python.</p>
                <span className="tag">15 lessons</span>
              </div>
            </div>
          </div>
          <div className="section__cta">
            <Link to="/signup" className="btn btn--primary btn--lg">Join Kisma AI</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer__inner">
          <span className="logo logo--sm">
            <span className="logo__mark">K</span>
            <span className="logo__text">Kisma AI</span>
          </span>
          <p className="footer__copy">© 2026 Kisma AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
