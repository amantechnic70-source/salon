import { NestFactory } from '@nestjs/core';

import { ValidationPipe } from '@nestjs/common';

import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

import { swaggerConfig } from './config/swagger.config';



async function bootstrap() {

    const app =
        await NestFactory.create(
            AppModule,
        );


    // API PREFIX

    app.setGlobalPrefix(
        'api/v1',
    );


    // CORS

    app.enableCors({

        origin:
            process.env.FRONTEND_URL,

        credentials: true,

    });


    // COOKIE PARSER

    app.use(
        cookieParser(),
    );


    // VALIDATION PIPE

    app.useGlobalPipes(

        new ValidationPipe({

            whitelist: true,

            transform: true,

            forbidNonWhitelisted: true,

        }),

    );


    // SWAGGER

    swaggerConfig(app);


    // PORT

    await app.listen(

        process.env.PORT ??
        5000,

    );


    console.log(

        `Application running on Port : ${process.env.PORT}`,

    );

}


bootstrap();