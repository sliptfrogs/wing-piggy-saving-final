export const piggyKeys = {
  all: ["piggy"] as const,
  lists: () => [...piggyKeys.all, "list"] as const,
  details: () => [...piggyKeys.all, "detail"] as const,
  detail: (id: string) => [...piggyKeys.details(), id] as const,
};


