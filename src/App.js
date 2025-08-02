import React, { useState, useEffect } from 'react';
import './App.css';
import Navigation from './Navigation';
import DataViewer from './DataViewer';
import MasterDataManager from './MasterDataManager';
import Reports from './Reports';
import Settings from './Settings';
import ProjectManager from './ProjectManager';

// Backend URLs
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby7DNtVHS4FcuktaaWxPlc8HUbX4X7WldtFqpjeYD6l__Ikxq3QCe1zOJ1B4nmyX3XrWg/exec';
const MYSQL_API_URL = 'http://localhost:3002/api/work-status';

// Default test values function
const getDefaultFormData = () => ({
  DATE: new Date().toISOString().split('T')[0],
  'TIME SHEET STATUS': 'Completed',
  'TASK TYPE': 'Development',
  'REQ TYPE': 'Feature Request',
  'CLIENT NAME': 'Test Client Inc.',
  'ZOHO TASK TITLE': 'Implement Google Sheets Integration',
  'ZOHO TASK LINK': 'https://projects.zoho.com/portal/testproject#taskdetail/123456789',
  'TASK DESCRIPTION': 'Create form submission functionality to update Google Sheets automatically',
  STATUS: 'In Progress',
  'TIME TAKEN': '2.5 hours',
  MODULE: 'Frontend',
  'SUB MODULE': 'Form Handling',
  TYPE: 'Enhancement',
  'ASSIGNED TO': 'John Doe',
  'START TIME': '09:00',
  'END TIME': '11:30',
  NARRATION: 'Successfully implemented JSONP-based form submission to bypass CORS issues',
  'FIX DESCRIPTION': 'Replaced fetch API with JSONP approach for seamless Google Apps Script integration',
});

const App = () => {
  const [formData, setFormData] = useState({
    DATE: new Date().toISOString().split('T')[0],
    'TIME SHEET STATUS': '',
    'TASK TYPE': '',
    'REQ TYPE': '',
    'CLIENT NAME': '',
    'ZOHO TASK TITLE': '',
    'ZOHO TASK LINK': '',
    'TASK DESCRIPTION': '',
    STATUS: '',
    'TIME TAKEN': '',
    MODULE: '',
    'SUB MODULE': '',
    TYPE: '',
    'ASSIGNED TO': '',
    'START TIME': '',
    'END TIME': '',
    NARRATION: '',
    'FIX DESCRIPTION': '',
  });

  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedBackend, setSelectedBackend] = useState('sheets'); // 'sheets' or 'mysql'
  const [mysqlStatus, setMysqlStatus] = useState('unknown'); // 'connected', 'disconnected', 'unknown'
  const [activeSection, setActiveSection] = useState('form'); // 'form', 'data-viewer', 'master-data', 'reports', 'settings'
  const [masterData, setMasterData] = useState({
    dropdowns: {},
    clients: [],
    employees: []
  });
  const [loadingMasters, setLoadingMasters] = useState(false);

  // Calculate form completion percentage
  const getFormCompletionPercentage = () => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(value => value.trim() !== '').length;
    return Math.round((filledFields / totalFields) * 100);
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    // Required field validation
    Object.keys(formData).forEach(key => {
      if (!formData[key].trim()) {
        errors[key] = `${key} is required`;
      }
    });

    // URL validation for Zoho link
    if (formData['ZOHO TASK LINK'] && !formData['ZOHO TASK LINK'].startsWith('http')) {
      errors['ZOHO TASK LINK'] = 'Please enter a valid URL';
    }

    // Time validation
    if (formData['START TIME'] && formData['END TIME']) {
      const start = new Date(`2000-01-01 ${formData['START TIME']}`);
      const end = new Date(`2000-01-01 ${formData['END TIME']}`);
      if (end <= start) {
        errors['END TIME'] = 'End time must be after start time';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Load saved draft on component mount and check MySQL status
  useEffect(() => {
    const savedDraft = localStorage.getItem('workStatusDraft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(parsedDraft);
        setStatusMessage('📝 Draft loaded from previous session');
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }

    // Check MySQL backend status
    checkMysqlStatus();
  }, []);

  const checkMysqlStatus = async () => {
    try {
      const response = await fetch('http://localhost:3002/health');
      if (response.ok) {
        setMysqlStatus('connected');
        // Load master data when MySQL is connected
        if (selectedBackend === 'mysql') {
          loadMasterData();
        }
      } else {
        setMysqlStatus('disconnected');
      }
    } catch (error) {
      setMysqlStatus('disconnected');
    }
  };

  const loadMasterData = async () => {
    if (selectedBackend !== 'mysql') return;

    setLoadingMasters(true);
    try {
      // Load all master data in parallel
      const [dropdownsRes, clientsRes, employeesRes] = await Promise.all([
        fetch('http://localhost:3002/api/masters/dropdowns'),
        fetch('http://localhost:3002/api/masters/clients'),
        fetch('http://localhost:3002/api/masters/employees')
      ]);

      const [dropdownsData, clientsData, employeesData] = await Promise.all([
        dropdownsRes.json(),
        clientsRes.json(),
        employeesRes.json()
      ]);

      setMasterData({
        dropdowns: dropdownsData.success ? dropdownsData.data : {},
        clients: clientsData.success ? clientsData.data : [],
        employees: employeesData.success ? employeesData.data : []
      });
    } catch (error) {
      console.error('Error loading master data:', error);
    } finally {
      setLoadingMasters(false);
    }
  };

  // Save draft to localStorage whenever form data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('workStatusDraft', JSON.stringify(formData));
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            if (!isSubmitting) {
              document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
            break;
          case 'r':
            e.preventDefault();
            clearValues();
            break;
          case 't':
            e.preventDefault();
            loadTestValues();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    // Smart auto-fill logic
    if (name === 'TASK TYPE') {
      // Auto-suggest module based on task type
      if (value === 'Development') updatedData['MODULE'] = 'Frontend';
      if (value === 'Testing') updatedData['MODULE'] = 'QA';
      if (value === 'Bug Fix') updatedData['STATUS'] = 'In Progress';
    }

    if (name === 'REQ TYPE') {
      // Auto-suggest type based on request type
      if (value === 'Bug Report') updatedData['TYPE'] = 'Bug Fix';
      if (value === 'Feature Request') updatedData['TYPE'] = 'New Feature';
      if (value === 'Enhancement') updatedData['TYPE'] = 'Enhancement';
    }

    // Auto-calculate time taken when start and end times are provided
    if (name === 'START TIME' || name === 'END TIME') {
      const startTime = name === 'START TIME' ? value : formData['START TIME'];
      const endTime = name === 'END TIME' ? value : formData['END TIME'];

      if (startTime && endTime) {
        const start = new Date(`2000-01-01 ${startTime}`);
        const end = new Date(`2000-01-01 ${endTime}`);
        const diffMs = end - start;

        if (diffMs > 0) {
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          updatedData['TIME TAKEN'] = `${hours}h ${minutes}m`;
        }
      }
    }

    // Auto-generate task title if client and task type are filled
    if ((name === 'CLIENT NAME' || name === 'TASK TYPE') && !formData['ZOHO TASK TITLE']) {
      const client = name === 'CLIENT NAME' ? value : formData['CLIENT NAME'];
      const taskType = name === 'TASK TYPE' ? value : formData['TASK TYPE'];
      if (client && taskType) {
        updatedData['ZOHO TASK TITLE'] = `${taskType} for ${client}`;
      }
    }

    setFormData(updatedData);
  };

  const loadTestValues = () => {
    setFormData(getDefaultFormData());
    localStorage.removeItem('workStatusDraft');
    setStatusMessage('✅ Test values loaded');
  };

  const clearValues = () => {
    setFormData({
      DATE: new Date().toISOString().split('T')[0],
      'TIME SHEET STATUS': '',
      'TASK TYPE': '',
      'REQ TYPE': '',
      'CLIENT NAME': '',
      'ZOHO TASK TITLE': '',
      'ZOHO TASK LINK': '',
      'TASK DESCRIPTION': '',
      STATUS: '',
      'TIME TAKEN': '',
      MODULE: '',
      'SUB MODULE': '',
      TYPE: '',
      'ASSIGNED TO': '',
      'START TIME': '',
      'END TIME': '',
      NARRATION: '',
      'FIX DESCRIPTION': '',
    });
    localStorage.removeItem('workStatusDraft');
    setValidationErrors({});
    setStatusMessage('🗑️ Form cleared');
  };

  // Quick templates for common tasks
  const loadTemplate = (templateType) => {
    const templates = {
      'bug-fix': {
        'TASK TYPE': 'Bug Fix',
        'REQ TYPE': 'Bug Report',
        'STATUS': 'In Progress',
        'MODULE': 'Frontend',
        'TYPE': 'Bug Fix',
        'TASK DESCRIPTION': 'Fixed issue with...',
      },
      'feature': {
        'TASK TYPE': 'Development',
        'REQ TYPE': 'Feature Request',
        'STATUS': 'In Progress',
        'MODULE': 'Frontend',
        'TYPE': 'New Feature',
        'TASK DESCRIPTION': 'Implemented new feature for...',
      },
      'meeting': {
        'TASK TYPE': 'Meeting',
        'REQ TYPE': 'Support',
        'STATUS': 'Completed',
        'TIME TAKEN': '1h 0m',
        'TASK DESCRIPTION': 'Attended meeting regarding...',
      }
    };

    setFormData(prev => ({ ...prev, ...templates[templateType] }));
    setStatusMessage(`📋 ${templateType.replace('-', ' ')} template loaded`);
  };

  const exportFormData = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `work-status-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFormData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          setFormData(importedData);
          setStatusMessage('✅ Form data imported successfully');
        } catch (error) {
          setStatusMessage('❌ Error importing file: Invalid JSON format');
        }
      };
      reader.readAsText(file);
    }
  };

  // Submit to Google Sheets
  const submitToSheets = () => {
    // Convert form data to URL parameters (replacing spaces with underscores for Apps Script)
    const params = new URLSearchParams();
    Object.keys(formData).forEach(key => {
      const paramKey = key.replace(/\s+/g, '_'); // Replace spaces with underscores
      params.append(paramKey, formData[key]);
    });

    // Create unique callback name
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());

    // Add callback parameter
    params.append('callback', callbackName);

    // Create script element for JSONP
    const script = document.createElement('script');
    const url = `${APPS_SCRIPT_URL}?${params.toString()}`;

    // Define callback function
    window[callbackName] = (result) => {
      if (result.success) {
        setStatusMessage('✅ Form submitted successfully! Data added to Google Sheets.');
        clearFormAfterSubmission();
      } else {
        setStatusMessage('❌ Error submitting to Google Sheets: ' + (result.error || 'Unknown error occurred'));
      }

      // Cleanup
      document.head.removeChild(script);
      delete window[callbackName];
      setIsSubmitting(false);
    };

    // Handle errors
    script.onerror = () => {
      console.error('Script failed to load:', url);
      setStatusMessage('❌ Network error occurred. Check console for details.');
      document.head.removeChild(script);
      delete window[callbackName];
      setIsSubmitting(false);
    };

    console.log('Making request to Google Sheets:', url);
    script.src = url;
    document.head.appendChild(script);
  };

  // Submit to MySQL
  const submitToMySQL = async () => {
    try {
      const response = await fetch(MYSQL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setStatusMessage('✅ Form submitted successfully! Data saved to MySQL database.');
        clearFormAfterSubmission();
      } else {
        setStatusMessage('❌ Error submitting to MySQL: ' + (result.error || 'Unknown error occurred'));
      }
    } catch (error) {
      console.error('MySQL submission error:', error);
      setStatusMessage('❌ Network error connecting to MySQL: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear form after successful submission
  const clearFormAfterSubmission = () => {
    localStorage.removeItem('workStatusDraft');
    setFormData({
      DATE: new Date().toISOString().split('T')[0],
      'TIME SHEET STATUS': '',
      'TASK TYPE': '',
      'REQ TYPE': '',
      'CLIENT NAME': '',
      'ZOHO TASK TITLE': '',
      'ZOHO TASK LINK': '',
      'TASK DESCRIPTION': '',
      STATUS: '',
      'TIME TAKEN': '',
      MODULE: '',
      'SUB MODULE': '',
      TYPE: '',
      'ASSIGNED TO': '',
      'START TIME': '',
      'END TIME': '',
      NARRATION: '',
      'FIX DESCRIPTION': '',
    });

    // Auto-hide success message after 5 seconds
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      setStatusMessage('❌ Please fix the errors below');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('⏳ Submitting...');

    // Submit to selected backend
    if (selectedBackend === 'sheets') {
      submitToSheets();
    } else {
      submitToMySQL();
    }
  };

  // Define dropdown options for better UX (fallback for Google Sheets)
  const staticDropdownOptions = {
    'TIME SHEET STATUS': ['Pending', 'Completed', 'In Review', 'Approved'],
    'TASK TYPE': ['Development', 'Testing', 'Bug Fix', 'Documentation', 'Meeting', 'Research'],
    'REQ TYPE': ['Feature Request', 'Bug Report', 'Enhancement', 'Maintenance', 'Support'],
    STATUS: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
    MODULE: ['Frontend', 'Backend', 'Database', 'API', 'UI/UX', 'DevOps'],
    TYPE: ['Enhancement', 'Bug Fix', 'New Feature', 'Refactoring', 'Documentation']
  };

  // Get dropdown options based on selected backend
  const getDropdownOptions = (fieldKey) => {
    if (selectedBackend === 'mysql' && masterData.dropdowns[fieldKey]) {
      return masterData.dropdowns[fieldKey];
    }
    return staticDropdownOptions[fieldKey] || [];
  };

  // Get client options
  const getClientOptions = () => {
    if (selectedBackend === 'mysql') {
      return masterData.clients;
    }
    return []; // For Google Sheets, use text input
  };

  // Get employee options
  const getEmployeeOptions = () => {
    if (selectedBackend === 'mysql') {
      return masterData.employees;
    }
    return []; // For Google Sheets, use text input
  };

  const renderFormField = (key) => {
    const dropdownOptions = getDropdownOptions(key);
    const isDropdown = dropdownOptions.length > 0;
    const isClientField = key === 'CLIENT NAME';
    const isEmployeeField = key === 'ASSIGNED TO';
    const isTextarea = ['TASK DESCRIPTION', 'NARRATION', 'FIX DESCRIPTION'].includes(key);
    const isTime = ['START TIME', 'END TIME'].includes(key);
    const isUrl = key === 'ZOHO TASK LINK';
    const hasError = validationErrors[key];

    const fieldStyle = {
      borderColor: hasError ? '#dc3545' : formData[key] ? '#28a745' : '#ddd'
    };

    // Client dropdown for MySQL backend
    if (isClientField && selectedBackend === 'mysql') {
      const clientOptions = getClientOptions();
      return (
        <>
          <select
            name={key}
            value={formData[key]}
            onChange={handleChange}
            style={fieldStyle}
            required
          >
            <option value="">Select Client</option>
            {clientOptions.map(client => (
              <option key={client.id} value={client.client_name}>
                {client.client_name} ({client.client_code})
              </option>
            ))}
          </select>
          {hasError && <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>{hasError}</span>}
        </>
      );
    }

    // Employee dropdown for MySQL backend
    if (isEmployeeField && selectedBackend === 'mysql') {
      const employeeOptions = getEmployeeOptions();
      return (
        <>
          <select
            name={key}
            value={formData[key]}
            onChange={handleChange}
            style={fieldStyle}
            required
          >
            <option value="">Select Employee</option>
            {employeeOptions.map(employee => (
              <option key={employee.id} value={employee.employee_name}>
                {employee.employee_name} - {employee.designation}
              </option>
            ))}
          </select>
          {hasError && <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>{hasError}</span>}
        </>
      );
    }

    // Master data dropdowns
    if (isDropdown) {
      return (
        <>
          <select
            name={key}
            value={formData[key]}
            onChange={handleChange}
            style={fieldStyle}
            required
          >
            <option value="">Select {key}</option>
            {dropdownOptions.map(option => {
              const value = typeof option === 'string' ? option : option.value;
              const displayText = typeof option === 'string' ? option : option.display_text;
              const colorCode = typeof option === 'object' ? option.color_code : null;

              return (
                <option key={value} value={value} style={{ color: colorCode }}>
                  {displayText}
                </option>
              );
            })}
          </select>
          {hasError && <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>{hasError}</span>}
        </>
      );
    }

    if (isTextarea) {
      return (
        <>
          <textarea
            name={key}
            value={formData[key]}
            onChange={handleChange}
            rows={3}
            style={fieldStyle}
            placeholder={`Enter ${key.toLowerCase()}`}
            required
          />
          {hasError && <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>{hasError}</span>}
        </>
      );
    }

    return (
      <>
        <input
          type={key === 'DATE' ? 'date' : isTime ? 'time' : isUrl ? 'url' : 'text'}
          name={key}
          value={formData[key]}
          onChange={handleChange}
          style={fieldStyle}
          placeholder={isTime ? '' : isUrl ? 'https://projects.zoho.com/...' : `Enter ${key.toLowerCase()}`}
          required
        />
        {hasError && <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>{hasError}</span>}
      </>
    );
  };

  // Organize fields into logical sections
  const formSections = {
    'Basic Information': ['DATE', 'TIME SHEET STATUS', 'ASSIGNED TO'],
    'Task Details': ['TASK TYPE', 'REQ TYPE', 'CLIENT NAME', 'ZOHO TASK TITLE', 'ZOHO TASK LINK'],
    'Task Description': ['TASK DESCRIPTION'],
    'Status & Time': ['STATUS', 'START TIME', 'END TIME', 'TIME TAKEN'],
    'Classification': ['MODULE', 'SUB MODULE', 'TYPE'],
    'Additional Notes': ['NARRATION', 'FIX DESCRIPTION']
  };

  const renderFormSection = (sectionTitle, fields) => (
    <div key={sectionTitle} className="form-section">
      <h3>{sectionTitle}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
        {fields.map((key) => (
          <div className={`form-group ${['TASK DESCRIPTION', 'NARRATION', 'FIX DESCRIPTION'].includes(key) ? 'full-width' : ''}`} key={key}>
            <label>
              {key} <span style={{ color: 'red' }}>*</span>
              {key === 'ZOHO TASK LINK' && (
                <span style={{ color: '#666', fontSize: '0.8em', fontWeight: 'normal' }}>
                  {' '}(Links to task title)
                </span>
              )}
            </label>
            {renderFormField(key)}
          </div>
        ))}
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'form':
        return (
          <div>
            <h1>Work Status Update</h1>

            {/* Progress Bar */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Form Completion</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#007bff' }}>
                  {getFormCompletionPercentage()}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e9ecef',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${getFormCompletionPercentage()}%`,
                  height: '100%',
                  backgroundColor: '#007bff',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>

            {/* Backend Selection */}
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              border: '1px solid #2196f3'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1976d2', fontSize: '1rem' }}>Select Backend</h4>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="backend"
                    value="sheets"
                    checked={selectedBackend === 'sheets'}
                    onChange={(e) => setSelectedBackend(e.target.value)}
                  />
                  <span>📊 Google Sheets</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="backend"
                    value="mysql"
                    checked={selectedBackend === 'mysql'}
                    onChange={(e) => {
                      setSelectedBackend(e.target.value);
                      if (e.target.value === 'mysql' && mysqlStatus === 'connected') {
                        loadMasterData();
                      }
                    }}
                  />
                  <span>🗄️ MySQL Database</span>
                  <span style={{
                    fontSize: '0.8rem',
                    color: mysqlStatus === 'connected' ? '#28a745' : '#dc3545',
                    marginLeft: '5px'
                  }}>
                    ({mysqlStatus === 'connected' ? '✅ Connected' : '❌ Disconnected'})
                  </span>
                </label>
                <button
                  type="button"
                  onClick={checkMysqlStatus}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Quick Templates */}
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '1rem' }}>Quick Templates</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => loadTemplate('bug-fix')} style={{
                  padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#dc3545', color: 'white',
                  border: 'none', borderRadius: '4px', cursor: 'pointer'
                }}>
                  🐛 Bug Fix
                </button>
                <button type="button" onClick={() => loadTemplate('feature')} style={{
                  padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#28a745', color: 'white',
                  border: 'none', borderRadius: '4px', cursor: 'pointer'
                }}>
                  ✨ New Feature
                </button>
                <button type="button" onClick={() => loadTemplate('meeting')} style={{
                  padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#6f42c1', color: 'white',
                  border: 'none', borderRadius: '4px', cursor: 'pointer'
                }}>
                  🤝 Meeting
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {Object.entries(formSections).map(([sectionTitle, fields]) =>
                renderFormSection(sectionTitle, fields)
              )}
              <div className="button-container">
                <button type="submit" disabled={isSubmitting} style={{
                  backgroundColor: isSubmitting ? '#ccc' : '#4CAF50'
                }}>
                  {isSubmitting ? '⏳ Submitting...' : '✅ Submit (Ctrl+S)'}
                </button>
                <button type="button" onClick={loadTestValues} disabled={isSubmitting} style={{
                  backgroundColor: '#2196F3'
                }}>
                  📝 Load Test Values (Ctrl+T)
                </button>
                <button type="button" onClick={clearValues} disabled={isSubmitting} style={{
                  backgroundColor: '#f44336'
                }}>
                  🗑️ Clear Values (Ctrl+R)
                </button>
                <button type="button" onClick={exportFormData} disabled={isSubmitting} style={{
                  backgroundColor: '#17a2b8'
                }}>
                  💾 Export Data
                </button>
                <label style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '10px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'inline-block',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  📁 Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={importFormData}
                    disabled={isSubmitting}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </form>
            {statusMessage && (
              <div style={{
                marginTop: '20px',
                padding: '10px',
                borderRadius: '4px',
                backgroundColor: statusMessage.includes('✅') ? '#d4edda' : '#f8d7da',
                color: statusMessage.includes('✅') ? '#155724' : '#721c24',
                border: `1px solid ${statusMessage.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                {statusMessage}
              </div>
            )}

          </div>
        );

      case 'projects':
        return <ProjectManager />;

      case 'data-viewer':
        return <DataViewer selectedBackend={selectedBackend} />;

      case 'master-data':
        return (
          <MasterDataManager
            selectedBackend={selectedBackend}
            onDataUpdated={loadMasterData}
          />
        );

      case 'reports':
        return <Reports selectedBackend={selectedBackend} />;

      case 'settings':
        return (
          <Settings
            selectedBackend={selectedBackend}
            setSelectedBackend={setSelectedBackend}
            mysqlStatus={mysqlStatus}
            checkMysqlStatus={checkMysqlStatus}
          />
        );

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
      <Navigation
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        selectedBackend={selectedBackend}
        mysqlStatus={mysqlStatus}
      />

      <div className="container">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default App;
