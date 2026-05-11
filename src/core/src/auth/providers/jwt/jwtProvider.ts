import jwt from "jsonwebtoken";

export default class JwtProvider {
  constructor(
    private segredoToken: string,
    private segredoRefreshToken: string,
  ) {}

  gerarAccessToken(payload: string | object): string {
    return jwt.sign(payload, this.segredoToken, { expiresIn: "4h" });
  }

  gerarRefreshToken(payload: string | object): string {
    return jwt.sign(payload, this.segredoRefreshToken, { expiresIn: "15m" });
  }

  validarAccessToken(token: string): string | object {
    return jwt.verify(token, this.segredoToken);
  }

  validarRefreshToken(token: string): string | object {
    return jwt.verify(token, this.segredoRefreshToken);
  }
}
