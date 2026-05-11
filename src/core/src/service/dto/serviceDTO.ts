export interface IServiceAddRequestDTO {
  userId: string;
  name: string;
  description?: string;
  durationMinutes?: number;
  priceInCents?: number;
  isActive?: boolean;
}

export interface IServiceUpdateRequestDTO {
  name?: string;
  description?: string;
  durationMinutes?: number;
  priceInCents?: number;
  isActive?: boolean;
}
