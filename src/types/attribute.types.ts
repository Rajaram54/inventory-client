export interface AttributeType {
  id: number;
  name: string;
  code: string;
  data_type: 'number' | 'text' | 'boolean';
  uom_id: number;
  is_multi_value: boolean;
  created_at: string;
}

export interface FetchAttributeApiResponse {
  data: AttributeType[];
  total: number;
}
