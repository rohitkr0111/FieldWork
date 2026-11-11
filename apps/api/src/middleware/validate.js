import { AppError } from '../lib/errors.js';
export const validate = (schema, target = 'body') => (req, _res, next) => {
  const parsed = schema.safeParse(req[target]);
  if (!parsed.success) return next(new AppError(400, 'VALIDATION_ERROR', 'Please check the submitted information', parsed.error.flatten()));
  req[target] = parsed.data;
  next();
};
