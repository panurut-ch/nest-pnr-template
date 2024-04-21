import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class AllProductDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  perpage: number;

  @ApiProperty({ example: 'id' })
  @IsOptional()
  sortbycolumn?: string;

  @ApiProperty({ example: 'asc' })
  @IsOptional()
  orderby?: string;

  @ApiPropertyOptional()
  @IsOptional()
  product_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  product_price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  product_unit?: string;
}
