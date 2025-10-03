export type User = {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly displayName: string;
  readonly timezone?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type CreateUserInput = {
  readonly email: string;
  readonly passwordHash: string;
  readonly displayName: string;
  readonly timezone?: string;
};
