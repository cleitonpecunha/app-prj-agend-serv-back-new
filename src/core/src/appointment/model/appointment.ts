import { v4 as uuid } from "uuid";

export default class Appointment {
  public readonly id: string | undefined;

  public userId?: string;
  public serviceId?: string;
  public appointmentDate?: Date;
  public startTime?: string;
  public clientName?: string;
  public clientEmail?: string;
  public clientPhone?: string;
  public notes?: string | null;

  constructor(props: Omit<Appointment, "id">, id?: string) {
    Object.assign(this, props);

    if (!id) {
      this.id = uuid();
    }
  }
}
