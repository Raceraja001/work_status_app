import React from 'react';
import TaskUtils from './TaskUtils';

// Single Responsibility: Display a single task card
const TaskCard = ({ task, onEdit, onView, onClick }) => {
  const handleCardClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(task);
    } else if (onView) {
      onView(task);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  const daysUntilDue = TaskUtils.getDaysUntilDue(task);
  const isOverdue = TaskUtils.isOverdue(task);
  const progress = TaskUtils.calculateProgress(task);

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e9ecef',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative'
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '4px'
          }}>
            <span style={{ fontSize: '16px' }}>
              {TaskUtils.getTaskTypeIcon(task.task_type)}
            </span>
            <span style={{ 
              fontSize: '12px', 
              color: '#666',
              backgroundColor: '#f8f9fa',
              padding: '2px 6px',
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}>
              {task.task_key}
            </span>
          </div>
          <h4 style={{ 
            margin: '0', 
            color: '#333',
            fontSize: '14px',
            fontWeight: '600',
            lineHeight: '1.3'
          }}>
            {task.title}
          </h4>
        </div>
        
        {onEdit && (
          <button
            onClick={handleEditClick}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #ddd',
              padding: '4px 8px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '11px',
              color: '#666'
            }}
          >
            ✏️
          </button>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p style={{ 
          margin: '0 0 12px 0', 
          color: '#666', 
          fontSize: '12px',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {task.description}
        </p>
      )}

      {/* Status and Priority Badges */}
      <div style={{ 
        display: 'flex', 
        gap: '6px', 
        marginBottom: '12px',
        flexWrap: 'wrap'
      }}>
        <span style={{
          backgroundColor: TaskUtils.getStatusColor(task.status),
          color: 'white',
          padding: '2px 6px',
          borderRadius: '10px',
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {task.status.replace('_', ' ')}
        </span>
        <span style={{
          backgroundColor: TaskUtils.getPriorityColor(task.priority),
          color: 'white',
          padding: '2px 6px',
          borderRadius: '10px',
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {task.priority}
        </span>
      </div>

      {/* Progress Bar */}
      {task.estimated_hours > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#333' }}>
              Progress
            </span>
            <span style={{ fontSize: '11px', color: '#666' }}>
              {task.actual_hours || 0}h / {task.estimated_hours}h
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#e9ecef',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: progress >= 100 ? '#28a745' : '#007bff',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>
      )}

      {/* Assignee and Due Date */}
      <div style={{ fontSize: '11px', color: '#666' }}>
        {task.assignee_name && (
          <div style={{ marginBottom: '4px' }}>
            <strong>Assigned to:</strong> {task.assignee_name}
          </div>
        )}
        {task.due_date && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>
              <strong>Due:</strong> {TaskUtils.formatDate(task.due_date)}
            </span>
            {daysUntilDue !== null && (
              <span style={{
                color: isOverdue ? '#dc3545' : daysUntilDue <= 3 ? '#ffc107' : '#28a745',
                fontWeight: 'bold'
              }}>
                {isOverdue ? 'Overdue' : daysUntilDue === 0 ? 'Due today' : `${daysUntilDue}d left`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Project Info */}
      <div style={{ 
        fontSize: '10px', 
        color: '#999',
        borderTop: '1px solid #eee',
        paddingTop: '8px',
        marginTop: '12px'
      }}>
        Project: {task.project_name}
      </div>
    </div>
  );
};

export default TaskCard;