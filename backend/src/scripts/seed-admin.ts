import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../users/entities/user.entity';

async function seedAdmin(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@microcart.local')
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';

  await AppDataSource.initialize();

  try {
    const usersRepository = AppDataSource.getRepository(User);
    const existingAdmin = await usersRepository.findOne({ where: { email } });

    if (existingAdmin) {
      if (existingAdmin.role !== UserRole.ADMIN) {
        existingAdmin.role = UserRole.ADMIN;
        await usersRepository.save(existingAdmin);
        console.log(`Promoted existing user to admin: ${email}`);
      } else {
        console.log(`Admin already exists: ${email}`);
      }
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = usersRepository.create({
      email,
      password: passwordHash,
      role: UserRole.ADMIN,
    });

    await usersRepository.save(admin);
    console.log(`Admin created: ${email}`);
  } finally {
    await AppDataSource.destroy();
  }
}

seedAdmin().catch((error: unknown) => {
  console.error('Failed to seed admin user');
  console.error(error);
  process.exitCode = 1;
});
