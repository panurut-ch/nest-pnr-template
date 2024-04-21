import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const roundsOfHashing = 10;

async function seedDataFromJson(jsonFilePath: string): Promise<void> {
  try {
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});

    const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');
    const data = JSON.parse(jsonData);

    for (const item of data) {
      const product = await prisma.product.create({
        data: {
          product_name: item.product_name,
          product_price: item.product_price,
          product_unit: item.product_unit,
        },
      });

      console.log('Created product :', product);
    }

    console.log('Data seeding completed.');

    await seedUsers();
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedUsers(): Promise<void> {
  try {
    const passwordPanurut = await bcrypt.hash(
      'password-panurut',
      roundsOfHashing,
    );
    const passwordBase = await bcrypt.hash('password-base', roundsOfHashing);

    const user1 = await prisma.user.upsert({
      where: { email: 'panurut@panurut.dev' },
      update: {
        password: passwordPanurut,
      },
      create: {
        email: 'panurut@panurut.dev',
        name: 'Panurut Chinakul',
        password: passwordPanurut,
      },
    });

    const user2 = await prisma.user.upsert({
      where: { email: 'hello@base.com' },
      update: {
        password: passwordBase,
      },
      create: {
        email: 'hello@base.com',
        name: 'base App',
        password: passwordBase,
      },
    });

    console.log('Users seeding completed.');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

const jsonFilePath = 'prisma/data.json';
seedDataFromJson(jsonFilePath);
