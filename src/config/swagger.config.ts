import {
    INestApplication,
} from '@nestjs/common';

import {
    SwaggerModule,
    DocumentBuilder,
} from '@nestjs/swagger';


export const swaggerConfig = (
    app: INestApplication,
) => {

    const config =
        new DocumentBuilder()

            .setTitle(
                'Salon Booking API',
            )

            .setDescription(
                'Salon SaaS APIs',
            )

            .setVersion('1.0')

            .addBearerAuth()

            .build();


    const document =
        SwaggerModule.createDocument(
            app,
            config,
        );


    SwaggerModule.setup(
        'api/docs',
        app,
        document,
    );

};