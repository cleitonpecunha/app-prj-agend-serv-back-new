import Schedule from "@/core/src/schedule/model/schedule";
import {
  IScheduleResponseDTO,
  IScheduleUpdateRequestDTO,
} from "../dto/scheduleDTO";

export interface ISchedulesRepository {
  save(data: Schedule): Promise<void>;

  findByManyUserId(userId: string): Promise<IScheduleResponseDTO[]>;

  findById(id: string, userId: string): Promise<Schedule>;

  findConflicts(params: {
    userId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    ignoreId?: string;
  }): Promise<Schedule[]>;

  update(
    id: string,
    userId: string,
    data: IScheduleUpdateRequestDTO,
  ): Promise<void>;

  delete(id: string, userId: string): Promise<void>;
}
