import Dexie from 'dexie';
import type { Customer, Product, Payment, Order } from '../types';

class BusinessDB extends Dexie {
  customers!: Dexie.Table<Customer, string>;
  products!: Dexie.Table<Product, string>;
  payments!: Dexie.Table<Payment, string>;
  orders!: Dexie.Table<Order, string>;

  constructor() {
    super('BusinessDB');
    this.version(1).stores({
      customers: 'id, name, email, phone, createdAt',
      products: 'id, code, product, customerId, createdAt, modifiedAt',
      payments: 'id, customerId, date, type, status, orderId',
      orders: 'id, customerId, status, depositTransferred, createdAt, modifiedAt'
    });
  }
}

const db = new BusinessDB();

export const dbOperations = {
  async getCustomers(): Promise<Customer[]> {
    return await db.customers.toArray();
  },

  async addCustomer(customer: Customer): Promise<void> {
    await db.customers.add(customer);
  },

  async updateCustomer(customer: Customer): Promise<void> {
    await db.customers.put(customer);
  },

  async deleteCustomer(id: string): Promise<void> {
    await db.transaction('rw', [db.customers, db.products, db.payments, db.orders], async () => {
      await db.customers.delete(id);
      await db.products.where('customerId').equals(id).delete();
      await db.payments.where('customerId').equals(id).delete();
      await db.orders.where('customerId').equals(id).delete();
    });
  },

  async getProducts(): Promise<Product[]> {
    return await db.products.toArray();
  },

  async addProduct(product: Product): Promise<void> {
    await db.products.add(product);
  },

  async updateProduct(product: Product): Promise<void> {
    await db.products.put(product);
  },

  async deleteProduct(id: string): Promise<void> {
    await db.products.delete(id);
  },

  async getPayments(): Promise<Payment[]> {
    return await db.payments.toArray();
  },

  async addPayment(payment: Payment): Promise<void> {
    await db.payments.add(payment);
  },

  async updatePayment(payment: Payment): Promise<void> {
    await db.payments.put(payment);
  },

  async deletePayment(id: string): Promise<void> {
    await db.payments.delete(id);
  },

  async getOrders(): Promise<Order[]> {
    return await db.orders.toArray();
  },

  async addOrder(order: Order): Promise<void> {
    await db.orders.add(order);
  },

  async updateOrder(order: Order): Promise<void> {
    await db.orders.put(order);
  },

  async deleteOrder(id: string): Promise<void> {
    await db.transaction('rw', [db.orders, db.payments], async () => {
      await db.orders.delete(id);
      await db.payments.where('orderId').equals(id).delete();
    });
  },

  async exportData(): Promise<void> {
    const data = {
      customers: await db.customers.toArray(),
      products: await db.products.toArray(),
      payments: await db.payments.toArray(),
      orders: await db.orders.toArray(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `business_manager_backup_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  async importData(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      await db.transaction('rw', [db.customers, db.products, db.payments, db.orders], async () => {
        await db.customers.clear();
        await db.products.clear();
        await db.payments.clear();
        await db.orders.clear();
        
        await db.customers.bulkAdd(data.customers);
        await db.products.bulkAdd(data.products);
        await db.payments.bulkAdd(data.payments);
        if (data.orders) {
          await db.orders.bulkAdd(data.orders);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
};