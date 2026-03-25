import { z } from 'zod';

export const accountSchema = z.object({
  id: z.string(),
  account_number: z.string(),
  account_type: z.string(),
  created_at: z.string(),
  currency: z.string(),
  current_balance: z.number(),
  is_public: z.boolean(),
  hide_balance: z.boolean().optional(),
  piggy_goal_id: z.string().nullable(),
  public: z.boolean(),
  updated_at: z.string().datetime().nullable(),
  user_id: z.string(),
});

export type Account = z.infer<typeof accountSchema>;

export const accountListSchema = z.array(accountSchema);
