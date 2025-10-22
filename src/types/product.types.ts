export interface ProductType {
  productId : number;
  name: string;
  categoryId: number;
  subCategoryId?: number;
  brandId: number;
  supplierId: number;
  buyingUomId: string;
  sellingUomId: string;
  description: string;
  price: number;
  sku: string;
  image_url: string;
}
