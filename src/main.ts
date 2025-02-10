import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

import { DOMPurifyPipe } from './pipes/sanitize.pipe';
import { GlobalExceptionFilter } from './filters/requests-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  /*
   Commented out because it does not launch GraphQL playground
   https://stackoverflow.com/questions/65441260/nestjs-graphql-playground-access
  */
  // add secure headers
  // app.use(
  //   helmet({
  //     crossOriginResourcePolicy: { policy: "same-origin" },
  //   }),
  // );

 // allow CORS
  app.enableCors({
    origin: '*', // If you need only certain domains: ['https://example.com']
    methods: 'GET,POST,PUT,DELETE,PATCH',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // If the API uses cookies
  });

  // global XSS Pipe
  app.useGlobalPipes(new DOMPurifyPipe());

  // global error handler
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();
