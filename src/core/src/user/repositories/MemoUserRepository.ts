import User from "@/core/src/user/model/User";

export class MemoUsersRepository {
  private users: User[] = [];

  async save(user: User): Promise<void> {
    this.users.push(user);
  }

  async findMany(): Promise<User[]> {
    const users = this.users.filter((user) => user);
    return Promise.resolve(users);
  }

  async findById(id: string): Promise<User> {
    const user = this.users.find((user) => user.id === id);
    return user!;
  }

  async findByEmail(email: string): Promise<User> {
    const user = this.users.find((user) => user.email === email);
    return user!;
  }

  async findBySlug(slug: string): Promise<User> {
    const user = this.users.find((user) => user.slug === slug);
    return user!;
  }

  update(user: User): Promise<void> {
    this.users = this.users.map((u) => (u.id === user.id ? user : u));
    return Promise.resolve();
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter((user) => user.id !== id);
  }
}
