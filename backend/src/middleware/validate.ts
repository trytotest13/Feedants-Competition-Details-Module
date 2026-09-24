import { Request, RequestHandler, Response } from 'express';
import { AnyZodObject, ZodEffects } from 'zod';

type ZodSchema = AnyZodObject | ZodEffects<AnyZodObject>;

/**
 * Validate + coerce a request segment through a zod schema.
 * Parsed (and therefore whitelisted) data replaces the original — unknown or
 * client-forged fields never reach controllers.
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body'): RequestHandler {
  return (req: Request, res: Response, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        },
      });
      return;
    }
    if (source === 'query') {
      // Express 5 makes req.query a getter; assign via defineProperty replacement
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
      });
    } else {
      (req as unknown as Record<string, unknown>)[source] = result.data;
    }
    next();
  };
}
