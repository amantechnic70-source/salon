import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SalonsModule } from './salons/salons.module';
import { StaffModule } from './staff/staff.module';
import { ServicesModule } from './services/services.module';
import { CustomersModule } from './customers/customers.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PaymentsModule } from './payments/payments.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CouponsModule } from './coupons/coupons.module';
import { ReviewsModule } from './reviews/reviews.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReportsModule } from './reports/reports.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { JwtModule } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';
import { QueuesModule } from './queues/queues.module';
import { SubscriptionModule } from './subscriptions/subscriptions.module';
import { BranchModule } from './branches/branches.module';
import { AdminModule } from './admin/admin.module';

@Module({

  imports: [

    ConfigModule.forRoot({

      isGlobal: true,

    }),


    // JwtModule.register({

    //   secret:
    //     process.env.JWT_SECRET,

    //   signOptions: {

    //     expiresIn:

    //       (
    //         process.env.JWT_EXPIRES_IN
    //         ?? '1d'
    //       ) as StringValue,

    //   },

    // }),


    MongooseModule.forRootAsync({

      inject: [

        ConfigService,

      ],

      useFactory: (

        configService: ConfigService,

      ) => ({

        uri:

          configService.get<string>(
            "MONGODB_URI",
          ),

      }),

    }),


    AuthModule,

    UsersModule,

    SalonsModule,

    BranchModule,

    StaffModule,

    CustomersModule,

    ServicesModule,

    AppointmentsModule,

    PaymentsModule,

    TransactionsModule,

    SubscriptionModule,

    CouponsModule,

    ReviewsModule,

    InvoicesModule,

    ReportsModule,

    DashboardModule,

    NotificationsModule,

    MailModule,

    RedisModule,

    QueuesModule,

    AdminModule,

  ],

})
export class AppModule { }