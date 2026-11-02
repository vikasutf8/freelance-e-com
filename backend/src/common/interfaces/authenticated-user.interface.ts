import { UserRole } from '../../users/entities/user.entity';

export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: UserRole;
}
