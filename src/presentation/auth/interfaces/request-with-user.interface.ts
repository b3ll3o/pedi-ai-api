export interface RequestWithUser {
  // Espelha o payload do JwtStrategy.validate — sem `email` (precisa de DB
  // lookup via /auth/me se o controller precisar, e JwtStrategy não inclui
  // PII no token deliberadamente).
  user: {
    userId: string;
    perfilId: string | null;
  };
}
