import { useState, useEffect } from 'react';
import { dbOperations } from '../utils/db';
import type { Customer, Payment, Order, Product } from '../types';
import { PaymentForm } from '../components/PaymentForm';
import { PaymentList } from '../components/PaymentList';

export function PaymentsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [loadedCustomers, loadedPayments, loadedOrders, loadedProducts] = await Promise.all([
        dbOperations.getCustomers(),
        dbOperations.getPayments(),
        dbOperations.getOrders(),
        dbOperations.getProducts()
      ]);

      setCustomers(loadedCustomers);
      setPayments(loadedPayments);
      setOrders(loadedOrders);
      setProducts(loadedProducts);
    };

    loadData();
  }, []);

  const handleAddPayment = async (
    customerId: string,
    amount: number,
    description: string,
    type: Payment['type'],
    status: 'pending' | 'completed' | 'cancelled',
    date: string,
    orderId?: string,
    isOrderCompletion?: boolean,
    costPrice?: number
  ) => {
    const newPayment: Payment = {
      id: Date.now().toString(),
      customerId,
      amount,
      date,
      description,
      type,
      status,
      orderId
    };

    try {
      await dbOperations.addPayment(newPayment);
      setPayments([...payments, newPayment]);

      if (orderId && isOrderCompletion && status === 'completed') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          // Create a new product entry for the completed sale
          // Use the order's creation date for the sale date
          const newProduct: Product = {
            id: Date.now().toString(),
            code: `SALE-${order.id}`,
            product: order.productName,
            costPrice: costPrice || (order.totalPrice * 0.7),
            salePrice: order.totalPrice,
            profit: order.totalPrice - (costPrice || (order.totalPrice * 0.7)),
            customerId: order.customerId,
            createdAt: order.createdAt, // Use the order's original creation date
            modifiedAt: new Date().toISOString()
          };

          await dbOperations.addProduct(newProduct);
          setProducts([...products, newProduct]);

          // Keep the deposit payment in the system but mark the order as completed
          const updatedOrder = {
            ...order,
            status: 'completed' as const,
            depositTransferred: true,
            modifiedAt: new Date().toISOString()
          };
          await dbOperations.updateOrder(updatedOrder);
          setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
        }
      }
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      await dbOperations.deletePayment(id);
      setPayments(payments.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
      
      <PaymentForm
        onAddPayment={handleAddPayment}
        customers={customers}
        orders={orders}
        payments={payments}
      />
      
      <PaymentList
        payments={payments}
        customers={customers}
        onDeletePayment={handleDeletePayment}
      />
    </div>
  );
}