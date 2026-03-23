// lib/api/types.ts
// ============== Auth ==============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  email: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: string[];
  access_token_expires_in: number;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
}

export interface RegisterResponse {
  status: 'PENDING' | 'PENDING_VERIFICATION';
  data: {
    user_id: string | null;
    email: string;
    OTP_expires_in: number;
  };
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}

// ============== User ==============
export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  phone_number: string;
  email_verified: boolean;
  roles: string[];
}

// ============== Piggy ==============
export interface PiggyBank {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED';
}

// ============== Transaction ==============
export interface Transaction {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  status: 'PENDING' | 'COMPLETED';
  created_at: string;
}
