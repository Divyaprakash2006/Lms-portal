import React, { useState, useContext, useEffect } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    role: 'student'
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = 'auto');
  }, []);

  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
  }, [location.pathname]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const switchMode = (mode) => {
    setError('');
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
      role: 'student'
    });
    navigate(mode === 'login' ? '/login' : '/register');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;

      if (isLogin) {
        result = await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
      }

      if (result?.success) {
        navigate(
          result.user.role === 'student'
            ? '/student-dashboard'
            : '/dashboard'
        );
      } else {
        setError(result?.message || 'Authentication failed');
      }
    } catch {
      setError('Server error. Try again.');
    }

    setLoading(false);
  };

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 0',
      backgroundColor: '#fff'
    }}>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-11">
            <div
              className="card"
              style={{
                borderRadius: '1rem',
                bottom: '50px',
                border: 'none',
                overflow: 'visible'
              }}
            >
              <div className="row g-0">

                {/* IMAGE */}
                <div className="col-md-6 d-none d-md-block" style={{ padding: 0 }}>
                  <img
                    src="https://t4.ftcdn.net/jpg/04/60/23/37/360_F_460233735_3q7EPRIRdlLIQZYK2ucez8QY8PC53bWA.jpg"
                    alt="auth"

                    style={{
                      objectFit: 'cover',
                      height: '100%',
                      width: '100%',
                      top: '100px',
                      minHeight: '200px',
                      borderTopLeftRadius: '1rem',
                      borderBottomLeftRadius: '1rem'
                    }}
                  />
                </div>

                {/* FORM */}
                <div className="col-md-6 d-flex align-items-center">
                  <div
                    className="card-body p-4"
                    style={{
                      width: '100%',
                      marginBottom: '40px' // Shift form visually upwards
                    }}
                  >
                    <form onSubmit={handleSubmit} autoComplete="off">

                      <div className="d-flex mb-0 pb-0">
                        <img
                          src="/logo1.svg"
                          alt="Nexus Logo"
                          style={{ width: '200px', height: '100px' }}
                          className="img-fluid"
                        />
                      </div>

                      <h5 className="mb-3" style={{ color: '#212529', fontWeight: '600', fontSize: '1.25rem' }}>
                        {isLogin ? 'Sign into your account' : 'Create your account'}
                      </h5>

                      {error && (
                        <div className="alert alert-danger py-2" style={{ fontSize: '0.9rem' }}>
                          {error}
                        </div>
                      )}

                      {!isLogin && (
                        <input
                          className="form-control mb-2"
                          style={{
                            border: '1px solid #ced4da',
                            padding: '0.5rem 0.75rem'
                          }}
                          placeholder="Full Name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          autoComplete="off"
                        />
                      )}

                      <input
                        className="form-control mb-2"
                        style={{
                          border: '1px solid #ced4da',
                          padding: '0.5rem 0.75rem'
                        }}
                        placeholder="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="off"
                      />

                      <input
                        type="password"
                        className="form-control mb-2"
                        style={{
                          border: '1px solid #ced4da',
                          padding: '0.5rem 0.75rem'
                        }}
                        placeholder="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                      />

                      {!isLogin && (
                        <>
                          <input
                            type="password"
                            className="form-control mb-2"
                            style={{
                              border: '1px solid #ced4da',
                              padding: '0.5rem 0.75rem'
                            }}
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                          />

                          <select
                            className="form-select mb-3"
                            style={{
                              border: '1px solid #ced4da',
                              padding: '0.5rem 0.75rem',
                              color: '#495057'
                            }}
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                          >
                            <option value="student">Student</option>
                            <option value="trainer">Trainer</option>
                          </select>
                        </>
                      )}

                      <button
                        type="submit"
                        className="btn text-black w-50  mb-3"
                        disabled={loading}
                        style={{
                          fontWeight: '600',
                          marginLeft: '30%',
                          padding: '10px',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 6px rgba(248, 244, 245, 0.98)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 12px rgba(246, 243, 243, 0.99)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 6px rgba(250, 244, 244, 1)';
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Please wait...
                          </>
                        ) : (
                          isLogin ? 'Login' : 'Register Now'
                        )}
                      </button>

                      <p className="text-center mt-2 mb-0">
                        <small className="text-muted">
                          {isLogin ? "Don't have an account? " : "Already have an account? "}
                        </small>
                        <span
                          className="text-primary fw-bold"
                          style={{
                            cursor: 'pointer',
                            textDecoration: 'none'
                          }}
                          onClick={() =>
                            switchMode(isLogin ? 'register' : 'login')
                          }
                        >
                          {isLogin ? 'Register here' : 'Login here'}
                        </span>
                      </p>

                    </form>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
