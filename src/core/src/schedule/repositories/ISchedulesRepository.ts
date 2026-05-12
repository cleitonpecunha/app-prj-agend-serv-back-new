import Schedule from "@/core/src/schedule/model/schedule";
import { IScheduleUpdateRequestDTO } from "../dto/scheduleDTO";

export interface IScheduleRepository {
  save(data: Schedule): Promise<void>;

  findByManyUserId(userId: string): Promise<Schedule[]>;

  findById(id: string, userId: string): Promise<Schedule>;

  update(
    id: string,
    userId: string,
    data: IScheduleUpdateRequestDTO,
  ): Promise<void>;

  delete(id: string, userId: string): Promise<void>;
}
