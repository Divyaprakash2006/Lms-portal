import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllReports } from '../services/api';
import * as XLSX from 'xlsx';
import './CreateExam.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  /* ================= AUTH ================= */
  useEffect(() => {
  if (user?.role !== 'trainer') {
    navigate('/student-dashboard');
  } else {
    fetchReports();
  }
}, [user, navigate]);


  /* ================= FETCH ================= */
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getAllReports();
      const data = res.data?.data || res.data || [];
      setReports(data);
    } catch (err) {
      alert('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER (FIXED ORDER) ================= */
  const filterReports = useCallback(() => {
    let data = [...reports];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(r =>
        (r.studentId?.name || '').toLowerCase().includes(term) ||
        (r.studentId?.email || '').toLowerCase().includes(term) ||
        (r.examId?.title || '').toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      data = data.filter(r => r.status === statusFilter);
    }

    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredReports(data);
    setCurrentPage(1);
  }, [reports, searchTerm, statusFilter]);

  useEffect(() => {
    filterReports();
  }, [filterReports]);

  /* ================= HELPERS ================= */
  const formatDate = (d) =>
    d ? new Date(d).toLocaleString() : 'N/A';

  const timeTaken = (start, end) => {
    if (!start || !end) return 'N/A';
    const sec = Math.floor((new Date(end) - new Date(start)) / 1000);
    return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  };

  /* ================= EXCEL DOWNLOAD ================= */
  const handleDownloadExcel = () => {
    if (!filteredReports.length) {
      alert('No data to export');
      return;
    }

    setIsDownloading(true);

    setTimeout(() => {
      try {
        // Prepare data for Excel export
        const excelData = filteredReports.map((r, i) => ({
          'No': i + 1,
          'Student Name': r.studentId?.name || 'N/A',
          'Student Email': r.studentId?.email || 'N/A',
          'Exam Title': r.examId?.title || 'N/A',
          'Score': `${r.score || 0}/${r.totalMarks || 0}`,
          'Percentage': `${(r.percentage || 0).toFixed(2)}%`,
          'Status': r.status === 'pass' ? 'Pass' : 'Fail',
          'Time Taken': timeTaken(r.startedAt, r.submittedAt),
          'Submitted At': formatDate(r.submittedAt),
        }));

        // Create worksheet from data
        const ws = XLSX.utils.json_to_sheet(excelData);
        
        // Set column widths for better formatting
        ws['!cols'] = [
          { wch: 5 },   // No
          { wch: 20 },  // Student Name
          { wch: 25 },  // Student Email
          { wch: 30 },  // Exam Title
          { wch: 12 },  // Score
          { wch: 12 },  // Percentage
          { wch: 10 },  // Status
          { wch: 15 },  // Time Taken
          { wch: 20 },  // Submitted At
        ];

        // Create workbook and add worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Student Reports');

        // Generate filename with current date
        const fileName = `Student_Reports_${new Date().toISOString().slice(0, 10)}.xlsx`;

        // Convert workbook to array buffer
        const wbout = XLSX.write(wb, { 
          bookType: 'xlsx', 
          type: 'array',
          bookSST: false 
        });
        
        // Create Blob with proper MIME type
        const blob = new Blob([wbout], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
        });
        
        // Create download link and trigger download
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        // Append to body, click, and cleanup
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);

        console.log('Excel file downloaded:', fileName);
        alert('Excel file downloaded successfully!');
      } catch (err) {
        console.error('Excel download error:', err);
        alert('Excel download failed: ' + err.message);
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  };

  /* ================= ACTIONS ================= */
  const handleRefresh = () => {
    fetchReports();
  };

  // UI ONLY – does not touch backend
  const handleClearReports = () => {
    setReports([]);
    setFilteredReports([]);
  };

  /* ================= PAGINATION ================= */
  const start = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredReports.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  /* ================= UI ================= */
  return (
    <div className="container py-5">
      <h2 className="mb-4">Trainer Dashboard</h2>

      <div className="row mb-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pass">Passed</option>
            <option value="fail">Failed</option>
          </select>
        </div>

        <div className="col-md-5 text-end">
          <button
            className="btn btn-outline-primary me-2"
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </button>
          <button
            className="btn btn-outline-secondary me-2"
            onClick={handleClearReports}
          >
             Clear View
          </button>
          <button
            className="btn btn-success"
            onClick={handleDownloadExcel}
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download Excel'}
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <>
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Exam</th>
                <th>Score</th>
                <th>%</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length ? (
                currentItems.map((r, i) => (
                  <tr key={r._id}>
                    <td>{start + i + 1}</td>
                    <td>{r.studentId?.name}</td>
                    <td>{r.examId?.title}</td>
                    <td>{r.score}/{r.totalMarks}</td>
                    <td>{r.percentage?.toFixed(1)}%</td>
                    <td>
                      <span className={`badge ${r.status === 'pass' ? 'bg-success' : 'bg-danger'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{formatDate(r.submittedAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="d-flex justify-content-between">
            <div>
              Page {currentPage} of {totalPages || 1}
            </div>
            <div>
              <button
                className="btn btn-sm btn-outline-primary me-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Prev
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
