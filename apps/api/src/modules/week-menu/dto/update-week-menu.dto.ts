import { PartialType } from '@nestjs/swagger';

import { CreateWeekMenuDto } from './create-week-menu.dto';

export class UpdateWeekMenuDto extends PartialType(CreateWeekMenuDto) {}
