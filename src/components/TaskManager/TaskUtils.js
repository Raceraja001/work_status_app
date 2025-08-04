// Single Responsibility: Utility functions for task operations
class TaskUtils {
  static getStatusColor(status) {
    const colors = {
      todo: '#6c757d',
      in_progress: '#007bff',
      in_review: '#ffc107',
      testing: '#fd7e14',
      done: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  }

  static getPriorityColor(priority) {
    const colors = {
      lowest: '#6c757d',
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      highest: '#dc3545'
    };
    return colors[priority] || '#6c757d';
  }

  static getTaskTypeIcon(taskType) {
    const icons = {
      task: '📋',
      story: '📖',
      bug: '🐛',
      epic: '🎯',
      subtask: '📝'
    };
    return icons[taskType] || '📋';
  }

  static formatDate(dateString) {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  }

  static formatDateTime(dateString) {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  }

  static calculateProgress(task) {
    if (!task.estimated_hours) return 0;
    return Math.min(Math.round((task.actual_hours / task.estimated_hours) * 100), 100);
  }

  static isOverdue(task) {
    if (!task.due_date || task.status === 'done' || task.status === 'cancelled') {
      return false;
    }
    return new Date(task.due_date) < new Date();
  }

  static getDaysUntilDue(task) {
    if (!task.due_date) return null;
    const today = new Date();
    const dueDate = new Date(task.due_date);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  static generateTaskKey(projectKey, taskId) {
    return `${projectKey}-${taskId}`;
  }

  static filterTasks(tasks, filters) {
    return tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.assignee_id && task.assignee_id !== filters.assignee_id) return false;
      if (filters.project_id && task.project_id !== filters.project_id) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const descMatch = task.description?.toLowerCase().includes(searchLower);
        const keyMatch = task.task_key.toLowerCase().includes(searchLower);
        if (!titleMatch && !descMatch && !keyMatch) return false;
      }
      return true;
    });
  }

  static sortTasks(tasks, sortBy, sortOrder = 'asc') {
    return [...tasks].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (sortBy.includes('date') || sortBy.includes('_at')) {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  static groupTasksByStatus(tasks) {
    return tasks.reduce((groups, task) => {
      const status = task.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(task);
      return groups;
    }, {});
  }

  static getTaskStats(tasks) {
    const stats = {
      total: tasks.length,
      todo: 0,
      in_progress: 0,
      in_review: 0,
      testing: 0,
      done: 0,
      cancelled: 0,
      overdue: 0
    };

    tasks.forEach(task => {
      stats[task.status] = (stats[task.status] || 0) + 1;
      if (this.isOverdue(task)) {
        stats.overdue++;
      }
    });

    return stats;
  }
}

export default TaskUtils;