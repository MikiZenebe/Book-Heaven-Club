export interface AuthUser {
  googleId: string;
  email: string;
  name: string;
  picture: string | null;
}

export interface GoogleCredentialResponse {
  credential: string;
}
