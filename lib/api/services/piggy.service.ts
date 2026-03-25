// lib/api/services/piggy.service.ts

import { CreatePiggyRequest, PiggyGoal } from "@/lib/types/piggy";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { PiggyGoalDetail } from "@/types/piggy-goal-detail";

/**
 * Response structure for create/update operations.
 * The actual goal is inside `data.piggyGoal`.
 */
interface PiggyGoalResponse {
  account: unknown | null;
  piggyGoal: PiggyGoal;
}

export const piggyService = {
  /**
   * Fetch all piggy goals for the current user.
   */
  getAll: (): Promise<PiggyGoalDetail[]> =>
    apiClient.get<PiggyGoalDetail[]>(API_ENDPOINTS.piggy.list),

  /**
   * Create a new piggy goal.
   * Request body uses camelCase as expected by the backend.
   */
  create: async (data: CreatePiggyRequest): Promise<PiggyGoal> => {
    // The response is wrapped in a PiggyGoalResponse, we extract the goal.
    const response = await apiClient.post<PiggyGoalResponse>(
      API_ENDPOINTS.piggy.create,
      data,
      { requiresAuth: true },
    );
    return response.piggyGoal;
  },
  getByAccountNumber: async (
    token: string,
    accountNumber: string,
  ): Promise<PiggyGoalDetail> => {
    return apiClient.get<PiggyGoalDetail>(
      API_ENDPOINTS.piggy.get_by_accountNumber(accountNumber),
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  },
};
