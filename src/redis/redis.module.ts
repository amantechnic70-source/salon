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
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
      
        const redis = new Redis({
          host: config.get<string>('REDIS_HOST'),
          port: Number(config.get<string>('REDIS_PORT')),
          username: config.get<string>('REDIS_USERNAME') || undefined,
          password: config.get<string>('REDIS_PASSWORD') || undefined,
          db: Number(config.get<string>('REDIS_DB') || 0),
        });

        redis.on('connect', () => {
          console.log('🔄 Redis connecting...');
        });

        redis.on('ready', () => {
          console.log('✅ Redis ready');
        });

        redis.on('error', (err) => {
          console.error('❌ Redis error:', err.message);
        });

        redis.on('close', () => {
          console.log('🔴 Redis connection closed');
        });

        return redis;
      },
    },

    {
      provide: 'REDIS_BOOTSTRAP',
      inject: ['REDIS_CLIENT'],
      useFactory: async (redis: Redis) => {
        const logger = new Logger('RedisModule');

        try {
          const pong = await redis.ping();

          if (pong === 'PONG') {
            logger.log('✅ Redis connected successfully');
          } else {
            logger.warn(`⚠️ Redis ping returned: ${pong}`);
          }
        } catch (err) {
          logger.error(
            '❌ Redis connection failed',
            err instanceof Error ? err.stack : String(err),
          );
        }

        return true;
      },
    },

    RedisService,
  ],

  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule { }