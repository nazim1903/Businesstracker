import type { Customer, Product, Payment } from '../types';

interface AppData {
  customers: Customer[];
  products: Product[];
  payments: Payment[];
  version: string;
}

export function exportData(customers: Customer[], products: Product[], payments: Payment[]): void {
  const data: AppData = {
    customers,
    products,
    payments,
    version: '1.0.0', // For future compatibility checks
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
}

export function importData(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Basic validation
        if (!data.customers || !data.products || !data.payments || !data.version) {
          throw new Error('Invalid backup file format');
        }

        // Convert date strings back to Date objects
        data.customers = data.customers.map((customer: any) => ({
          ...customer,
          createdAt: new Date(customer.createdAt)
        }));

        data.products = data.products.map((product: any) => ({
          ...product,
          createdAt: new Date(product.createdAt),
          modifiedAt: new Date(product.modifiedAt)
        }));

        data.payments = data.payments.map((payment: any) => ({
          ...payment,
          date: new Date(payment.date)
        }));

        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse backup file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read backup file'));
    reader.readAsText(file);
  });
}