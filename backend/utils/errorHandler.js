// backend/utils/errorHandler.js
class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  class ValidationError extends AppError {
    constructor(message) {
      super(message, 400);
    }
  }
  
  class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
      super(message, 401);
    }
  }
  
  class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
      super(message, 404);
    }
  }
  
  module.exports = { AppError, ValidationError, AuthenticationError, NotFoundError };