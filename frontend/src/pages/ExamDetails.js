import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamById, getExamQuestions } from '../services/api';
import ImportQuestions from '../components/ImportQuestions';

const ExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImport, setShowImport] = useState(false);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      const [examResponse, questionsResponse] = await Promise.all([
        getExamById(id),
        getExamQuestions(id)
      ]);
      
      setExam(examResponse.data.data);
      setQuestions(questionsResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load exam details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleImportSuccess = () => {
    fetchExamData(); // Refresh questions after import
  };

  if (loading) {
    return (
      <div className="exam-details-page">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ fontSize: '1.5rem', color: '#667eea' }}>Loading...</div>
      </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-details-page">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{
          backgroundColor: '#ffeeee',
          color: '#cc3333',
          padding: '20px',
          borderRadius: '8px'
        }}>
          {error}
        </div>
        <button
          onClick={() => navigate('/exams')}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Back to Exams
        </button>
      </div>
      </div>
    );
  }

  if (!exam) {
    return null;
  }

  return (
    <div className="exam-details-page">
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Exam Info */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0' }}>{exam.title}</h1>
            <p style={{ color: '#666', margin: 0 }}>{exam.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/exams')}
              style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
            {questions.length > 0 && (
              <button
                onClick={() => navigate(`/take-exam/${id}`)}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Take Exam
              </button>
            )}
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginTop: '20px'
        }}>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <strong>Subject:</strong> {exam.subject}
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <strong>Duration:</strong> {exam.duration} mins
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <strong>Total Marks:</strong> {exam.totalMarks}
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <strong>Passing Marks:</strong> {exam.passingMarks}
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0 }}>
            Questions ({questions.length})
          </h2>
          <button
            onClick={() => setShowImport(!showImport)}
            style={{
              padding: '10px 20px',
              background: showImport ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {showImport ? 'Cancel Import' : '+ Import XML'}
          </button>
        </div>

        {questions.length === 0 && !showImport && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            <p>No questions added yet. Import questions from XML file.</p>
          </div>
        )}

        {questions.map((question, index) => (
          <div key={question._id} style={{
            padding: '20px',
            marginBottom: '15px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Q{index + 1}:</strong> {question.questionText}
              <span style={{
                marginLeft: '10px',
                padding: '2px 8px',
                backgroundColor: '#667eea',
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {question.questionType}
              </span>
              <span style={{
                marginLeft: '10px',
                padding: '2px 8px',
                backgroundColor: '#28a745',
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {question.marks} marks
              </span>
            </div>
            
            {question.options && question.options.length > 0 && (
              <div style={{ paddingLeft: '20px' }}>
                {question.options.map((option, i) => (
                  <div key={i} style={{
                    padding: '8px',
                    marginBottom: '5px',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px'
                  }}>
                    {String.fromCharCode(65 + i)}. {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Import Component */}
      {showImport && (
        <ImportQuestions 
          examId={id} 
          onImportSuccess={handleImportSuccess}
        />
      )}
    </div>
    </div>
  );
};

export default ExamDetails;
