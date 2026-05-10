import { prisma } from "@/lib/prisma";

interface ProviderWriteData {
  name: string;
  businessName: string;
  slug: string;
  email: string;
  passwordHash: string;
  phone: string;
  address: string;
}

interface ProviderUpdateData {
  name: string;
  businessName: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
}

export const providerRepository = {
  async create(data: ProviderWriteData) {
    return prisma.provider.create({ data });
  },

  async findById(id: number) {
    return prisma.provider.findUnique({ where: { id } });
  },

  async findByEmail(email: string) {
    return prisma.provider.findUnique({ where: { email } });
  },

  async findBySlug(slug: string) {
    return prisma.provider.findUnique({ where: { slug } });
  },

  async update(id: number, data: ProviderUpdateData) {
    return prisma.provider.update({ where: { id }, data });
  },

  async delete(id: number) {
    await prisma.provider.delete({ where: { id } });
  },
};
