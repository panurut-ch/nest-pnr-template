import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  Logger,
} from '@nestjs/common';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { PrismaService } from '../../src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AllProductDto } from '../products/dto/all-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      this.logger.log('create');
      console.log('create', createProductDto);

      const existingProduct = await this.prisma.product.findUnique({
        where: { product_name: createProductDto.product_name },
      });
      if (existingProduct) {
        throw new ConflictException('Product already exists.');
      }

      const data = await this.prisma.product.create({
        data: createProductDto,
      });
      await this.invalidateCache();
      return { message: 'Product Created successfully', data };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Product already exists.');
      }
      this.logger.error(error.message);
      throw error;
    }
  }

  async findAllPaging(
    allProductDto: AllProductDto,
  ): Promise<{ data: any[]; total: number }> {
    try {
      console.log('allProductDto', allProductDto);

      const hasFilters =
        allProductDto.product_name ||
        allProductDto.product_price ||
        allProductDto.product_unit;

      if (hasFilters) {
        const page = Number(allProductDto.page) || 1;
        const perpage = Number(allProductDto.perpage) || 10;
        const sortbycolumn = allProductDto.sortbycolumn || 'id';
        const orderby = allProductDto.orderby || 'asc';
        const skip = (page - 1) * perpage;

        const orderBy = {};
        orderBy[sortbycolumn] = orderby;

        const filterOptions: Prisma.ProductWhereInput = {};
        if (allProductDto.product_name) {
          filterOptions.product_name = { contains: allProductDto.product_name };
        }
        if (allProductDto.product_unit) {
          filterOptions.product_unit = allProductDto.product_unit;
        }

        const [data, total] = await Promise.all([
          this.prisma.product.findMany({
            where: filterOptions,
            orderBy: orderBy,
            take: perpage,
            skip: skip,
          }),
          this.prisma.product.count({ where: filterOptions }),
        ]);

        console.log('Data fetched without cache due to filters:', data);
        return { total, data };
      }

      const cacheKey = 'findAllPaging';
      const cachedData: { data: any[]; total: number } =
        await this.cacheService.get(cacheKey);

      if (cachedData) {
        console.log('Data fetched from cache:', cachedData);
        return cachedData;
      }

      const page = Number(allProductDto.page) || 1;
      const perpage = Number(allProductDto.perpage) || 10;
      const sortbycolumn = allProductDto.sortbycolumn || 'id';
      const orderby = allProductDto.orderby || 'asc';
      const skip = (page - 1) * perpage;

      const orderBy = {};
      orderBy[sortbycolumn] = orderby;

      const [data, total] = await Promise.all([
        this.prisma.product.findMany({
          orderBy: orderBy,
          take: perpage,
          skip: skip,
        }),
        this.prisma.product.count(),
      ]);

      await this.cacheService.set(cacheKey, { total, data }, 3600);

      console.log('Data fetched from source and cached:', data);
      return { total, data };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      this.logger.log('findOne function id : ' + id);
      const data = await this.prisma.product.findUnique({
        where: { id },
      });
      if (!data) {
        throw new NotFoundException('Product not found.');
      }
      return { data };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      this.logger.log('update function id : ' + id);
      console.log('updateProductDto', updateProductDto);

      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException('Product not found.');
      }

      try {
        const updatedProduct = await this.prisma.product.update({
          where: { id },
          data: updateProductDto,
        });
        await this.invalidateCache();
        return {
          message: 'Product Updated successfully',
          data: updatedProduct,
        };
      } catch (error) {
        if (error.code === 'P2002') {
          throw new ConflictException('Product already exists.');
        }
        throw error;
      }
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      this.logger.log('remove function id : ' + id);
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException('Product not found.');
      }

      const data = await this.prisma.product.delete({
        where: { id },
      });
      await this.invalidateCache();
      return { message: 'Product Removed successfully', data };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async invalidateCache(): Promise<void> {
    const cacheKey = 'findAllPaging';
    const del_cache = await this.cacheService.del(cacheKey);
    this.logger.log('del_cache : ' + del_cache);
  }
}
