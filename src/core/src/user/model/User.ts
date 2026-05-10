import { v4 as uuid } from "uuid";

export default class User {
  public readonly id: string | undefined;

  public name?: string;
  public businessName?: string;
  public slug?: string;
  public email?: string;
  public passwordHash?: string;
  public phone?: string;
  public address?: string;

  constructor(props: Omit<User, "id">, id?: string) {
    Object.assign(this, props);

    if (!id) {
      this.id = uuid();
    }
  }
}
