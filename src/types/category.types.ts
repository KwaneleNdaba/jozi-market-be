export enum CategoryStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export interface ICategory {
  id?: string;
  categoryId?: string | null; // Parent category ID (null for top-level categories)
  name: string;
  description: string;
  status: CategoryStatus | string;
  icon?: string;
  subcategories?: ICategory[]; // Nested subcategories
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateCategory {
  name: string;
  description: string;
  status: CategoryStatus | string;
  icon?: string;
  categoryId?: string | null; // For subcategories
  subcategories?: ICreateSubcategory[];
}

export interface ICreateSubcategory {
  name: string;
  description: string;
  status: CategoryStatus | string;
}

export interface IUpdateCategory {
  id: string;
  name?: string;
  description?: string;
  status?: CategoryStatus | string;
  icon?: string;
  categoryId?: string | null;
  subcategories?: ICreateSubcategory[];
}
