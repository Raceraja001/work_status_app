import React, { useState, useEffect } from 'react';

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_key: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    due_date: '',
    estimated_hours: '',
    budget: ''
  });

  const API_BASE = 'http://localhost:3002/api';

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/projects`);
      const result = await response.json();
      
      if (result.success) {
        setProjects(result.data);
      } else {
        setError('Failed to load projects');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate project key from name
    if (name === 'name' && !formData.project_key) {
      const key = value.toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .split(' ')
        .map(word => word.substring(0, 3))
        .join('')
        .substring(0, 10);
      setFormData(prev => ({
        ...prev,
        project_key: key
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = selectedProject 
        ? `${API_BASE}/projects/${selectedProject.id}`
        : `${API_BASE}/projects`;
      
      const method = selectedProject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          owner_id: 1, // Default admin user
          updated_by: selectedProject ? 1 : undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        setError('');
        setShowCreateForm(false);
        setSelectedProject(null);
        setFormData({
          name: '',
          description: '',
          project_key: '',
          status: 'planning',
          priority: 'medium',
          start_date: '',
          due_date: '',
          estimated_hours: '',
          budget: ''
        });
        loadProjects();
      } else {
        setError(result.error || 'Failed to save project');
      }
    } catch (err) {
      setError('Error saving project: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const editProject = (project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name || '',
      description: project.description || '',
      project_key: project.project_key || '',
      status: project.status || 'planning',
      priority: project.priority || 'medium',
      start_date: project.start_date || '',
      due_date: project.due_date || '',
      estimated_hours: project.estimated_hours || '',
      budget: project.budget || ''
    });
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setShowCreateForm(false);
    setSelectedProject(null);
    setFormData({
      name: '',
      description: '',
      project_key: '',
      status: 'planning',
      priority: 'medium',
      start_date: '',
      due_date: '',
      estimated_hours: '',
      budget: ''
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: '#6c757d',
      active: '#28a745',
      on_hold: '#ffc107',
      completed: '#17a2b8',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      lowest: '#6c757d',
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      highest: '#dc3545'
    };
    return colors[priority] || '#6c757d';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateProgress = (project) => {
    if (!project.task_count) return 0;
    return Math.round((project.completed_tasks / project.task_count) * 100);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h1>Project Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ➕ Create New Project
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3>{selectedProject ? 'Edit Project' : 'Create New Project'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Project Key *
                </label>
                <input
                  type="text"
                  name="project_key"
                  value={formData.project_key}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                  placeholder="e.g., PROJ-001"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  <option value="lowest">Lowest</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="highest">Highest</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Estimated Hours
                </label>
                <input
                  type="number"
                  name="estimated_hours"
                  value={formData.estimated_hours}
                  onChange={handleInputChange}
                  step="0.5"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Budget
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
                placeholder="Project description..."
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Saving...' : (selectedProject ? 'Update Project' : 'Create Project')}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      {loading && !showCreateForm && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading projects...
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '20px' 
      }}>
        {projects.map(project => (
          <div
            key={project.id}
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '10px'
            }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>
                  {project.name}
                </h3>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  backgroundColor: '#f8f9fa',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  display: 'inline-block'
                }}>
                  {project.project_key}
                </div>
              </div>
              <button
                onClick={() => editProject(project)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #ddd',
                  padding: '5px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ✏️ Edit
              </button>
            </div>

            {project.description && (
              <p style={{ 
                margin: '10px 0', 
                color: '#666', 
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {project.description}
              </p>
            )}

            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginBottom: '15px',
              flexWrap: 'wrap'
            }}>
              <span style={{
                backgroundColor: getStatusColor(project.status),
                color: 'white',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                {project.status.replace('_', ' ').toUpperCase()}
              </span>
              <span style={{
                backgroundColor: getPriorityColor(project.priority),
                color: 'white',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                {project.priority.toUpperCase()} PRIORITY
              </span>
            </div>

            <div style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
              <div style={{ marginBottom: '5px' }}>
                <strong>Owner:</strong> {project.owner_name || 'Unknown'}
              </div>
              <div style={{ marginBottom: '5px' }}>
                <strong>Start:</strong> {formatDate(project.start_date)}
              </div>
              <div style={{ marginBottom: '5px' }}>
                <strong>Due:</strong> {formatDate(project.due_date)}
              </div>
              {project.estimated_hours && (
                <div style={{ marginBottom: '5px' }}>
                  <strong>Est. Hours:</strong> {project.estimated_hours}h
                </div>
              )}
              {project.budget && (
                <div style={{ marginBottom: '5px' }}>
                  <strong>Budget:</strong> ${parseFloat(project.budget).toLocaleString()}
                </div>
              )}
            </div>

            {/* Task Progress */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '5px'
              }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  Tasks Progress
                </span>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {project.completed_tasks || 0} / {project.task_count || 0}
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#e9ecef',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${calculateProgress(project)}%`,
                  height: '100%',
                  backgroundColor: '#28a745',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                {calculateProgress(project)}% Complete
              </div>
            </div>

            <div style={{ 
              fontSize: '11px', 
              color: '#999',
              borderTop: '1px solid #eee',
              paddingTop: '10px'
            }}>
              Created: {formatDate(project.created_at)}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }}>
          <h3>No projects found</h3>
          <p>Create your first project to get started!</p>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;