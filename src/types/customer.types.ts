export interface CustomerType {
  customer_id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface FetchCustomerApiResponse {
  data: CustomerType[];
  total: number;
  page: string;
  limit: string;
  totalPages: number;
}

export interface FetchCustomersParams {
  page: number;
  limit: number;
}
