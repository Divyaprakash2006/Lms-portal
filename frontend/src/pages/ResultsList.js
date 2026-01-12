import React, {
  useState,
  useEffect,
  useContext,
  useCallback
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getSubmissionsByStudent,
  getAllSubmissions
} from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ResultsList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isTrainer =
    user?.role === 'trainer' || user?.role === 'admin';

  /* ---------------- FETCH RESULTS ---------------- */

  const fetchResults = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      const response = isTrainer
        ? await getAllSubmissions()
        : await getSubmissionsByStudent(user._id);

      const result = response?.data?.data || response?.data || [];
      setSubmissions(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      setError('Unable to load reports');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [user, isTrainer]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  /* ---------------- ACTIONS ---------------- */

  const handleRefresh = () => {
    fetchResults();
  };

  // UI ONLY – does not touch backend
  const handleClearReports = () => {
    setSubmissions([]);
  };

  /* ---------------- UI STATES ---------------- */

  if (loading) {
    return (
      <div className="text-center mt-5">
        <h5 className="text-primary">Loading results...</h5>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container my-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3>
            {isTrainer ? 'All Student Reports' : 'My Exam Reports'}
          </h3>
          <p className="text-muted mb-0">
            Reports are read-only and fetched from server
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={handleRefresh}
          >
            🔄 Refresh
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={handleClearReports}
          >
            🧹 Clear View
          </button>
        </div>
      </div>

      {/* Empty */}
      {submissions.length === 0 ? (
        <div className="alert alert-secondary text-center">
          No reports to display
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                {isTrainer && <th>Student</th>}
                <th>Exam</th>
                <th>Subject</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {submissions.map((s) => {
                const passed =
                  s.score >= s.examId?.passingMarks;

                return (
                  <tr
                    key={s._id}
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      navigate(`/results/${s._id}`)
                    }
                  >
                    {isTrainer && (
                      <td>{s.studentId?.name || 'N/A'}</td>
                    )}
                    <td>{s.examId?.title}</td>
                    <td>{s.examId?.subject}</td>
                    <td>
                      {s.score}/{s.totalMarks}
                    </td>
                    <td>{s.percentage}%</td>
                    <td>
                      <span
                        className={`badge ${
                          passed
                            ? 'bg-success'
                            : 'bg-danger'
                        }`}
                      >
                        {passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td>
                      {new Date(
                        s.submittedAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResultsList;
