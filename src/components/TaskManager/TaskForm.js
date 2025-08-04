import React, { useState, useEffect } from 'react';
import TaskValidator from './TaskValidator';

// Single Responsibility: Handle task creation and editing forms
const TaskForm = ({ task, projects, onSubmit, onCancel, isLoading }) => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    assignee_id: '',
    status: 'todo',
    priority: 'medium',
    task_type: 'task',
    estimated_hours: '',
    due_date: '',
    labels: [],
    custom_fields: {}
  });
  
  const [errors, setErrors] = useState({});
  const [labelInput, setLabelInput] = useState('');

  // Test data for quick form filling
  const getTestTaskData = () => ({
    title: 'Implement user authentication system',
    description: 'Create a secure login/logout system with JWT tokens, password hashing, and session management. Include forgot password functionality and email verification.',
    project_id: projects.length > 0 ? projects[0].id : '',
    assignee_id: '',
    status: 'in_progress',
    priority: 'high',
    task_type: 'story',
    estimated_hours: '8',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    labels: ['authentication', 'security', 'backend'],
    custom_fields: {
      complexity: 'high',
      team: 'backend'
    }
  });

  const loadTestValues = () => {
    const testData = getTestTaskData();
    setFormData(testData);
    setLabelInput('');
    setErrors({});
  };

  const clearFormData = () => {
    setFormData({
      title: '',
      description: '',
      project_id: '',
      assignee_id: '',
      status: 'todo',
      priority: 'medium',
      task_type: 'task',
      estimated_hours: '',
      due_date: '',
      labels: [],
      custom_fields: {}
    });
    setLabelInput('');
    setErrors({});
  };

  useEffect(() => {
    loadUsers();
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        project_id: task.project_id || '',
        assignee_id: task.assignee_id || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        task_type: task.task_type || 'task',
        estimated_hours: task.estimated_hours || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        labels: Array.isArray(task.labels) ? task.labels : [],
        custom_fields: task.custom_fields || {}
      });
    }
  }, [task]);

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/users');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      // Set default admin user if API fails
      setUsers([{ id: 1, username: 'admin', email: 'admin@example.com' }]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddLabel = () => {
    if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, labelInput.trim()]
      }));
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (labelToRemove) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = TaskValidator.validateTask({
      ...formData,
      reporter_id: 1 // Default admin user
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit({
      ...formData,
      reporter_id: 1, // Default admin user
      assignee_id: formData.assignee_id || null, // Convert empty string to null
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
      labels: formData.labels,
      custom_fields: formData.custom_fields
    });
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
        {task ? 'Edit Task' : 'Create New Task'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px',
          marginBottom: '20px'
        }}>
          {/* Title */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' }}>
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${errors.title ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Enter task title..."
            />
            {errors.title && (
              <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {errors.title}
              </span>
            )}
          </div>

          {/* Project */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' }}>
              Project *
            </label>
            <select
              name="project_id"
              value={formData.project_id}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${errors.project_id ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.project_key})
                </option>
              ))}
            </select>
            {errors.project_id && (
              <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {errors.project_id}
              </span>
            )}
          </div>

          {/* Assignee */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' }}>
              Assignee
            </label>
            <select
              name="assignee_id"
              value={formData.assignee_id}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' }}>
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="testing">Testing</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' }}>
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="lowest">Lowest</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="highest">Highest</option>
            </select>
          </div>

          {/* Task Type */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' }}>
              Task Type
            </label>
            <select
              name="task_type"
              value={formData.task_type}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="task">Task</option>
              <option value="story">Story</option>
              <option value="bug">Bug</option>
              <option value="epic">Epic</option>
              <option value="subtask">Subtask</option>
            </select>
          </div>

          {/* Estimated Hours */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' }}>
              Estimated Hours
            </label>
            <input
              type="number"
              name="estimated_hours"
              value={formData.estimated_hours}
              onChange={handleInputChange}
              step="0.5"
              min="0"
              max="1000"
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${errors.estimated_hours ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="0"
            />
            {errors.estimated_hours && (
              <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {errors.estimated_hours}
              </span>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' }}>
              Due Date
            </label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${errors.due_date ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            {errors.due_date && (
              <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {errors.due_date}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${errors.description ? '#dc3545' : '#ddd'}`,
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
            placeholder="Enter task description..."
          />
          {errors.description && (
            <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              {errors.description}
            </span>
          )}
        </div>

        {/* Labels */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' }}>
            Labels
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Add a label..."
            />
            <button
              type="button"
              onClick={handleAddLabel}
              style={{
                padding: '8px 12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Add
            </button>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {formData.labels.map((label, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#e9ecef',
                  color: '#495057',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {label}
                <button
                  type="button"
                  onClick={() => handleRemoveLabel(label)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6c757d',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '0',
                    marginLeft: '4px'
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Test Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={loadTestValues}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: isLoading ? '#ccc' : '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              📝 Load Test Values
            </button>
            <button
              type="button"
              onClick={clearFormData}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: isLoading ? '#ccc' : '#ffc107',
                color: '#212529',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              🗑️ Clear Form
            </button>
          </div>

          {/* Main Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: isLoading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {isLoading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;