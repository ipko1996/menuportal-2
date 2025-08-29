import { Module } from '@nestjs/common';

import { SharedModule } from '@/shared/shared.module';

import { PostService } from './post.service';

@Module({
  imports: [SharedModule],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
