import Service from "@/core/src/service/model/service";
import { IServiceUpdateRequestDTO } from "../dto/serviceDTO";

export interface IServicesRepository {
  save(data: Service): Promise<void>;

  findByManyUserId(userId: string): Promise<Service[]>;

  findByIdUserId(id: string, userId: string): Promise<Service>;

  findById(id: string): Promise<Service>;

  update(
    id: string,
    userId: string,
    data: IServiceUpdateRequestDTO,
  ): Promise<void>;

  delete(id: string, userId: string): Promise<void>;

  hasAppointments(idService: string): Promise<boolean>;
}
