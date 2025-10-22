export interface SubcategoryType {
  subCategoryId: number;
  name: string;
  categoryId: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface FetchSubcategoryApiResponse {
  data: SubcategoryType[];
  total: number;
  page: string;
  limit: string;
  totalPages: number;
}

export interface FetchSubcategoriesParams {
  page: number;
  limit: number;
}
