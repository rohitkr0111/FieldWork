export class AppError extends Error {
  constructor(status, code, message, details) { super(message); this.status = status; this.code = code; this.details = details; }
}
export const notFound = () => new AppError(404, 'NOT_FOUND', 'The requested resource was not found');
export function errorHandler(error, req, res, _next) {
  const status = error.status || 500;
  req.log?.[status >= 500 ? 'error' : 'warn']({ err: error, requestId: req.id }, 'request failed');
  res.status(status).json({ success: false, error: { code: error.code || 'INTERNAL_ERROR', message: status >= 500 ? 'An unexpected error occurred' : error.message, ...(error.details ? { details: error.details } : {}), requestId: req.id } });
}
