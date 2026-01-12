import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top custom-navbar ">
      <div className="container">
        {/* Brand */}
        <Link
          className="navbar-brand d-flex align-items-center gap-2"
          to="/"
        >
          <img
            src="/logo1.svg"
            alt="Nexus Logo"
            style={{ width: '215px', height: '250px', top: '-90px', left: '20px', position: 'fixed' }}
          />
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">

            {user ? (
              <>
                <li className="nav-item">
                  <Link
                    className="navbar-btn"
                    to={user.role === 'student' ? "/student-dashboard" : "/dashboard"}
                  >
                    Dashboard
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="navbar-btn" to="/exams">Exams</Link>
                </li>

                <li className="nav-item">
                  <Link className="navbar-btn" to="/courses">Courses</Link>
                </li>

                {user.role === 'trainer' && (
                  <>
                    <li className="nav-item">
                      <Link className="navbar-btn" to="/create-exam">Create Exam</Link>
                    </li>

                    <li className="nav-item">
                      <Link className="navbar-btn" to="/results-list">All Results</Link>
                    </li>
                  </>
                )}

                {user.role === 'student' && (
                  <li className="nav-item">
                    <Link className="navbar-btn" to="/results-list">My Results</Link>
                  </li>
                )}

                {/* Avatar Dropdown */}
                <li className="nav-item1 dropdown" style={{ position: 'relative' }}>
                  <button
                    className="navbar-btn1 avatar-btn"
                    id="profileDropdown"
                    type="button"
                    onClick={(e) => {
                      const menu = e.currentTarget.nextElementSibling;
                      menu.classList.toggle('show');
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </button>


                  <ul
                    className="dropdown-menu"
                    aria-labelledby="profileDropdown"
                    style={{
                      position: 'absolute',
                      left: -50,
                      right: '10px',
                      top: '60px',
                      minWidth: '200px',
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      padding: '8px 0',
                      zIndex: 1000
                    }}
                  >
                    <li
                      className="dropdown-item-text fw-semibold"
                      style={{
                        padding: '8px 16px',
                        fontWeight: '600',
                        borderBottom: '1px solid #eee'
                      }}
                    >
                      {user.name}
                    </li>
                    <li>
                      <button
                        className="navbar-btn1 text-danger"
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'transparent',
                          border: 'none',
                          padding: '8px 16px'
                        }}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="navbar-btn" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="navbar-btn" to="/register">Register</Link>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
