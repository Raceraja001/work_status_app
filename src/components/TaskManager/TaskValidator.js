// Single Responsibility: Handle task validation logic
class TaskValidator {
  static validateTask(taskData) {
    const errors = {};

    // Required field validation
    if (!taskData.title?.trim()) {
      errors.title = 'Task title is required';
    }

    if (!taskData.project_id) {
      errors.project_id = 'Project is required';
    }

    if (!taskData.reporter_id) {
      errors.reporter_id = 'Reporter is required';
    }

    // Title length validation
    if (taskData.title && taskData.title.length > 500) {
      errors.title = 'Task title must be less than 500 characters';
    }

    // Description length validation
    if (taskData.description && taskData.description.length > 5000) {
      errors.description = 'Description must be less than 5000 characters';
    }

    // Estimated hours validation
    if (taskData.estimated_hours && (taskData.estimated_hours < 0 || taskData.estimated_hours > 1000)) {
      errors.estimated_hours = 'Estimated hours must be between 0 and 1000';
    }

    // Due date validation
    if (taskData.due_date && new Date(taskData.due_date) < new Date()) {
      errors.due_date = 'Due date cannot be in the past';
    }

    // Story points validation
    if (taskData.story_points && (taskData.story_points < 0 || taskData.story_points > 100)) {
      errors.story_points = 'Story points must be between 0 and 100';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateTimeEntry(timeEntry) {
    const errors = {};

    if (!timeEntry.task_id) {
      errors.task_id = 'Task is required';
    }

    if (!timeEntry.user_id) {
      errors.user_id = 'User is required';
    }

    if (!timeEntry.hours_spent || timeEntry.hours_spent <= 0) {
      errors.hours_spent = 'Hours spent must be greater than 0';
    }

    if (timeEntry.hours_spent > 24) {
      errors.hours_spent = 'Hours spent cannot exceed 24 hours per day';
    }

    if (!timeEntry.date_worked) {
      errors.date_worked = 'Date worked is required';
    }

    if (timeEntry.date_worked && new Date(timeEntry.date_worked) > new Date()) {
      errors.date_worked = 'Date worked cannot be in the future';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateComment(comment) {
    const errors = {};

    if (!comment.content?.trim()) {
      errors.content = 'Comment content is required';
    }

    if (comment.content && comment.content.length > 2000) {
      errors.content = 'Comment must be less than 2000 characters';
    }

    if (!comment.user_id) {
      errors.user_id = 'User is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default TaskValidator;