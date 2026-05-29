export interface RequestWithUser {
  user: {
    userId: string;
    email: string;
    perfilId: string | null;
  };
}
