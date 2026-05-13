export interface IScheduleAddRequestDTO {
  id: string;
  userId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface IScheduleUpdateRequestDTO {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface IScheduleFindConflictsParams {
  userId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  ignoreId?: string;
}

export interface IScheduleResponseDTO {
  id: string;
  userId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}
