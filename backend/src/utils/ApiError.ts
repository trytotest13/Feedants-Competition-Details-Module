export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, 'NOT_FOUND', message);
  }
  static badRequest(message = 'Invalid request', details?: unknown) {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }
  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }
  static forbidden(message = 'You do not have access to this resource') {
    return new ApiError(403, 'FORBIDDEN', message);
  }
  static conflict(code: string, message: string) {
    return new ApiError(409, code, message);
  }
  static unprocessable(code: string, message: string, details?: unknown) {
    return new ApiError(422, code, message, details);
  }
  static paymentRequired(message = 'Payment required for this action') {
    return new ApiError(402, 'PAYMENT_REQUIRED', message);
  }
}
