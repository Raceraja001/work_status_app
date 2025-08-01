import React, { useState } from 'react';
import './App.css';

// Replace this with your NEW Google Apps Script Web App URL after redeployment
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwiZodiRYKxqlBGTKxgpVb3Upf-lD9XNeNxyRygM916MmoVedAYoqPzHhsXvQejOWAbbA/exec';

const App = () => {
  const [formData, setFormData] = useState({
    DATE: new Date().toISOString().split('T')[0],
    'TIME SHEET STATUS': 'Completed',
    'TASK TYPE': 'Development',
    'REQ TYPE': 'Feature Request',
    'CLIENT NAME': 'Test Client Inc.',
    'ZOHO TASK TITLE': 'Implement Google Sheets Integration',
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

  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const clearForm = () => {
    setFormData({
      DATE: new Date().toISOString().split('T')[0],
      'TIME SHEET STATUS': '',
      'TASK TYPE': '',
      'REQ TYPE': '',
      'CLIENT NAME': '',
      'ZOHO TASK TITLE': '',
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
    setStatusMessage('');
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
        setStatusMessage('✅ Form submitted successfully!');
        // Clear the form (reset to default test values)
        setFormData({
          DATE: new Date().toISOString().split('T')[0],
          'TIME SHEET STATUS': 'Completed',
          'TASK TYPE': 'Development',
          'REQ TYPE': 'Feature Request',
          'CLIENT NAME': 'Test Client Inc.',
          'ZOHO TASK TITLE': 'Implement Google Sheets Integration',
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
      } else {
        setStatusMessage('❌ Error: ' + result.error);
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

  return (
    <div className="container">
      <h1>Work Status Update</h1>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <div className="form-group" key={key}>
            <label>{key}</label>
            <input
              type={key === 'DATE' ? 'date' : 'text'}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" onClick={clearForm} disabled={isSubmitting}>
            Clear Form
          </button>
        </div>
      </form>
      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
};

export default App;
