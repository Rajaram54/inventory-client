export interface CategoryType {
  categoryId: number;
  category_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface FetchCategoryApiResponse {
  data: CategoryType[];
  total: number;
  page: string;
  limit: string;
  totalPages: number;
}

export interface FetchCategoriesParams {
  page: number;
  limit: number;
}
