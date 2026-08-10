import { UserDocument } from '../users/schemas/user.schema';

declare global {
  namespace Express {
    interface User extends UserDocument {}
  }
}

export {};
