// A typed error we can throw from anywhere in the app (controllers, services)
// and have the global error handler turn into a clean JSON response with the
// right HTTP status code, instead of a generic 500.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

module.exports = { ApiError };
