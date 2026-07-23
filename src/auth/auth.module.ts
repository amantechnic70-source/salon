import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { UsersModule } from '../users/users.module';
import { RedisModule } from 'src/redis/redis.module';
import { MailQueueModule } from 'src/queues/mail-queue/mail-queue.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StringValue } from "ms";

@Module({
  imports: [
    UsersModule,

    PassportModule,

    JwtModule.registerAsync({

      imports: [
        ConfigModule,
      ],

      inject: [
        ConfigService,
      ],

      useFactory: (
        configService: ConfigService,
      ) => ({

        secret:
          configService.get<string>(
            "JWT_SECRET",
          ),

        signOptions: {

          expiresIn: (
            configService.get<string>(
              "JWT_EXPIRES_IN",
            ) || "1d"
          ) as StringValue,

        },

      }),

    }),
    RedisModule,
    MailQueueModule,
  ],

  controllers: [AuthController],

  providers: [AuthService],

  exports: [AuthService],
})
export class AuthModule { }