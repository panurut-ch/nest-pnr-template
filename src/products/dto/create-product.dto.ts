import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Product A' })
  product_name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 50 })
  product_price: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 'Bottle' })
  product_unit: string;
}
