export type UserRole = 'admin' | 'client';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  stock: number;
  createdBy: number | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedProducts {
  data: Product[];
  meta: PaginationMeta;
}

export interface CartProduct {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  stock: number;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  priceAtAdd: number;
  subtotal: number;
  product: CartProduct;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export type PaymentStatus = 'pending' | 'success' | 'failed';
export type PaymentMode = 'mock' | 'manual';

export interface Payment {
  id: number;
  cartId: number;
  upiId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  upiLink: string;
  utr: string | null;
  failureReason: string | null;
  reviewedAt: string | null;
  mode: PaymentMode;
}

export interface PaymentConfig {
  upiId: string;
  payeeName: string;
  note: string;
  mode: PaymentMode;
  qrImageUrl: string | null;
}

export interface AdminPayment extends Payment {
  userId: number;
  customerEmail: string | null;
  itemCount: number;
}

export interface PaginatedPayments {
  data: AdminPayment[];
  meta: PaginationMeta;
}

export type OrderStatus = 'paid';

export interface OrderItem {
  id: number;
  productId: number | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  userId: number;
  customerEmail: string | null;
  paymentId: number;
  total: number;
  status: OrderStatus;
  itemCount: number;
  createdAt: string;
  items: OrderItem[];
}

export interface PaginatedOrders {
  data: Order[];
  meta: PaginationMeta;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors: string[];
}

export interface ProductPayload {
  name: string;
  price: number;
  stock: number;
  description?: string | null;
  image?: string | null;
}
