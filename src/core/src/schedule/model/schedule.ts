import { v4 as uuid } from "uuid";

export default class Schedule {
  public readonly id: string | undefined;

  public userId?: string;
  public dayOfWeek?: string;
  public startTime?: string;
  public endTime?: string;
  public isActive: boolean = true;

  constructor(props: Omit<Schedule, "id">, id?: string) {
    Object.assign(this, props);

    if (!id) {
      this.id = uuid();
    }
  }
}
