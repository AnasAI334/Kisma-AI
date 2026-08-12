import { useState } from 'react'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app">
      <header className="header">
        <div className="container header__inner">
          <a className="logo" href="#">
            <span className="logo__mark">K</span>
            <span className="logo__text">Kisma AI</span>
          </a>
          <nav className={`nav ${menuOpen ? 'nav--open' : ''}`}>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#courses" onClick={() => setMenuOpen(false)}>Courses</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a className="btn btn--ghost" href="#signin" onClick={() => setMenuOpen(false)}>Sign in</a>
            <a className="btn btn--primary" href="#signup" onClick={() => setMenuOpen(false)}>Get started</a>
          </nav>
          <button
            className="menu-toggle"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(o => !o)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero__inner">
            <div className="hero__content">
              <span className="badge">AI-powered learning</span>
              <h1>Learn smarter, <br />not harder.</h1>
              <p>
                Kisma AI helps you master new skills with personalized learning paths,
                AI-generated lessons, and progress tracking — all in one place.
              </p>
              <div className="hero__actions">
                <a className="btn btn--primary btn--lg" href="#signup">Start learning free</a>
                <a className="btn btn--ghost btn--lg" href="#courses">Browse courses</a>
              </div>
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
          </div>
        </section>

        <section id="about" className="section">
          <div className="container about">
            <h2 className="section__title">About Kisma AI</h2>
            <p className="about__text">
              Kisma AI is a learning platform built to make high-quality education
              accessible to everyone. Our AI-driven approach adapts to how you learn,
              so you can spend less time searching and more time growing.
            </p>
            <a className="btn btn--primary btn--lg" href="#signup">Join Kisma AI</a>
          </div>
        </section>
      </main>

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
