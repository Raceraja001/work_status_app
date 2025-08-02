import React from 'react';

const Navigation = ({ activeSection, setActiveSection, selectedBackend, mysqlStatus }) => {
  const menuItems = [
    {
      id: 'form',
      label: '📝 Work Status Form',
      description: 'Submit new work status entries'
    },
    {
      id: 'projects',
      label: '📁 Projects',
      description: 'Manage projects and project hierarchy',
      requiresMySQL: true
    },
    {
      id: 'data-viewer',
      label: '📊 Data Viewer',
      description: 'View and manage submitted entries',
      requiresMySQL: true
    },
    {
      id: 'master-data',
      label: '🛠️ Master Data',
      description: 'Manage dropdowns, clients, employees, users',
      requiresMySQL: true
    },
    {
      id: 'reports',
      label: '📈 Reports',
      description: 'Analytics and reporting dashboard',
      requiresMySQL: true
    },
    {
      id: 'settings',
      label: '⚙️ Settings',
      description: 'System configuration and preferences'
    }
  ];

  const isItemDisabled = (item) => {
    return item.requiresMySQL && (selectedBackend !== 'mysql' || mysqlStatus !== 'connected');
  };

  return (
    <nav style={{
      backgroundColor: '#f8f9fa',
      borderBottom: '2px solid #dee2e6',
      padding: '0',
      marginBottom: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px'
      }}>
        {/* Logo/Brand */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '15px 0'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#007bff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            WS
          </div>
          <div>
            <h2 style={{ margin: '0', color: '#007bff', fontSize: '1.5rem' }}>
              Work Status Manager
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
              Backend: {selectedBackend === 'mysql' ? '🗄️ MySQL' : '📊 Google Sheets'}
              {selectedBackend === 'mysql' && (
                <span style={{ 
                  marginLeft: '10px',
                  color: mysqlStatus === 'connected' ? '#28a745' : '#dc3545'
                }}>
                  {mysqlStatus === 'connected' ? '✅ Connected' : '❌ Disconnected'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div style={{
          display: 'flex',
          gap: '5px'
        }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => !isItemDisabled(item) && setActiveSection(item.id)}
              disabled={isItemDisabled(item)}
              style={{
                padding: '12px 16px',
                border: 'none',
                backgroundColor: activeSection === item.id ? '#007bff' : 'transparent',
                color: activeSection === item.id ? 'white' : 
                       isItemDisabled(item) ? '#6c757d' : '#495057',
                borderRadius: '8px',
                cursor: isItemDisabled(item) ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: activeSection === item.id ? '600' : '400',
                transition: 'all 0.2s',
                opacity: isItemDisabled(item) ? 0.5 : 1,
                textAlign: 'center',
                minWidth: '120px'
              }}
              title={isItemDisabled(item) ? 'Requires MySQL backend' : item.description}
            >
              <div>{item.label}</div>
              {isItemDisabled(item) && (
                <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                  (MySQL only)
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;