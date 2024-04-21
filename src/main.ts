import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  app.setGlobalPrefix(configService.get('API_VERSION'));

  const config = new DocumentBuilder()
    .setTitle('base API')
    .setDescription('base API document')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get('PORT') || 3000
  await app.listen(port);

  logger.log(`Application is running on port ${port}`);
}
bootstrap();
