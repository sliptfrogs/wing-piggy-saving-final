interface ApiResponse<T> {
  data: T;
  message: string;
  status_code: number;
  status_message: string | null;
  success: boolean;
  timestamp: string | null;
}
