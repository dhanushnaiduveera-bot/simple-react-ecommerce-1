
import { CartItem } from "./CartItem";

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
}

export type OrderStatus =
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered";

export type ReturnStatus =
  | "Requested"
  | "Approved"
  | "Completed";

export interface ReturnRequest {
  reason: string;
  status: ReturnStatus;
  requestedAt: string;
}

export interface Order {
  id: string;
  username: string;
  createdAt: string;
  status: OrderStatus;
  customer: CustomerDetails;
  items: CartItem[];
  total: number;
  returnRequest?: ReturnRequest;
}

export const ORDERS_STORAGE_KEY = "shopify_demo_orders";

export const readOrders = (): Order[] => {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Order[]) : [];
  } catch {
    return [];
  }
};

export const saveOrder = (order: Order): void => {
  const orders = readOrders();
  localStorage.setItem(
    ORDERS_STORAGE_KEY,
    JSON.stringify([order, ...orders])
  );
};

export const updateOrder = (
  orderId: string,
  updates: Partial<Order>
): void => {
  const orders = readOrders().map((order) =>
    order.id === orderId ? { ...order, ...updates } : order
  );

  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
};

