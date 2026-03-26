export interface AuthUser {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  roles: string[];
  accessTokenExpires: number; // milliseconds timestamp
}
