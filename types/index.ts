export type Role = "CLIENT" | "ADMIN" | "ENGINEER";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type ProjectStatus =
  | "PENDING"
  | "REVIEWING"
  | "QUOTED"
  | "ACTIVE"
  | "ON_HOLD"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  sku: string | null;
  featured: boolean;
  category: Category;
  categoryId: string;
  createdAt: string;
  reviews?: Review[];
  _count?: { reviews: number };
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

export interface Review {
  id: string;
  rating: number;
  body: string;
  createdAt: string;
  user: Pick<User, "id" | "name" | "image">;
}

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: MilestoneStatus;
  order: number;
  completedAt: string | null;
}

export interface Message {
  id: string;
  body: string;
  createdAt: string;
  sender: Pick<User, "id" | "name" | "image" | "role">;
}

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number | null;
  deadline: string | null;
  status: ProjectStatus;
  quote: number | null;
  depositPaid: boolean;
  balancePaid: boolean;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  client: Pick<User, "id" | "name" | "email" | "image">;
  milestones: Milestone[];
  messages: Message[];
  files: ProjectFile[];
}

export interface ProjectBriefFormData {
  title: string;
  description: string;
  budget?: number;
  deadline?: string;
  requirements: string;
  attachments?: File[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export type SortOption = "newest" | "price-asc" | "price-desc" | "popular";

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  search?: string;
  page?: number;
}
