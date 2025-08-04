import React, { useState, useEffect } from 'react';
import TaskService from './TaskService';
import TaskUtils from './TaskUtils';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';

// Open/Closed Principle: TaskManager is open for extension but closed for modification
const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    project_id: '',
    search: ''
  });
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'kanban'
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const taskService = new TaskService();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData] = await Promise.all([
        taskService.getTasks(),
        taskService.getProjects()
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await taskService.getTasks(filters);
      setTasks(tasksData);
    } catch (err) {
      setError('Failed to load tasks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      setLoading(true);
      await taskService.createTask(taskData);
      setShowCreateForm(false);
      setError('');
      await loadTasks();
    } catch (err) {
      setError('Failed to create task: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      setLoading(true);
      await taskService.updateTask(selectedTask.id, taskData);
      setShowCreateForm(false);
      setSelectedTask(null);
      setError('');
      await loadTasks();
    } catch (err) {
      setError('Failed to update task: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowCreateForm(true);
  };

  const handleViewTask = (task) => {
    setSelectedTaskId(task.id);
  };

  const handleCloseTaskDetail = () => {
    setSelectedTaskId(null);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setSelectedTask(null);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      project_id: '',
      search: ''
    });
  };

  const filteredTasks = TaskUtils.filterTasks(tasks, filters);
  const sortedTasks = TaskUtils.sortTasks(filteredTasks, sortBy, sortOrder);
  const taskStats = TaskUtils.getTaskStats(filteredTasks);
  const groupedTasks = TaskUtils.groupTasksByStatus(sortedTasks);

  const renderFilters = () => (
    <div style={{
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '16px',
        alignItems: 'end'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search tasks..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            Project
          </label>
          <select
            value={filters.project_id}
            onChange={(e) => handleFilterChange('project_id', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="testing">Testing</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">All Priorities</option>
            <option value="lowest">Lowest</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="highest">Highest</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'end' }}>
          <button
            onClick={clearFilters}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              height: 'fit-content'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div style={{
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Task Statistics</h4>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
        gap: '16px',
        textAlign: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {taskStats.total}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6c757d' }}>
            {taskStats.todo}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>To Do</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
            {taskStats.in_progress}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>In Progress</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {taskStats.done}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Done</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
            {taskStats.overdue}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Overdue</div>
        </div>
      </div>
    </div>
  );

  const renderCardsView = () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
      gap: '20px',
      padding: '4px'
    }}>
      {sortedTasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={handleEditTask}
          onView={handleViewTask}
        />
      ))}
    </div>
  );

  const renderKanbanView = () => {
    const statusColumns = [
      { key: 'todo', title: 'To Do', color: '#6c757d' },
      { key: 'in_progress', title: 'In Progress', color: '#007bff' },
      { key: 'in_review', title: 'In Review', color: '#ffc107' },
      { key: 'testing', title: 'Testing', color: '#fd7e14' },
      { key: 'done', title: 'Done', color: '#28a745' }
    ];

    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${statusColumns.length}, 1fr)`, 
        gap: '16px',
        minHeight: '600px'
      }}>
        {statusColumns.map(column => (
          <div
            key={column.key}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}
          >
            <div style={{
              backgroundColor: column.color,
              color: 'white',
              padding: '12px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {column.title} ({(groupedTasks[column.key] || []).length})
            </div>
            <div style={{ padding: '12px', minHeight: '500px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(groupedTasks[column.key] || []).map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onView={handleViewTask}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ 
      padding: '16px',
      maxWidth: '100%',
      boxSizing: 'border-box',
      margin: '0 auto',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '24px'
      }}>
        {/* Title */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <h1 style={{ margin: 0, color: '#333', fontSize: '28px' }}>Task Management</h1>
        </div>
        
        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', gap: '0', marginRight: '8px' }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                padding: '8px 12px',
                backgroundColor: viewMode === 'cards' ? '#007bff' : '#f8f9fa',
                color: viewMode === 'cards' ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '4px 0 0 4px',
                cursor: 'pointer',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              📋 Cards
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                padding: '8px 12px',
                backgroundColor: viewMode === 'kanban' ? '#007bff' : '#f8f9fa',
                color: viewMode === 'kanban' ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '0 4px 4px 0',
                cursor: 'pointer',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              📊 Kanban
            </button>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            ➕ Create Task
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div style={{ marginBottom: '20px' }}>
          <TaskForm
            task={selectedTask}
            projects={projects}
            onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
            onCancel={handleCancelForm}
            isLoading={loading}
          />
        </div>
      )}

      {/* Filters */}
      {!showCreateForm && renderFilters()}

      {/* Statistics */}
      {!showCreateForm && renderStats()}

      {/* Tasks View */}
      {!showCreateForm && (
        <>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading tasks...
            </div>
          )}

          {!loading && sortedTasks.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3>No tasks found</h3>
              <p>Create your first task or adjust your filters!</p>
            </div>
          )}

          {!loading && sortedTasks.length > 0 && (
            viewMode === 'cards' ? renderCardsView() : renderKanbanView()
          )}
        </>
      )}

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetail
          taskId={selectedTaskId}
          onClose={handleCloseTaskDetail}
          onTaskUpdated={loadTasks}
        />
      )}
    </div>
  );
};

export default TaskManager;