// lib/zod/api-response.ts
import { z } from 'zod';

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    status_code: z.number(),
    status_message: z.string(),
    message: z.string().optional(),
    data: dataSchema.nullable(),
    timestamp: z.string().datetime().optional(), // adjust if your backend uses a different format
  });

// Example usage:
// const userResponseSchema = apiResponseSchema(userSchema);
