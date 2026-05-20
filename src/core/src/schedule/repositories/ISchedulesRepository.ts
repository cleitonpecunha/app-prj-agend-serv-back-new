import Schedule from "@/core/src/schedule/model/schedule";
import {
  IScheduleFindConflictsParams,
  IScheduleResponseDTO,
  IScheduleUpdateRequestDTO,
} from "../dto/scheduleDTO";

export interface ISchedulesRepository {
  save(data: Schedule): Promise<void>;

  update(
    id: string,
    userId: string,
    data: IScheduleUpdateRequestDTO,
  ): Promise<void>;

  delete(id: string, userId: string): Promise<void>;

  findByIdUserId(id: string, userId: string): Promise<IScheduleResponseDTO>;

  findByManyUserId(userId: string): Promise<IScheduleResponseDTO[]>;

  findConflicts(
    params: IScheduleFindConflictsParams,
  ): Promise<IScheduleResponseDTO[]>;
}
