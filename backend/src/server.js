import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

connectDatabase()
  .then(() => {
    app.listen(env.port, () => console.log(`API BIM ouvindo na porta ${env.port}`));
  })
  .catch((error) => {
    console.error('Falha ao iniciar API:', error);
    process.exit(1);
  });
