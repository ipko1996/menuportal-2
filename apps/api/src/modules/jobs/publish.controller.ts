// apps/api/src/app/jobs/publish.controller.ts

import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

import { ApiKeyGuard } from '@/guards/api-key.guard';

import { PublishService } from './publish.service';

@Controller('jobs')
export class PublishController {
  constructor(private readonly publishService: PublishService) {}

  @Post('publish')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('ApiKeyAuth')
  @HttpCode(202)
  async triggerPublishingJob() {
    this.publishService.triggerPublishing();

    return { message: 'Publishing job successfully initiated.' };
  }
}
