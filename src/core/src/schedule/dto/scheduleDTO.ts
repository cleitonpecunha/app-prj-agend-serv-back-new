export interface IScheduleAddRequestDTO {
  userId: string;
  dayOfWeek: string;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

export interface IScheduleUpdateRequestDTO {
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}
