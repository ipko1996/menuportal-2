import { Module } from '@nestjs/common';

import { DishtypeController } from './dishtype.controller';
import { DishtypeService } from './dishtype.service';

@Module({
  controllers: [DishtypeController],
  providers: [DishtypeService],
})
export class DishtypeModule {}
