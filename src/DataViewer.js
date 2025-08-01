import React, { useState, useEffect } from 'react';

const DataViewer = ({ selectedBackend }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const MYSQL_API_URL = 'http://localhost:3002/api/work-status';

  useEffect(() => {
    if (selectedBackend === 'mysql') {
      fetchData();
      fetchStats();
    }
  }, [selectedBackend]);

  const fetchData = async () => {
    if (selectedBackend !== 'mysql') return;
    
    setLoading(true);
    try {
      const response = await fetch(MYSQL_API_URL);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setError('');
      } else {
        setError('Failed to fetch data: ' + result.error);
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (selectedBackend !== 'mysql') return;
    
    try {
      const response = await fetch('http://localhost:3002/api/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const deleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      const response = await fetch(`${MYSQL_API_URL}/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setData(data.filter(item => item.id !== id));
        fetchStats(); // Refresh stats
      } else {
        alert('Failed to delete entry: ' + result.error);
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  if (selectedBackend !== 'mysql') {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h3>📊 Data Viewer</h3>
        <p>Select MySQL backend to view and manage your data entries.</p>
      </div>
    );
  }

  return (
    <div style={{ margin: '20px 0' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3>📊 MySQL Data Viewer</h3>
        <button 
          onClick={fetchData}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#1976d2' }}>Total Entries</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
              {stats.total}
            </div>
          </div>
          
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#e8f5e8', 
            borderRadius: '8px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>By Status</h4>
            {stats.byStatus.map(item => (
              <div key={item.status} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '0.9rem'
              }}>
                <span>{item.status || 'Unknown'}</span>
                <span style={{ fontWeight: 'bold' }}>{item.count}</span>
              </div>
            ))}
          </div>
          
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#fff3e0', 
            borderRadius: '8px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>By Module</h4>
            {stats.byModule.map(item => (
              <div key={item.module} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '0.9rem'
              }}>
                <span>{item.module || 'Unknown'}</span>
                <span style={{ fontWeight: 'bold' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Data Table */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          overflowX: 'auto',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '0.9rem'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>ID</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Date</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Task Type</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Client</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Time</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    color: '#6c757d'
                  }}>
                    {loading ? 'Loading data...' : 'No data found'}
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px 8px' }}>{item.id}</td>
                    <td style={{ padding: '12px 8px' }}>{new Date(item.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 8px' }}>{item.task_type}</td>
                    <td style={{ padding: '12px 8px' }}>{item.client_name}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        backgroundColor: 
                          item.status === 'Completed' ? '#d4edda' :
                          item.status === 'In Progress' ? '#fff3cd' :
                          item.status === 'On Hold' ? '#f8d7da' : '#e2e3e5',
                        color:
                          item.status === 'Completed' ? '#155724' :
                          item.status === 'In Progress' ? '#856404' :
                          item.status === 'On Hold' ? '#721c24' : '#495057'
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>{item.time_taken}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <button
                        onClick={() => deleteEntry(item.id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataViewer;