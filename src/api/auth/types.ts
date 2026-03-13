export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string,
  expiresInSeconds: number
}

export interface User {
  idResponsavel?: number;
  name: string;
  username: string;
  email: string;
  avatar: string;
  perfil: string;
}
