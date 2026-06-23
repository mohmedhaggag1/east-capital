export interface UserAddress {
  first_name: string;
  last_name: string;
}

export interface UserData {
  email_address: string;
  phone_number: string;
  address: UserAddress;
}

export interface ApplicationSubmittedParams {
  application_id: string;
  major_of_interest: string;
  application_semester: string;
  user_data: UserData;
}

export interface PaymentCompletedParams {
  transaction_id: string;
  value: number;
  currency: string;
  user_data: UserData;
}