import User from "@/core/src/user/model/user";

export interface IUsersRepository {
  save(user: User): Promise<void>;

  findMany(): Promise<User[]>;

  findById(id: string): Promise<User>;

  findByEmail(email: string): Promise<User>;

  findBySlug(slug: string): Promise<User>;

  update(id: string, data: User): Promise<void>;

  delete(id: string): Promise<void>;
}
