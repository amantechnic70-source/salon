import {
  Global,
  Module,
  Logger,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    // 🔹 Redis Client
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Redis({
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD') || undefined,
          db: config.get<number>('REDIS_DB') || 0,
        });
      },
    },

    // 🔹 Force Redis Init at Startup
    {
      provide: 'REDIS_BOOTSTRAP',
      inject: ['REDIS_CLIENT'],
      useFactory: async (redis: Redis) => {
        const logger = new Logger('RedisModule');

        try {
          const pong = await redis.ping();
          if (pong === 'PONG') {
            logger.log('✅ Redis connected successfully');
          }
        } catch (err) {
          logger.error('❌ Redis connection failed', err);
        }

        return true;
      },
    },

    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
