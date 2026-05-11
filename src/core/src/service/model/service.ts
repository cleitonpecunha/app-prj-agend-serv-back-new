import { v4 as uuid } from "uuid";

export default class Service {
  public readonly id: string | undefined;

  public userId?: string;
  public name?: string;
  public description?: string;
  public durationMinutes?: number;
  public priceInCents?: number;
  public isActive: boolean = true;

  constructor(props: Omit<Service, "id">, id?: string) {
    Object.assign(this, props);

    if (!id) {
      this.id = uuid();
    }
  }
}
