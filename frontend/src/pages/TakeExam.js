import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamById, getExamQuestions, submitExam } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

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
      setError(err.response?.data?.message || 'Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (exam && !startTime) {
      setStartTime(Date.now());
      setTimeLeft(exam.duration * 60); // Convert minutes to seconds
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit(true); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && !window.confirm('Are you sure you want to submit the exam?')) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000 / 60); // in minutes

      const submissionData = {
        examId: id,
        studentId: user._id,
        answers: Object.keys(answers).map(questionId => ({
          questionId,
          answer: answers[questionId]
        })),
        timeTaken
      };

      const response = await submitExam(submissionData);
      
      // Immediately navigate to results page with complete submission data
      navigate(`/results/${response.data.data._id}`, {
        state: { submissionData: response.data.data },
        replace: true // Replace exam page in history so user can't go back
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit exam');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="take-exam-page">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ fontSize: '1.5rem', color: '#667eea' }}>Loading exam...</div>
      </div>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className="take-exam-page">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{
          backgroundColor: '#ffeeee',
          color: '#cc3333',
          padding: '20px',
          borderRadius: '8px'
        }}>
          {error}
        </div>
      </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="take-exam-page">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          No questions available for this exam.
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="take-exam-page">
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Exam Header */}
      <div style={{
        background: 'white',
        padding: '20px 30px',
        borderRadius: '15px',
        
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: '70px',
        zIndex: 100
      }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0' }}>{exam.title}</h2>
          <p style={{ margin: 0, color: '#666' }}>
            {questions.length} Questions • {exam.totalMarks} Marks
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: timeLeft < 300 ? '#dc3545' : '#667eea'
          }}>
             {formatTime(timeLeft)}
          </div>
          <small style={{ color: '#666' }}>Time Remaining</small>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#ffeeee',
          color: '#cc3333',
          padding: '15px 20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Questions */}
      {questions.map((question, index) => (
        <div key={question._id} style={{
          background: 'white',
          padding: '30px',
          borderRadius: '15px',
          
          marginBottom: '20px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{
              display: 'inline-block',
              padding: '5px 12px',
              background: '#667eea',
              color: 'white',
              borderRadius: '20px',
              fontSize: '14px',
              marginRight: '10px'
            }}>
              Question {index + 1}
            </span>
            <span style={{
              display: 'inline-block',
              padding: '5px 12px',
              background: '#28a745',
              color: 'white',
              borderRadius: '20px',
              fontSize: '14px'
            }}>
              {question.marks} marks
            </span>
          </div>

          <h3 style={{ 
            fontSize: '1.2rem', 
            marginBottom: '20px',
            lineHeight: '1.6'
          }}>
            {question.questionText}
          </h3>

          {question.questionType === 'mcq' || question.questionType === 'true-false' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {question.options.map((option, optIndex) => {
                const isSelected = answers[question._id] === option;
                return (
                  <label 
                    key={optIndex} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 20px',
                      background: isSelected ? '#f0f4ff' : '#f8f9fa',
                      border: isSelected ? '2px solid #667eea' : '2px solid #e0e0e0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(102, 126, 234, 0.2)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#f0f0f0';
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#f8f9fa';
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      width: '24px',
                      height: '24px',
                      marginRight: '15px',
                      flexShrink: 0
                    }}>
                      <input
                        type="radio"
                        name={`question-${question._id}`}
                        value={option}
                        checked={isSelected}
                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                        style={{
                          position: 'absolute',
                          opacity: 0,
                          width: '100%',
                          height: '100%',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: isSelected ? '2px solid #667eea' : '2px solid #999',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                      }}>
                        {isSelected && (
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: '#667eea'
                          }} />
                        )}
                      </div>
                    </div>
                    
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      marginRight: '12px',
                      background: isSelected ? '#667eea' : '#e0e0e0',
                      color: isSelected ? 'white' : '#666',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '14px',
                      minWidth: '32px',
                      textAlign: 'center'
                    }}>
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    
                    <span style={{ 
                      flex: 1,
                      fontSize: '16px',
                      color: isSelected ? '#333' : '#555',
                      fontWeight: isSelected ? '500' : '400'
                    }}>
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <textarea
              value={answers[question._id] || ''}
              onChange={(e) => handleAnswerChange(question._id, e.target.value)}
              placeholder="Type your answer here..."
              rows="4"
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          )}
        </div>
      ))}

      {/* Submit Button */}
      <div style={{
        background: 'white',
        padding: '20px 30px',
        borderRadius: '15px',
      
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '15px', color: '#666' }}>
          Answered: {Object.keys(answers).length} / {questions.length} questions
        </p>
        <button
          onClick={() => handleSubmit(false)}
          disabled={submitting || Object.keys(answers).length === 0}
          style={{
            padding: '15px 50px',
            background: submitting ? '#6c757d' : 'linear-gradient(135deg, #fff 0%, #fff 100%)',
            color: 'black',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: submitting || Object.keys(answers).length === 0 ? 'not-allowed' : 'pointer',
            opacity: submitting || Object.keys(answers).length === 0 ? 0.6 : 1
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>
    </div>
    </div>
  );
};

export default TakeExam;
