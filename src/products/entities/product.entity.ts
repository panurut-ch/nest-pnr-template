import { ApiProperty } from '@nestjs/swagger';
import { Product } from '@prisma/client';

export class EventEntity implements Product {
  constructor(partial: Partial<EventEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  product_name: string;

  @ApiProperty()
  product_price: number;

  @ApiProperty()
  product_unit: string;

  @ApiProperty()
  created_date: Date;

  @ApiProperty()
  updated_date: Date;
}
