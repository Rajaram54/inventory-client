export interface SupplierType {
  supplierId: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface FetchSupplierApiResponse {
  data: SupplierType[];
  total: number;
}
