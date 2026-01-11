import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
  rel="stylesheet"
/>

const Home = () => {
  return (
    <div style={{ minHeight: 'calc(100vh - 70px)' }}>
      
      {/* ================= HERO SECTION ================= */}
      <div style={{
        backgroundImage: 'url("/image1.png")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Keeps Hero background static too
        minHeight: '700px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: 'white',
        padding: '100px 20px'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          marginBottom: '20px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          Online Examination System
        </h1>
        <p style={{ 
          fontSize: '1.4rem', 
          marginBottom: '40px',
          maxWidth: '700px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
        }}>
          Take exams anytime, anywhere with instant auto-evaluation
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <Link to="/register" style={{
            padding: '15px 40px',
            background: 'white',
            color: '#667eea',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}>
            Get Started
          </Link>
          <Link to="/login" style={{
            padding: '15px 40px',
            background: 'transparent',
            color: 'white',
            border: '2px solid white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'transform 0.2s'
          }}>
            Login
          </Link>
        </div>
      </div>
   
      {/* ================= FEATURES SECTION ================= */}
      {/* 1. Outer Wrapper for Static Background */}
      <div style={{
         backgroundImage: 'url("")',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundColor: '#f6f8fa',
          backgroundPosition: 'center',
          width: '100%',
          height: '200%',
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