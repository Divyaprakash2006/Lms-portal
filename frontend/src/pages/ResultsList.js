import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubmissionsByStudent } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ResultsList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await getSubmissionsByStudent(user._id);
        setSubmissions(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchResults();
  }, [user]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <h4 className="text-primary">Loading results...</h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="results-list-page">
    <div className="container my-5">
      <div className="mb-4 text-center">
        <h1 className="display-5">My Results</h1>
        <p className="text-secondary">View your exam performance and detailed results</p>
      </div>

      {submissions.length === 0 ? (
        <div className="card  text-center p-5"style={{background:'rgb(245, 245, 245)'}}>
          <h2 className="text-secondary mb-3">No Results Yet</h2>
          <p className="text-muted mb-4">
            You haven't taken any exams yet. Take an exam to see your results here!
          </p>
         
        </div>
      ) : (
        <div className="row g-4">
          {submissions.map((submission) => {
            const isPassed = submission.score >= submission.examId?.passingMarks;

            return (
              <div key={submission._id} className="col-md-6 col-lg-4">
                <div
                  className={`card h-100 shadow border-${isPassed ? 'success' : 'danger'} cursor-pointer`}
                  onClick={() => navigate(`/results/${submission._id}`)}
                  style={{ transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
                  }}
                >
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="card-title">{submission.examId?.title || 'Unknown Exam'}</h5>
                      <p className="card-subtitle text-muted mb-3">{submission.examId?.subject || 'Unknown Subject'}</p>

                      <ul className="list-unstyled mb-3">
                        <li><strong>Score:</strong> {submission.score}/{submission.totalMarks}</li>
                        <li><strong>Percentage:</strong> {submission.percentage}%</li>
                        <li><strong>Date:</strong> {new Date(submission.submittedAt).toLocaleDateString()}</li>
                      </ul>
                    </div>

                    <div className="text-center mt-3">
                      <span
                        className={`badge rounded-pill mb-2 text-white px-3 py-2`}
                        style={{
                          background: isPassed
                            ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                            : 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        }}
                      >
                        {isPassed ? 'PASSED' : 'FAILED'}
                      </span>
                      <div className="h4 fw-bold">{submission.percentage}%</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </div>
  );
};

export default ResultsList;
