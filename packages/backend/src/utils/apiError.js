export class ApiError extends Error {
  constructor(message, code = 'INTERNAL_SERVER_ERROR', status = 500, details) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
