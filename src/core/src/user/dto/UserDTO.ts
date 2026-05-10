export interface IUserRegisterRequestDTO {
  name: string;
  businessName: string;
  slug: string;
  email: string;
  passwordHash: string;
  phone: string;
  address: string;
}

export interface IUserUpdateRequestDTO {
  name: string;
  businessName: string;
  phone: string;
  address: string;
}
