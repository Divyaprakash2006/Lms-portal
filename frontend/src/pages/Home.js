import React from 'react';
import { Link } from 'react-router-dom';

import './Home.css';

const Home = () => {
  return (
    <div style={{ minHeight: 'calc(100vh - 70px)' }}>


      {/* ================= HERO SECTION ================= */}
      <section style={{ backgroundColor: '#fff', padding: '80px 0', overflow: 'hidden' }}>
        <div className="container">
          <div className="row align-items-center">
            {/* Left Column: Image */}
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div style={{ position: 'relative' }}>
                {/* Orange accent shape */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '-20px',
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#571d78ff', // Orange accent
                  borderRadius: '50% 0 50% 50%',
                  zIndex: 0
                }}></div>
                <img
                  src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80"
                  alt="Student learning"
                  className="img-fluid rounded shadow-lg"
                  style={{ position: 'relative', zIndex: 1, width: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* Right Column: Text Content */}
            <div className="col-lg-6 ps-lg-5">
              <h6 style={{
                color: '#6c757d',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '1rem'
              }}>
                Why Nexus LMS?
              </h6>
              <h1 style={{
                fontSize: '3.5rem',
                fontWeight: '800',
                color: '#002f5b', // Moodle-like dark blue
                fontFamily: '"Merriweather", serif', // Fallback to serif if not loaded
                marginBottom: '1.5rem',
                lineHeight: '1.2'
              }}>
                Nexus puts the<br /> power of eLearning<br /> in your hands
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#495057',
                lineHeight: '1.8',
                marginBottom: '2rem'
              }}>
                At Nexus, our mission is to empower educators to improve our world with our open source eLearning software. Flexible, secure, and customizable for any online teaching or training initiative.
              </p>

              <div className="d-flex gap-3">
                <Link to="/register" className="btn btn-warning text-white fw-bold px-4 py-3 rounded-pill" style={{ backgroundColor: '#461e9cff', border: 'none' }}>
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-outline-dark fw-bold px-4 py-3 rounded-pill">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      {/* 1. Outer Wrapper for Static Background */}
      <div style={{
        backgroundColor: '#f6f8fa',
        width: '100%',
        height: '100%', // Changed from 200% to 100% as fixed attachment is gone
        position: 'relative'
      }}>
        {/* 2. Inner Container for Content Width */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            marginBottom: '60px',
            color: 'black', // Changed to white to show on dark background
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            Key Features
          </h2>
          <div className="container overflow-hidden">
            <div className="feature-slider">
              {[
                {
                  img: "https://cdn.edclass.com/wp-content/uploads/online-exams.jpg",
                  title: "Timed Exams",
                  desc: "Auto-submit when time runs out with real-time countdown"
                },
                {
                  img: "https://media.istockphoto.com/id/1096812458/photo/dry-hands-of-adult-student-using-notebook-keyboard-on-wood-table-to-do-test-examination-with.webp?a=1&b=1&s=612x612&w=0&k=20&c=lSreFDeY3MJQZU06OeGozTvnNedjEoUbJX9KsyHA5JU=",
                  title: "Auto Evaluation",
                  desc: "Instant results and feedback for all question types"
                },
                {
                  img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZGF0YSUyMHZpc3VhbGl6YXRpb258ZW58MHx8MHx8fDA%3D",
                  title: "Detailed Reports",
                  desc: "View comprehensive scores and performance analytics"
                },
                {
                  img: "https://media.istockphoto.com/id/1445983781/photo/security-assessment-is-shown-using-the-text.webp?a=1&b=1&s=612x612&w=0&k=20&c=QZu64yf3UX3Ut7UvHKXdNmimqt4mZHFyCwxAzeXKGBw=",
                  title: "Secure & Fair",
                  desc: "Advanced security measures to ensure exam integrity"
                }
              ]
                .concat([
                  {
                    img: "https://cdn.edclass.com/wp-content/uploads/online-exams.jpg",
                    title: "Timed Exams",
                    desc: "Auto-submit when time runs out with real-time countdown"
                  },
                  {
                    img: "https://media.istockphoto.com/id/1096812458/photo/dry-hands-of-adult-student-using-notebook-keyboard-on-wood-table-to-do-test-examination-with.webp?a=1&b=1&s=612x612&w=0&k=20&c=lSreFDeY3MJQZU06OeGozTvnNedjEoUbJX9KsyHA5JU=",
                    title: "Auto Evaluation",
                    desc: "Instant results and feedback for all question types"
                  },
                  {
                    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZGF0YSUyMHZpc3VhbGl6YXRpb258ZW58MHx8MHx8fDA%3D",
                    title: "Detailed Reports",
                    desc: "View comprehensive scores and performance analytics"
                  },
                  {
                    img: "https://media.istockphoto.com/id/1445983781/photo/security-assessment-is-shown-using-the-text.webp?a=1&b=1&s=612x612&w=0&k=20&c=QZu64yf3UX3Ut7UvHKXdNmimqt4mZHFyCwxAzeXKGBw=",
                    title: "Secure & Fair",
                    desc: "Advanced security measures to ensure exam integrity"
                  }
                ])
                .map((item, index) => (
                  <div className="feature-card mx-3" key={index}>
                    <div className="card h-100">
                      <img
                        src={item.img}
                        className="card-img-top"
                        alt={item.title}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{item.title}</h5>
                        <p className="card-text">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>



        </div>
      </div>

    </div>
  );
};

export default Home;