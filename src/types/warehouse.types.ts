export interface WarehouseType {
  warehouseId: number;
  name: string;
  location: string;
}

export interface FetchWarehouseApiResponse {
  data: WarehouseType[];
  total: number;
}
