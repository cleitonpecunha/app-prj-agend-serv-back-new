export interface IUserAddRequestDTO {
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

export interface IUserMailRegisterConfirmationDTO {
  userName: string;
  descriptionBusinessName: string;
}
