import User from "@/core/src/user/model/User";
import { IUsersRepository } from "./IUserRepository";
import { prisma } from "@/lib/prisma";

export class PostgresUsersRepository implements IUsersRepository {
  async save(data: User): Promise<void> {
    await prisma.user.create({
      data: data as Parameters<typeof prisma.user.create>[0]["data"],
    });
  }

  async findMany(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users;
  }

  async findById(id: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user!;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user!;
  }

  async findBySlug(slug: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { slug } });
    return user!;
  }

  async update(id: string, data: User): Promise<void> {
    const { id: _id, ...payload } = data;

    await prisma.user.update({
      where: { id },
      data: payload as Parameters<typeof prisma.user.update>[0]["data"],
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
