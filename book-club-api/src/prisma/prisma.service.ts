import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const maxRetries = 5;
    const retryDelayMs = 3000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Successfully connected to database.');
        return;
      } catch (error) {
        this.logger.warn(
          `Failed to connect to database (attempt ${attempt}/${maxRetries}): ${error instanceof Error ? error.message : String(error)}`,
        );
        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

