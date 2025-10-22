export interface StockMovementType {
  movement_id: number;
  product_id: number;
  quantity: number;
  movement_type: 'in' | 'out';
  date: string;
  warehouse_id: number;
  supplier_id?: number;
  created_at: string;
  updated_at: string;
}

export interface FetchStockMovementApiResponse {
  data: StockMovementType[];
  total: number;
  page: string;
  limit: string;
  totalPages: number;
}

export interface FetchStockMovementsParams {
  page: number;
  limit: number;
}
