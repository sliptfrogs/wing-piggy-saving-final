import { z } from "zod";

export const piggyAccountSchema = z.object({
  account_id: z.string().uuid(),
  account_number: z.string(),
  balance: z.number(),
  created_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+$/), // Accepts any number of decimal places
  currency: z.string(),
  current_balance: z.number(),
  goal_name: z.string(),
  goal_status: z.string(),
  is_public: z.boolean(),
  lock_expires_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+$/),
  locked_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+$/),
  piggy_goal_id: z.string().uuid(),
  public: z.boolean(),
  target_amount: z.number(),
  user_id: z.string().uuid(),
});

export const piggyAccountListSchema = z.array(piggyAccountSchema);
export type PiggyAccount = z.infer<typeof piggyAccountSchema>;
export type PiggyAccountList = z.infer<typeof piggyAccountListSchema>;
