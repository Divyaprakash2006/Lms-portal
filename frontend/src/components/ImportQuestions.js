import React, { useState } from 'react';
import { importQuestionsFromXML, previewQuestionsFromXML } from '../services/api';

const ImportQuestions = ({ examId, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xml')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select an XML file');
        setFile(null);
      }
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setPreview(null);

    try {
      const response = await previewQuestionsFromXML(examId, file);
      setPreview(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to preview questions');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await importQuestionsFromXML(examId, file);
      const results = response.data.data;
      
      setSuccess(`Successfully imported ${results.success} out of ${results.total} questions`);
      
      if (results.failed > 0) {
        setError(`${results.failed} questions failed to import. Check console for details.`);
        console.error('Import errors:', results.errors);
      }
      
      setFile(null);
      setPreview(null);
      
      if (onImportSuccess) {
        onImportSuccess(results);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import questions');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question, index) => {
    if (question.error) {
      return (
        <div key={index} style={{
          padding: '15px',
          marginBottom: '10px',
          backgroundColor: '#ffeeee',
          border: '1px solid #ffcccc',
          borderRadius: '8px'
        }}>
          <strong>Error:</strong> {question.message}
          <br />
          <small>Question: {question.questionName}</small>
        </div>
      );
    }

    return (
      <div key={index} style={{
        padding: '15px',
        marginBottom: '10px',
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
                padding: '5px',
                backgroundColor: option === question.correctAnswer ? '#d4edda' : 'transparent',
                borderRadius: '4px',
                marginBottom: '5px'
              }}>
                {String.fromCharCode(65 + i)}. {option}
                {option === question.correctAnswer && (
                  <span style={{ marginLeft: '10px', color: '#28a745', fontWeight: 'bold' }}>
                    ✓ Correct
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
      marginTop: '20px'
    }}>
      <h2 style={{ marginBottom: '20px' }}>Import Questions from XML</h2>

      {error && (
        <div style={{
          backgroundColor: '#ffeeee',
          color: '#cc3333',
          padding: '12px 20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '12px 20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {success}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '500' 
        }}>
          Select Moodle XML File
        </label>
        <input
          type="file"
          accept=".xml"
          onChange={handleFileChange}
          style={{
            width: '100%',
            padding: '12px 15px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
        {file && (
          <small style={{ color: '#28a745', marginTop: '5px', display: 'block' }}>
            Selected: {file.name}
          </small>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px' 
      }}>
        <button
          onClick={handlePreview}
          disabled={loading || !file}
          style={{
            flex: 1,
            padding: '12px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading || !file ? 'not-allowed' : 'pointer',
            opacity: loading || !file ? 0.6 : 1
          }}
        >
          {loading ? 'Processing...' : 'Preview Questions'}
        </button>

        <button
          onClick={handleImport}
          disabled={loading || !file}
          style={{
            flex: 1,
            padding: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading || !file ? 'not-allowed' : 'pointer',
            opacity: loading || !file ? 0.6 : 1
          }}
        >
          {loading ? 'Importing...' : 'Import Questions'}
        </button>
      </div>

      {preview && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '15px' }}>
            Preview ({preview.total} questions)
          </h3>
          <div style={{ 
            maxHeight: '500px', 
            overflowY: 'auto',
            padding: '10px'
          }}>
            {preview.questions.map((question, index) => renderQuestion(question, index))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportQuestions;
