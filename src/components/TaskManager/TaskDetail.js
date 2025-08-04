import React, { useState, useEffect } from 'react';
import TaskService from './TaskService';
import TaskUtils from './TaskUtils';
import TaskValidator from './TaskValidator';
import TimeTracker from '../TimeTracker/TimeTracker';

// Single Responsibility: Display detailed task information with time tracking
const TaskDetail = ({ taskId, onClose, onTaskUpdated }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTimeTracker, setShowTimeTracker] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const taskService = new TaskService();

  // Test data for quick comment filling
  const getTestComments = () => [
    'Great progress on this task! The implementation looks solid and follows our coding standards.',
    'I found a small issue with the error handling. Could you please review the validation logic?',
    'This feature is working perfectly in the staging environment. Ready for production deployment.',
    'Added some additional test cases to ensure edge cases are covered. All tests are passing.',
    'The performance improvements are significant. Load time reduced by 40% compared to the previous version.',
    'Documentation has been updated to reflect the new changes. Please review when you have time.'
  ];

  const loadTestComment = () => {
    const comments = getTestComments();
    const randomComment = comments[Math.floor(Math.random() * comments.length)];
    setNewComment(randomComment);
    setError('');
  };

  const clearComment = () => {
    setNewComment('');
    setError('');
  };

  useEffect(() => {
    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const taskData = await taskService.getTask(taskId);
      setTask(taskData);
    } catch (err) {
      setError('Failed to load task: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment = {
      user_id: 1, // Default admin user
      content: newComment.trim(),
      content_type: 'text',
      is_internal: false
    };

    const validation = TaskValidator.validateComment(comment);
    if (!validation.isValid) {
      setError(Object.values(validation.errors)[0]);
      return;
    }

    try {
      setIsAddingComment(true);
      await taskService.addComment(taskId, comment);
      setNewComment('');
      setError('');
      await loadTask(); // Reload to get updated comments
    } catch (err) {
      setError('Failed to add comment: ' + err.message);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleTimeLogged = () => {
    loadTask(); // Reload task to get updated time entries
    if (onTaskUpdated) {
      onTaskUpdated();
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          Loading task details...
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '1200px',
        width: '95%',
        maxHeight: '90vh',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>
                {TaskUtils.getTaskTypeIcon(task.task_type)}
              </span>
              <span style={{
                fontSize: '14px',
                color: '#666',
                backgroundColor: '#f8f9fa',
                padding: '4px 8px',
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}>
                {task.task_key}
              </span>
            </div>
            <h2 style={{ margin: '0', color: '#333', fontSize: '24px' }}>
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0',
              marginLeft: '20px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          display: 'block',
          padding: '20px',
          overflow: 'auto',
          flex: 1
        }}>
          {/* Left Column - Main Content */}
          <div>
            {/* Description */}
            {task.description && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Description</h4>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '4px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}>
                  {task.description}
                </div>
              </div>
            )}

            {/* Comments */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>
                Comments ({task.comments?.length || 0})
              </h4>
              
              {/* Add Comment */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '16px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                    Add Comment
                  </label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={loadTestComment}
                      disabled={isAddingComment}
                      style={{
                        backgroundColor: isAddingComment ? '#ccc' : '#17a2b8',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '3px',
                        cursor: isAddingComment ? 'not-allowed' : 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      📝 Test
                    </button>
                    <button
                      type="button"
                      onClick={clearComment}
                      disabled={isAddingComment}
                      style={{
                        backgroundColor: isAddingComment ? '#ccc' : '#ffc107',
                        color: '#212529',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '3px',
                        cursor: isAddingComment ? 'not-allowed' : 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      🗑️ Clear
                    </button>
                  </div>
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical',
                    marginBottom: '8px'
                  }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isAddingComment}
                  style={{
                    backgroundColor: (!newComment.trim() || isAddingComment) ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: (!newComment.trim() || isAddingComment) ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {isAddingComment ? 'Adding...' : 'Add Comment'}
                </button>
              </div>

              {/* Comments List */}
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {task.comments?.map(comment => (
                  <div
                    key={comment.id}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #eee',
                      borderRadius: '4px',
                      padding: '12px',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <strong style={{ fontSize: '14px', color: '#333' }}>
                        {comment.username || 'Unknown User'}
                      </strong>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {TaskUtils.formatDateTime(comment.created_at)}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '14px',
                      lineHeight: '1.4',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {comment.content}
                    </div>
                  </div>
                ))}
                {(!task.comments || task.comments.length === 0) && (
                  <div style={{
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '14px',
                    padding: '20px'
                  }}>
                    No comments yet
                  </div>
                )}
              </div>
            </div>

            {/* Time Entries */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>
                Time Entries ({task.time_entries?.length || 0})
              </h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {task.time_entries?.map(entry => (
                  <div
                    key={entry.id}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #eee',
                      borderRadius: '4px',
                      padding: '12px',
                      marginBottom: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                        {entry.hours_spent}h - {entry.username}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {TaskUtils.formatDate(entry.date_worked)}
                      </div>
                      {entry.description && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          {entry.description}
                        </div>
                      )}
                    </div>
                    {entry.is_billable && (
                      <span style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontSize: '10px'
                      }}>
                        Billable
                      </span>
                    )}
                  </div>
                ))}
                {(!task.time_entries || task.time_entries.length === 0) && (
                  <div style={{
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '14px',
                    padding: '20px'
                  }}>
                    No time entries yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div>
            {/* Task Info */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Task Details</h4>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Status</div>
                <span style={{
                  backgroundColor: TaskUtils.getStatusColor(task.status),
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Priority</div>
                <span style={{
                  backgroundColor: TaskUtils.getPriorityColor(task.priority),
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {task.priority}
                </span>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Assignee</div>
                <div style={{ fontSize: '14px', color: '#333' }}>
                  {task.assignee_name || 'Unassigned'}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Reporter</div>
                <div style={{ fontSize: '14px', color: '#333' }}>
                  {task.reporter_name || 'Unknown'}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Project</div>
                <div style={{ fontSize: '14px', color: '#333' }}>
                  {task.project_name}
                </div>
              </div>

              {task.due_date && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>Due Date</div>
                  <div style={{
                    fontSize: '14px',
                    color: TaskUtils.isOverdue(task) ? '#dc3545' : '#333'
                  }}>
                    {TaskUtils.formatDate(task.due_date)}
                    {TaskUtils.isOverdue(task) && ' (Overdue)'}
                  </div>
                </div>
              )}

              {task.estimated_hours && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>Time Progress</div>
                  <div style={{ fontSize: '14px', color: '#333' }}>
                    {task.actual_hours || 0}h / {task.estimated_hours}h
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginTop: '4px'
                  }}>
                    <div style={{
                      width: `${TaskUtils.calculateProgress(task)}%`,
                      height: '100%',
                      backgroundColor: '#28a745',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Time Tracker */}
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={() => setShowTimeTracker(!showTimeTracker)}
                style={{
                  width: '100%',
                  backgroundColor: showTimeTracker ? '#dc3545' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '12px'
                }}
              >
                {showTimeTracker ? '⏹️ Hide Timer' : '⏱️ Track Time'}
              </button>
              
              {showTimeTracker && (
                <TimeTracker
                  taskId={task.id}
                  onTimeLogged={handleTimeLogged}
                />
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            margin: '0 20px 20px 20px',
            borderRadius: '4px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;