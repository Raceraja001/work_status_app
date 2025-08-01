import React, { useState } from 'react';

const Settings = ({ selectedBackend, setSelectedBackend, mysqlStatus, checkMysqlStatus }) => {
  const [settings, setSettings] = useState({
    autoSave: true,
    notifications: true,
    theme: 'light',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    defaultAssignee: '',
    defaultClient: '',
    autoFillEnabled: true
  });

  const [exportSettings, setExportSettings] = useState({
    format: 'json',
    includeInactive: false,
    dateRange: 'all'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // In a real app, you'd save this to localStorage or backend
    localStorage.setItem('workStatusSettings', JSON.stringify({ ...settings, [key]: value }));
  };

  const exportData = async () => {
    if (selectedBackend !== 'mysql') {
      alert('Export is only available with MySQL backend');
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/api/work-status');
      const result = await response.json();
      
      if (result.success) {
        const data = result.data;
        const filename = `work-status-export-${new Date().toISOString().split('T')[0]}`;
        
        if (exportSettings.format === 'json') {
          const dataStr = JSON.stringify(data, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.json`;
          link.click();
          URL.revokeObjectURL(url);
        } else if (exportSettings.format === 'csv') {
          const headers = Object.keys(data[0] || {});
          const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
          ].join('\n');
          
          const dataBlob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.csv`;
          link.click();
          URL.revokeObjectURL(url);
        }
        
        alert('Data exported successfully!');
      }
    } catch (error) {
      alert('Export failed: ' + error.message);
    }
  };

  const clearAllData = async () => {
    if (selectedBackend !== 'mysql') {
      alert('This operation is only available with MySQL backend');
      return;
    }

    const confirmation = window.prompt(
      'This will delete ALL work status data. Type "DELETE ALL" to confirm:'
    );
    
    if (confirmation !== 'DELETE ALL') {
      alert('Operation cancelled');
      return;
    }

    try {
      // This would need a special endpoint for bulk delete
      alert('Bulk delete functionality would be implemented here');
    } catch (error) {
      alert('Delete failed: ' + error.message);
    }
  };

  return (
    <div>
      <h2>⚙️ Settings</h2>
      
      {/* Backend Configuration */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>🔧 Backend Configuration</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Select Backend:
          </label>
          <div style={{ display: 'flex', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                name="backend"
                value="sheets"
                checked={selectedBackend === 'sheets'}
                onChange={(e) => setSelectedBackend(e.target.value)}
              />
              <span>📊 Google Sheets</span>
              <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                (Simple, no setup required)
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                name="backend"
                value="mysql"
                checked={selectedBackend === 'mysql'}
                onChange={(e) => setSelectedBackend(e.target.value)}
              />
              <span>🗄️ MySQL Database</span>
              <span style={{ 
                fontSize: '0.8rem',
                color: mysqlStatus === 'connected' ? '#28a745' : '#dc3545'
              }}>
                ({mysqlStatus === 'connected' ? '✅ Connected' : '❌ Disconnected'})
              </span>
            </label>
          </div>
        </div>

        {selectedBackend === 'mysql' && (
          <div style={{ 
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h4>MySQL Connection Status</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span>Status: </span>
              <span style={{ 
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                backgroundColor: mysqlStatus === 'connected' ? '#d4edda' : '#f8d7da',
                color: mysqlStatus === 'connected' ? '#155724' : '#721c24'
              }}>
                {mysqlStatus === 'connected' ? '✅ Connected' : '❌ Disconnected'}
              </span>
            </div>
            <button
              onClick={checkMysqlStatus}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Test Connection
            </button>
          </div>
        )}
      </div>

      {/* Application Settings */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>🎛️ Application Settings</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
              />
              <span>Auto-save drafts</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              />
              <span>Enable notifications</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={settings.autoFillEnabled}
                onChange={(e) => handleSettingChange('autoFillEnabled', e.target.checked)}
              />
              <span>Enable smart auto-fill</span>
            </label>
          </div>
          
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Date Format:
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Time Format:
              </label>
              <select
                value={settings.timeFormat}
                onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="24h">24 Hour (14:30)</option>
                <option value="12h">12 Hour (2:30 PM)</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Theme:
              </label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>💾 Data Management</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <h4>Export Data</h4>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Format:</label>
              <select
                value={exportSettings.format}
                onChange={(e) => setExportSettings({...exportSettings, format: e.target.value})}
                style={{ 
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <input
                type="checkbox"
                checked={exportSettings.includeInactive}
                onChange={(e) => setExportSettings({...exportSettings, includeInactive: e.target.checked})}
              />
              <span>Include inactive records</span>
            </label>
            
            <button
              onClick={exportData}
              disabled={selectedBackend !== 'mysql'}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedBackend === 'mysql' ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: selectedBackend === 'mysql' ? 'pointer' : 'not-allowed',
                width: '100%'
              }}
            >
              📥 Export Data
            </button>
          </div>
          
          <div>
            <h4 style={{ color: '#dc3545' }}>⚠️ Danger Zone</h4>
            <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '15px' }}>
              These actions cannot be undone. Please be careful.
            </p>
            
            <button
              onClick={clearAllData}
              disabled={selectedBackend !== 'mysql'}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedBackend === 'mysql' ? '#dc3545' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: selectedBackend === 'mysql' ? 'pointer' : 'not-allowed',
                width: '100%',
                marginBottom: '10px'
              }}
            >
              🗑️ Clear All Data
            </button>
            
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#6c757d',
              fontStyle: 'italic'
            }}>
              {selectedBackend !== 'mysql' && 'MySQL backend required'}
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>ℹ️ System Information</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px',
          fontSize: '0.9rem'
        }}>
          <div>
            <strong>Application Version:</strong> 1.0.0
          </div>
          <div>
            <strong>Backend:</strong> {selectedBackend === 'mysql' ? 'MySQL Database' : 'Google Sheets'}
          </div>
          <div>
            <strong>Connection Status:</strong> 
            <span style={{ 
              color: selectedBackend === 'mysql' ? 
                (mysqlStatus === 'connected' ? '#28a745' : '#dc3545') : '#28a745'
            }}>
              {selectedBackend === 'mysql' ? 
                (mysqlStatus === 'connected' ? ' Connected' : ' Disconnected') : ' Active'}
            </span>
          </div>
          <div>
            <strong>Last Updated:</strong> {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;