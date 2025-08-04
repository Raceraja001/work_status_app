// Single Responsibility: Handle all task-related API operations
class TaskService {
  constructor(apiBase = 'http://localhost:3002/api') {
    this.apiBase = apiBase;
  }

  // Helper method to sanitize data before sending to API
  sanitizeData(data) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      // Convert undefined to null, keep other falsy values as-is
      sanitized[key] = value === undefined ? null : value;
    }
    return sanitized;
  }

  async getTasks(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const url = `${this.apiBase}/tasks${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch tasks');
    }
    
    return result.data;
  }

  async getTask(id) {
    const response = await fetch(`${this.apiBase}/tasks/${id}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch task');
    }
    
    return result.data;
  }

  async createTask(taskData) {
    const sanitizedData = this.sanitizeData(taskData);
    const response = await fetch(`${this.apiBase}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedData)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create task');
    }
    
    return result;
  }

  async updateTask(id, taskData) {
    const sanitizedData = this.sanitizeData(taskData);
    const response = await fetch(`${this.apiBase}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedData)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update task');
    }
    
    return result;
  }

  async getProjects() {
    const response = await fetch(`${this.apiBase}/projects`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch projects');
    }
    
    return result.data;
  }

  async logTime(timeEntry) {
    const sanitizedData = this.sanitizeData(timeEntry);
    const response = await fetch(`${this.apiBase}/time-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedData)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to log time');
    }
    
    return result;
  }

  async addComment(taskId, comment) {
    const sanitizedData = this.sanitizeData(comment);
    const response = await fetch(`${this.apiBase}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedData)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to add comment');
    }
    
    return result;
  }
}

export default TaskService;