import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getSubmissionById } from '../services/api';
import './CreateExam.css';

const ResultDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [submission, setSubmission] = useState(location.state?.submissionData || null);
  const [loading, setLoading] = useState(!location.state?.submissionData);
  const [error, setError] = useState('');

  // Prevent going back to exam page
  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname);
      navigate('/exams', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, null, window.location.pathname);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const response = await getSubmissionById(id);
        setSubmission(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    if (!submission && id) fetchSubmission();
  }, [id, submission]);

  if (loading) {
    return (
      <div className="results-page">
      <div className="d-flex justify-content-center align-items-center vh-50">
        <h4 className="text-primary">Loading results...</h4>
      </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="results-page">
      <div className="container mt-5">
        <div className="alert alert-danger">{error || 'Results not found'}</div>
        <button className="btn btn-primary" onClick={() => navigate('/exams')}>
          Back to Exams
        </button>
      </div>
      </div>
    );
  }

  const isPassed = submission.score >= submission.examId?.passingMarks;

  return (
    <div className="results-page">
    <div className="container my-5">

      {/* Result Summary */}
      <div className={`card text-center mb-4 shadow ${isPassed ? 'border-success' : 'border-secondary'}`}>
        <img
          src={isPassed 
                ? 'https://cdn-icons-png.flaticon.com/512/5454/5454607.png'
                : 'https://uxwing.com/wp-content/themes/uxwing/download/education-school/fail-icon.png'}
          className="card-img-top mx-auto mt-3"
          alt="Result status"
          style={{ maxHeight: '200px', width: 'auto', objectFit: 'contain', background: 'rgba(126, 46, 144, 0.05)' }}
        />
        <div className="card-body">
          <h1 className="card-title display-5">{isPassed ? 'Congratulations!' : 'Keep Trying!'}</h1>
          <h4 className="mb-3">You <strong>{isPassed ? 'PASSED' : 'FAILED'}</strong> the exam</h4>
          <h2 className="my-3 fw-bold">{submission.score} / {submission.totalMarks}</h2>
          <p className="fs-5">{submission.percentage}% Score</p>
          <p className="text-muted">
            Submitted on {new Date(submission.submittedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Exam Details */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h4 className="card-title mb-3">Exam Details</h4>
          <div className="row g-3">
            <div className="col-md-4"><strong>Exam:</strong> {submission.examId?.title}</div>
            <div className="col-md-4"><strong>Subject:</strong> {submission.examId?.subject}</div>
            <div className="col-md-4"><strong>Total Questions:</strong> {submission.answers?.length}</div>
            <div className="col-md-4"><strong>Time Taken:</strong> {submission.timeTaken} min</div>
            <div className="col-md-4"><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}</div>
            <div className="col-md-4">
              <strong>Status:</strong>{' '}
              <span className={`badge ${isPassed ? 'bg-success' : 'bg-danger'}`}>
                {isPassed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="card mb-4 ">
        <div className="card-body">
          <h4 className="card-title mb-3">Performance Analysis</h4>
          <div className="row text-center mb-3">
            <div className="col-md-4 mb-2">
              <div className="p-3 bg-success-subtle rounded">
                <h3>{submission.answers.filter(a => a.isCorrect).length}</h3>
                <p className="mb-0">Correct</p>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <div className="p-3 bg-danger-subtle rounded">
                <h3>{submission.answers.filter(a => !a.isCorrect).length}</h3>
                <p className="mb-0">Incorrect</p>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <div className="p-3 bg-info-subtle rounded">
                <h3>{submission.percentage}%</h3>
                <p className="mb-0">Accuracy</p>
              </div>
            </div>
          </div>

          <div className="progress" style={{ height: '25px' }}>
            <div
              className={`progress-bar ${isPassed ? 'bg-success' : 'bg-danger'}`}
              style={{ width: `${submission.percentage}%` }}
            >
              {submission.percentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Answer Review */}
      {submission.detailedAnswers?.length > 0 && (
        <div className="card mb-4 ">
          <div className="card-body">
            <h4 className="card-title mb-3">Answer Review</h4>
            {submission.detailedAnswers.map((answer, index) => (
              <div
                key={answer.questionId}
                className={`border rounded p-3 mb-3 ${answer.isCorrect ? 'border-success bg-success-subtle' : 'border-danger bg-danger-subtle'}`}
              >
                <div className="d-flex justify-content-between mb-2">
                  <span className="badge bg-primary">Q{index + 1}</span>
                  <span className={`badge ${answer.isCorrect ? 'bg-success' : 'bg-danger'}`}>
                    {answer.marksObtained} / {answer.totalMarks}
                  </span>
                </div>
                <h6>{answer.questionText}</h6>
                <p className="mb-1"><strong>Your Answer:</strong></p>
                <div className="bg-white p-2 rounded mb-2">{answer.studentAnswer || 'No answer provided'}</div>
                {!answer.isCorrect && (
                  <>
                    <p className="mb-1"><strong>Correct Answer:</strong></p>
                    <div className="bg-success-subtle p-2 rounded">{answer.correctAnswer}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="text-center mb-5">
        <button className="btn btn-primary me-2" onClick={() => navigate('/exams')}>
          Back to Exams
        </button>
        {!isPassed && (
          <button
            className="btn btn-success"
            onClick={() => navigate(`/take-exam/${submission.examId._id}`)}
          >
            Retake Exam
          </button>
        )}
      </div>

    </div>
    </div>
  );
};

export default ResultDetails;
