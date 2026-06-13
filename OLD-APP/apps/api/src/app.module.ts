import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { ServiceRecordsModule } from './service-records/service-records.module';

@Module({
  imports: [PrismaModule, AuthModule, CustomersModule, ServiceRecordsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
