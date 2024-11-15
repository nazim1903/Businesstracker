export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  code: string;
  product: string;
  costPrice: number;
  salePrice: number;
  profit: number;
  customerId: string;
  createdAt: string;
  modifiedAt: string;
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  date: string;
  description: string;
  type: 'incoming' | 'outgoing' | 'company_payment' | 'personal_account' | 'deposit';
  status: 'pending' | 'completed' | 'cancelled';
  orderId?: string;
}

export interface Order {
  id: string;
  customerId: string;
  productName: string;
  details: string;
  goldKarat?: string;
  diamondCarat?: string;
  diamondType?: string;
  size?: string;
  deposit?: number;
  totalPrice: number;
  costPrice: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  depositTransferred: boolean;
  createdAt: string;
  modifiedAt: string;
  images?: string[];
}