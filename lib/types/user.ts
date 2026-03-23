// types/user.ts
import { z } from 'zod';
import { apiResponseSchema } from '@/lib/zod/api-response';

export const userProfileSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  full_name: z.string(),
  phone_number: z.string(),
  email_verified: z.boolean(),
  phone_verified: z.boolean().optional(),
  roles: z.array(z.string()),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// API response wrapper
export const userProfileResponseSchema = apiResponseSchema(userProfileSchema);
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
