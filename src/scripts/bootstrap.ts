import 'dotenv/config';
import { AppDataSource } from '../config/typeorm.config';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDb(maxRetries = 30, intervalMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await AppDataSource.initialize();
      return true;
    } catch (err) {
      console.log(`Aguardando banco subir (tentativa ${attempt}/${maxRetries})...`);
      await delay(intervalMs);
    } finally {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
    }
  }
  return false;
}

async function bootstrap() {
  const ready = await waitForDb();
  if (!ready) {
    console.error('Banco não ficou disponível a tempo. Abortando bootstrap.');
    process.exit(1);
  }

  await AppDataSource.initialize();
  try {
    console.log('Criando extensão uuid-ossp (se necessário)...');
    await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    console.log('Executando migrações...');
    await AppDataSource.runMigrations();
    console.log('Migrações concluídas.');
  } catch (err) {
    console.error('Falha ao preparar banco (extensão/migrações):', err);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

bootstrap().catch((err) => {
  console.error('Erro no bootstrap:', err);
  process.exit(1);
});