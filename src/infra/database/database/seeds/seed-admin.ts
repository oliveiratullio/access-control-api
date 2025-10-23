import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../entities/User.entity';
import { AppDataSource } from '../../../../config/typeorm.config';



async function run() {
  const ds = new DataSource({
    ...AppDataSource.options,
    entities: [UserEntity],
  });

  try {
    await ds.initialize();

    const repo = ds.getRepository(UserEntity);

    const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@local.com';
    const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';

    const already = await repo.findOne({ where: { email } });
    if (already) {
      console.log(`Admin já existe (${email}). Nada a fazer.`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = repo.create({
      name: 'Admin',
      email,
      passwordHash,
      role: 'admin',
    });

    await repo.save(admin);
    console.log('Admin criado com sucesso:');
    console.log(`  email: ${email}`);
    console.log(`  senha: ${password}`);
  } catch (err) {
    console.error('Erro ao executar seed:', err);
    process.exitCode = 1;
  } finally {
    if (ds.isInitialized) await ds.destroy();
  }
}

run();
