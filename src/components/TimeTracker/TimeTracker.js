import React, { useState, useEffect } from 'react';
import TaskService from '../TaskManager/TaskService';
import TaskValidator from '../TaskManager/TaskValidator';

// Single Responsibility: Handle time tracking functionality
const TimeTracker = ({ taskId, onTimeLogged }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const taskService = new TaskService();

  // Test data for quick description filling
  const getTestDescriptions = () => [
    'Implemented user authentication with JWT tokens and password hashing',
    'Fixed critical bug in payment processing module',
    'Refactored database queries for better performance',
    'Added unit tests for user registration functionality',
    'Updated API documentation and added new endpoints',
    'Optimized frontend components for mobile responsiveness'
  ];

  const loadTestDescription = () => {
    const descriptions = getTestDescriptions();
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    setDescription(randomDescription);
    setError('');
  };

  const clearDescription = () => {
    setDescription('');
    setError('');
  };

  useEffect(() => {
    let interval = null;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    } else if (!isRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setStartTime(Date.now());
    setIsRunning(true);
    setElapsedTime(0);
    setError('');
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setStartTime(null);
    setElapsedTime(0);
    setDescription('');
    setError('');
  };

  const handleLogTime = async () => {
    if (elapsedTime === 0) {
      setError('No time to log');
      return;
    }

    const hoursSpent = elapsedTime / (1000 * 60 * 60); // Convert to hours
    
    const timeEntry = {
      task_id: taskId,
      user_id: 1, // Default admin user
      description: description.trim(),
      hours_spent: parseFloat(hoursSpent.toFixed(2)),
      date_worked: new Date().toISOString().split('T')[0],
      is_billable: true
    };

    const validation = TaskValidator.validateTimeEntry(timeEntry);
    if (!validation.isValid) {
      setError(Object.values(validation.errors)[0]);
      return;
    }

    try {
      setIsLogging(true);
      await taskService.logTime(timeEntry);
      setError('');
      handleReset();
      if (onTimeLogged) {
        onTimeLogged(timeEntry);
      }
    } catch (err) {
      setError('Failed to log time: ' + err.message);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '1px solid #e9ecef'
    }}>
      <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>Time Tracker</h4>

      {/* Timer Display */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: isRunning ? '#28a745' : '#333',
          fontFamily: 'monospace',
          marginBottom: '8px'
        }}>
          {formatTime(elapsedTime)}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#666'
        }}>
          {isRunning ? '⏱️ Timer Running' : '⏸️ Timer Stopped'}
        </div>
      </div>

      {/* Timer Controls */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {!isRunning ? (
          <button
            onClick={handleStart}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ▶️ Start
          </button>
        ) : (
          <button
            onClick={handleStop}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ⏸️ Stop
          </button>
        )}
        
        <button
          onClick={handleReset}
          disabled={isRunning}
          style={{
            backgroundColor: isRunning ? '#ccc' : '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Reset
        </button>
      </div>

      {/* Description Input */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '6px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Work Description
          </label>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={loadTestDescription}
              disabled={isLogging || isRunning}
              style={{
                backgroundColor: (isLogging || isRunning) ? '#ccc' : '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: (isLogging || isRunning) ? 'not-allowed' : 'pointer',
                fontSize: '10px'
              }}
            >
              📝 Test
            </button>
            <button
              type="button"
              onClick={clearDescription}
              disabled={isLogging || isRunning}
              style={{
                backgroundColor: (isLogging || isRunning) ? '#ccc' : '#ffc107',
                color: '#212529',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: (isLogging || isRunning) ? 'not-allowed' : 'pointer',
                fontSize: '10px'
              }}
            >
              🗑️ Clear
            </button>
          </div>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you work on?"
          rows={3}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Log Time Button */}
      <button
        onClick={handleLogTime}
        disabled={elapsedTime === 0 || isLogging || isRunning}
        style={{
          width: '100%',
          backgroundColor: (elapsedTime === 0 || isLogging || isRunning) ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          padding: '12px',
          borderRadius: '5px',
          cursor: (elapsedTime === 0 || isLogging || isRunning) ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        {isLogging ? 'Logging...' : `💾 Log ${(elapsedTime / (1000 * 60 * 60)).toFixed(2)} Hours`}
      </button>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '8px',
          borderRadius: '4px',
          marginTop: '12px',
          fontSize: '12px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* Quick Time Buttons */}
      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #eee'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '8px',
          fontWeight: 'bold'
        }}>
          Quick Log:
        </div>
        <div style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {[0.25, 0.5, 1, 2, 4, 8].map(hours => (
            <button
              key={hours}
              onClick={async () => {
                const timeEntry = {
                  task_id: taskId,
                  user_id: 1,
                  description: description.trim() || `${hours} hour(s) of work`,
                  hours_spent: hours,
                  date_worked: new Date().toISOString().split('T')[0],
                  is_billable: true
                };

                try {
                  setIsLogging(true);
                  await taskService.logTime(timeEntry);
                  setDescription('');
                  setError('');
                  if (onTimeLogged) {
                    onTimeLogged(timeEntry);
                  }
                } catch (err) {
                  setError('Failed to log time: ' + err.message);
                } finally {
                  setIsLogging(false);
                }
              }}
              disabled={isLogging}
              style={{
                backgroundColor: isLogging ? '#ccc' : '#f8f9fa',
                color: '#333',
                border: '1px solid #ddd',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: isLogging ? 'not-allowed' : 'pointer',
                fontSize: '11px'
              }}
            >
              {hours}h
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;