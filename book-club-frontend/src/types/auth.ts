export interface AuthUser {
  user: {
    id: string;
    googleId: string;
    email: string;
    name: string;
    picture: string | null;
  };
}

export interface GoogleCredentialResponse {
  credential: string;
}
