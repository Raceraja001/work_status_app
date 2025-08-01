import React, { useState, useEffect } from 'react';

const Reports = ({ selectedBackend }) => {
  const [reportData, setReportData] = useState({
    summary: {},
    trends: [],
    productivity: [],
    clientStats: []
  });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const MYSQL_API_URL = 'http://localhost:3002/api';

  useEffect(() => {
    if (selectedBackend === 'mysql') {
      loadReportData();
    }
  }, [selectedBackend, dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Load basic stats
      const statsRes = await fetch(`${MYSQL_API_URL}/stats`);
      const statsData = await statsRes.json();

      // Load work status data for analysis
      const workStatusRes = await fetch(`${MYSQL_API_URL}/work-status`);
      const workStatusData = await workStatusRes.json();

      if (statsData.success && workStatusData.success) {
        const workEntries = workStatusData.data;
        
        // Calculate productivity metrics
        const productivity = calculateProductivity(workEntries);
        const clientStats = calculateClientStats(workEntries);
        const trends = calculateTrends(workEntries);

        setReportData({
          summary: statsData.data,
          trends,
          productivity,
          clientStats
        });
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProductivity = (entries) => {
    const last30Days = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return entryDate >= thirtyDaysAgo;
    });

    const totalEntries = last30Days.length;
    const completedEntries = last30Days.filter(e => e.status === 'Completed').length;
    const avgTimePerTask = last30Days.reduce((acc, entry) => {
      const timeMatch = entry.time_taken?.match(/(\d+\.?\d*)h/);
      return acc + (timeMatch ? parseFloat(timeMatch[1]) : 0);
    }, 0) / totalEntries || 0;

    return {
      totalTasks: totalEntries,
      completedTasks: completedEntries,
      completionRate: totalEntries > 0 ? (completedEntries / totalEntries * 100).toFixed(1) : 0,
      avgTimePerTask: avgTimePerTask.toFixed(1)
    };
  };

  const calculateClientStats = (entries) => {
    const clientMap = {};
    entries.forEach(entry => {
      const client = entry.client_name || 'Unknown';
      if (!clientMap[client]) {
        clientMap[client] = { count: 0, completed: 0 };
      }
      clientMap[client].count++;
      if (entry.status === 'Completed') {
        clientMap[client].completed++;
      }
    });

    return Object.entries(clientMap)
      .map(([client, stats]) => ({
        client,
        totalTasks: stats.count,
        completedTasks: stats.completed,
        completionRate: (stats.completed / stats.count * 100).toFixed(1)
      }))
      .sort((a, b) => b.totalTasks - a.totalTasks)
      .slice(0, 10);
  };

  const calculateTrends = (entries) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayEntries = entries.filter(e => e.date === dateStr);
      
      last7Days.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        total: dayEntries.length,
        completed: dayEntries.filter(e => e.status === 'Completed').length
      });
    }
    return last7Days;
  };

  if (selectedBackend !== 'mysql') {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: '8px'
      }}>
        <h3>📈 Reports Dashboard</h3>
        <p>Reports are only available with MySQL backend.</p>
        <p>Switch to MySQL backend to access detailed analytics and reporting features.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h2>📈 Reports Dashboard</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label>Date Range:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button
            onClick={loadReportData}
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
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Loading report data...</div>
        </div>
      )}

      {!loading && (
        <>
          {/* Summary Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Total Entries</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1976d2' }}>
                {reportData.summary.total || 0}
              </div>
            </div>
            
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#e8f5e8', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Completion Rate</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2e7d32' }}>
                {reportData.productivity.completionRate || 0}%
              </div>
            </div>
            
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#fff3e0', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>Avg Time/Task</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f57c00' }}>
                {reportData.productivity.avgTimePerTask || 0}h
              </div>
            </div>
            
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#fce4ec', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#c2185b' }}>Tasks (30 days)</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#c2185b' }}>
                {reportData.productivity.totalTasks || 0}
              </div>
            </div>
          </div>

          {/* Trends Chart */}
          <div style={{ 
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3>📊 7-Day Trend</h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'end', 
              gap: '10px',
              height: '200px',
              padding: '20px 0'
            }}>
              {reportData.trends.map((day, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  flex: 1
                }}>
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    <div style={{
                      width: '30px',
                      height: `${Math.max(day.completed * 10, 10)}px`,
                      backgroundColor: '#28a745',
                      borderRadius: '4px 4px 0 0'
                    }}></div>
                    <div style={{
                      width: '30px',
                      height: `${Math.max((day.total - day.completed) * 10, 5)}px`,
                      backgroundColor: '#ffc107',
                      borderRadius: '0 0 4px 4px'
                    }}></div>
                  </div>
                  <div style={{ 
                    marginTop: '10px', 
                    fontSize: '0.8rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: 'bold' }}>{day.day}</div>
                    <div style={{ color: '#6c757d' }}>{day.total}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '20px',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ 
                  width: '15px', 
                  height: '15px', 
                  backgroundColor: '#28a745',
                  borderRadius: '2px'
                }}></div>
                Completed
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ 
                  width: '15px', 
                  height: '15px', 
                  backgroundColor: '#ffc107',
                  borderRadius: '2px'
                }}></div>
                Pending
              </div>
            </div>
          </div>

          {/* Client Statistics */}
          <div style={{ 
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3>👥 Top Clients</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '15px'
            }}>
              {reportData.clientStats.map((client, index) => (
                <div key={index} style={{
                  padding: '15px',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <h4 style={{ margin: '0', color: '#007bff' }}>
                      {client.client}
                    </h4>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      #{index + 1}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                    <div>Total Tasks: <strong>{client.totalTasks}</strong></div>
                    <div>Completed: <strong>{client.completedTasks}</strong></div>
                    <div>Success Rate: <strong>{client.completionRate}%</strong></div>
                  </div>
                  <div style={{ 
                    marginTop: '10px',
                    height: '8px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${client.completionRate}%`,
                      height: '100%',
                      backgroundColor: '#28a745',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;