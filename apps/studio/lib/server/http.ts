import { ZodError, type ZodType } from 'zod';
import { AuthError } from './auth';
import { StoreError } from './store';

export function jsonError(status: number, code: string, message: string, details?: unknown) {
  return Response.json({ error: { code, message, details } }, { status });
}

export async function parseJson<T>(request: Request, schema: ZodType<T>) {
  return schema.parse(await request.json());
}

export function handleRouteError(error: unknown) {
  if (error instanceof AuthError) {
    return jsonError(error.code === 'unauthorized' ? 401 : 403, error.code, error.message);
  }
  if (error instanceof StoreError) {
    const status =
      error.code === 'not_found'
        ? 404
        : error.code === 'forbidden'
          ? 403
          : error.code === 'conflict'
            ? 409
            : 400;
    return jsonError(status, error.code, error.message, {
      currentRevision: error.currentRevision,
    });
  }
  if (error instanceof ZodError) {
    return jsonError(400, 'invalid_payload', 'The request payload is invalid', error.issues);
  }
  console.error(error);
  return jsonError(500, 'internal_error', 'The studio could not complete the request');
}
