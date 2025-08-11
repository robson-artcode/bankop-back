import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.enableCors({
    origin: [ process.env.APP_URL, "http://localhost:3000" ], // Kocalhost está aqui apenas para ser opção de uso em caso de não poder rodar o Pg 
    credentials: true, 
  });

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
