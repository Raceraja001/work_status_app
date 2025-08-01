import React, { useState, useEffect } from 'react';
import './App.css';

// Replace this with your NEW Google Apps Script Web App URL after redeployment
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwiZodiRYKxqlBGTKxgpVb3Upf-lD9XNeNxyRygM916MmoVedAYoqPzHhsXvQejOWAbbA/exec';

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

  // Load saved draft on component mount
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
  }, []);

  // Save draft to localStorage whenever form data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('workStatusDraft', JSON.stringify(formData));
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

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
          updatedData['TIME TAKEN'] = `${hours}.${minutes < 30 ? '0' : '5'} hours`;
        }
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
    setStatusMessage('🗑️ Form cleared');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('Submitting...');

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
        // Clear localStorage draft
        localStorage.removeItem('workStatusDraft');
        // Clear the form after successful submission
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
      } else {
        setStatusMessage('❌ Error submitting form: ' + (result.error || 'Unknown error occurred'));
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

    // Add timeout for debugging
    setTimeout(() => {
      if (window[callbackName]) {
        console.error('Request timed out after 10 seconds');
        setStatusMessage('❌ Request timed out. Please check your Apps Script deployment.');
        document.head.removeChild(script);
        delete window[callbackName];
        setIsSubmitting(false);
      }
    }, 10000);

    console.log('Making request to:', url);
    script.src = url;
    document.head.appendChild(script);
  };

  // Define dropdown options for better UX
  const dropdownOptions = {
    'TIME SHEET STATUS': ['Pending', 'Completed', 'In Review', 'Approved'],
    'TASK TYPE': ['Development', 'Testing', 'Bug Fix', 'Documentation', 'Meeting', 'Research'],
    'REQ TYPE': ['Feature Request', 'Bug Report', 'Enhancement', 'Maintenance', 'Support'],
    STATUS: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
    MODULE: ['Frontend', 'Backend', 'Database', 'API', 'UI/UX', 'DevOps'],
    TYPE: ['Enhancement', 'Bug Fix', 'New Feature', 'Refactoring', 'Documentation']
  };

  const renderFormField = (key) => {
    const isDropdown = dropdownOptions[key];
    const isTextarea = ['TASK DESCRIPTION', 'NARRATION', 'FIX DESCRIPTION'].includes(key);
    const isTime = ['START TIME', 'END TIME'].includes(key);
    const isUrl = key === 'ZOHO TASK LINK';

    if (isDropdown) {
      return (
        <select
          name={key}
          value={formData[key]}
          onChange={handleChange}
          required
        >
          <option value="">Select {key}</option>
          {dropdownOptions[key].map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    if (isTextarea) {
      return (
        <textarea
          name={key}
          value={formData[key]}
          onChange={handleChange}
          rows={3}
          placeholder={`Enter ${key.toLowerCase()}`}
          required
        />
      );
    }

    return (
      <input
        type={key === 'DATE' ? 'date' : isTime ? 'time' : isUrl ? 'url' : 'text'}
        name={key}
        value={formData[key]}
        onChange={handleChange}
        placeholder={isTime ? '' : isUrl ? 'https://projects.zoho.com/...' : `Enter ${key.toLowerCase()}`}
        required
      />
    );
  };

  return (
    <div className="container">
      <h1>Work Status Update</h1>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <div className="form-group" key={key}>
            <label>
              {key} <span style={{ color: 'red' }}>*</span>
              {key === 'ZOHO TASK LINK' && (
                <span style={{ color: '#666', fontSize: '0.9em', fontWeight: 'normal' }}>
                  {' '}(This will be linked to the task title)
                </span>
              )}
            </label>
            {renderFormField(key)}
          </div>
        ))}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button type="submit" disabled={isSubmitting} style={{
            backgroundColor: isSubmitting ? '#ccc' : '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" onClick={loadTestValues} disabled={isSubmitting} style={{
            backgroundColor: '#2196F3',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}>
            📝 Load Test Values
          </button>
          <button type="button" onClick={clearValues} disabled={isSubmitting} style={{
            backgroundColor: '#f44336',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}>
            🗑️ Clear Values
          </button>
          <button type="button" onClick={exportFormData} disabled={isSubmitting} style={{
            backgroundColor: '#17a2b8',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}>
            Export Data
          </button>
          <label style={{
            backgroundColor: '#6c757d',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'inline-block'
          }}>
            Import Data
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
};

export default App;
