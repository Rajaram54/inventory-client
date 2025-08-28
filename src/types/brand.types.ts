export interface BrandType {
  brandId: number;
  brandName: string;
  description: string;
}

export interface FetchBrandApiResponse {
  data: BrandType[];
  total: number;
}
