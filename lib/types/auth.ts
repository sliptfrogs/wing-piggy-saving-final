// types/auth.ts
import { z } from 'zod';
import { apiResponseSchema } from '@/lib/zod/api-response';

export const loginDataSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  role: z.array(z.string()),
  access_token_expires_in: z.number(),
});

export const loginResponseSchema = apiResponseSchema(loginDataSchema);
export type LoginResponse = z.infer<typeof loginResponseSchema>;
