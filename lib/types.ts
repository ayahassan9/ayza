// Database Types
export type UserRole = 'admin' | 'staff';
export type ProductCategory = 'necklace' | 'bracelet' | 'earrings' | 'watch' | 'ring';

export interface Profile {
  id: string;
  role: UserRole;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  variant_name: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  user_id: string;
  total_amount: number;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  variant_id: string;
  quantity_sold: number;
  price_at_sale: number;
  created_at: string;
}

// Extended types with relations
export interface ProductWithVariants extends Product {
  product_variants: ProductVariant[];
}

export interface ProductVariantWithProduct extends ProductVariant {
  product: Product;
}

export interface SaleWithItems extends Sale {
  sale_items: (SaleItem & {
    product_variant: ProductVariantWithProduct;
  })[];
  profiles: Profile;
}

export interface SaleItemWithDetails extends SaleItem {
  product_variant: ProductVariantWithProduct;
}

// View types
export interface LowStockItem {
  id: string;
  sku: string;
  variant_name: string;
  product_name: string;
  category: ProductCategory;
  stock_quantity: number;
  low_stock_threshold: number;
  price: number;
}

export interface BestSellingProduct {
  variant_id: string;
  product_name: string;
  variant_name: string;
  category: ProductCategory;
  total_sold: number;
  total_revenue: number;
}

export interface SalesAnalytics {
  sale_date: string;
  number_of_sales: number;
  total_revenue: number;
  total_items_sold: number;
  average_sale_amount: number;
}

// Form types
export interface CreateProductForm {
  name: string;
  description?: string;
  category: ProductCategory;
  image_url?: string;
  variant_name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
}

export interface CreateVariantForm {
  product_id: string;
  variant_name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
}

export interface UpdateVariantForm {
  variant_name?: string;
  sku?: string;
  price?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
}

export interface SaleItemInput {
  variant_id: string;
  quantity: number;
  price_at_sale: number;
}

export interface CreateSaleInput {
  items: SaleItemInput[];
  user_id: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  totalItemsSold: number;
  lowStockCount: number;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  revenue: number;
  sales: number;
}

export type TimeRange = 'daily' | 'monthly';
