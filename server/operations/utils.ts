import { ZodError } from "zod";

/**
 * Format Zod validation errors into a more readable format
 */
export function formatZodError(error: ZodError) {
  return error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message
  }));
}
