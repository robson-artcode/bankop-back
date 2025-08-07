import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita o CORS para o frontend
  app.enableCors({
    origin: 'http://localhost:3000', // Permite apenas seu frontend
    credentials: true, // Se estiver usando cookies ou headers como Authorization
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
