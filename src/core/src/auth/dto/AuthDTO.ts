export interface IAuthLoginRequestDTO {
  email: string;
  passwordHash: string;
}

export interface IAuthenticatedUserPayload {
  sub: string;
  id: string;
  email: string;
  iat: number;
  exp: number;
  tokenType?: "access" | "refresh";
}
