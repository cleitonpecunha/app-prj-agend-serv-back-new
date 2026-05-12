import { MensagensPadronizadas } from "@/core/src/shared/mensagensPadronizadas";

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    if (!resource) {
      super(MensagensPadronizadas.NOT_FOUND_ERROR, 404);
    }
    //super(`${resource} não encontrado.`, 404);
    super(resource, 404);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    if (!message) {
      super(MensagensPadronizadas.UNAUTHORIZED_ERROR, 401);
    }
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    if (!message) {
      super(MensagensPadronizadas.FORBIDDEN_ERROR, 403);
    }
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export class TokenExpiredError extends AppError {
  constructor(message = MensagensPadronizadas.TOKEN_EXPIRED_ERROR) {
    super(message, 401);
    this.name = "TokenExpiredError";
  }
}
