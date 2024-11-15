import { useState, useEffect } from 'react';
import { dbOperations } from '../utils/db';
import type { Customer, Product, Payment, Order } from '../types';
import { CashFlow } from '../components/CashFlow';
import { DataBackup } from '../components/DataBackup';

export function DashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [
        loadedCustomers,
        loadedProducts,
        loadedPayments,
        loadedOrders
      ] = await Promise.all([
        dbOperations.getCustomers(),
        dbOperations.getProducts(),
        dbOperations.getPayments(),
        dbOperations.getOrders()
      ]);

      setCustomers(loadedCustomers);
      setProducts(loadedProducts);
      setPayments(loadedPayments);
      setOrders(loadedOrders);
    };

    loadData();
  }, []);

  const handleDataImport = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <DataBackup onImport={handleDataImport} />
      <CashFlow
        payments={payments}
        customers={customers}
        products={products}
        orders={orders}
      />
    </div>
  );
}