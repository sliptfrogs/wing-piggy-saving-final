import { accountService } from "@/lib/api/services/account.service";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "../auth/useSession";

export const piggyKeys = {
  all: ["piggy"] as const,
  lists: () => [...piggyKeys.all, "list"] as const,
  details: () => [...piggyKeys.all, "detail"] as const,
  detail: (id: string) => [...piggyKeys.details(), id] as const,
};


