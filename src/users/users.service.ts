import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      console.log('create', createUserDto);
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('User email already exists.');
      }

      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        roundsOfHashing,
      );

      createUserDto.password = hashedPassword;

      const data = await this.prisma.user.create({
        data: createUserDto,
      });
      return { message: 'User Registered successfully', data };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User email already exists.');
      }
      this.logger.error(error.message);
      throw error;
    }
  }

  async findAllPaging(allUserDto): Promise<{ data: any[]; total: number }> {
    try {
      this.logger.log('findAllPaging function');
      console.log('allUserDto', allUserDto);
      const page = parseInt(allUserDto.page) || 1;
      const perpage = parseInt(allUserDto.perpage) || 10;
      const sortbycolumn = allUserDto.sortbycolumn || 'id';
      const orderby = allUserDto.orderby || 'asc';
      const skip = (page - 1) * perpage;

      const orderBy = {};
      orderBy[sortbycolumn] = orderby;

      const filterOptions: Prisma.UserWhereInput = {};
      if (allUserDto.name) {
        filterOptions.name = { contains: allUserDto.name };
      }
      if (allUserDto.email) {
        filterOptions.email = { contains: allUserDto.email };
      }

      const [data, total] = await Promise.all([
        this.prisma.user.findMany({
          where: filterOptions,
          orderBy: orderBy,
          take: perpage,
          skip: skip,
        }),
        this.prisma.user.count({ where: filterOptions }),
      ]);
      return { total, data };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      this.logger.log('findOne function id : ' + id);
      const data = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!data) {
        throw new NotFoundException('User not found.');
      }
      return { data };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      this.logger.log('update function : ' + id);
      console.log('updateUserDto', updateUserDto);

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(
          updateUserDto.password,
          roundsOfHashing,
        );
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found.');
      }

      try {
        const data = await this.prisma.user.update({
          where: { id },
          data: updateUserDto,
        });
        return { message: 'User Updated successfully', data };
      } catch (error) {
        if (error.code === 'P2002') {
          throw new ConflictException('User email already exists.');
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
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found.');
      }

      const data = await this.prisma.user.delete({
        where: { id },
      });

      return { message: 'User removed successfully', data };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
