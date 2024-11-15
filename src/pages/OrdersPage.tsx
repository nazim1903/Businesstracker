import { useState, useEffect } from 'react';
import { dbOperations } from '../utils/db';
import type { Customer, Order, Payment } from '../types';
import { OrderForm } from '../components/OrderForm';
import { OrderList } from '../components/OrderList';

export function OrdersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [loadedCustomers, loadedOrders, loadedPayments] = await Promise.all([
        dbOperations.getCustomers(),
        dbOperations.getOrders(),
        dbOperations.getPayments()
      ]);

      setCustomers(loadedCustomers);
      setOrders(loadedOrders);
      setPayments(loadedPayments);
    };

    loadData();
  }, []);

  const handleAddOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'modifiedAt' | 'depositTransferred'>) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      ...orderData,
      depositTransferred: false,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };

    try {
      await dbOperations.addOrder(newOrder);
      setOrders([...orders, newOrder]);

      // If there's a deposit, create a deposit payment
      if (orderData.deposit && orderData.deposit > 0) {
        const depositPayment: Payment = {
          id: Date.now().toString(),
          customerId: orderData.customerId,
          amount: orderData.deposit,
          date: new Date().toISOString(),
          description: `Deposit for ${orderData.productName}`,
          type: 'deposit',
          status: 'completed',
          orderId: newOrder.id
        };

        await dbOperations.addPayment(depositPayment);
        setPayments([...payments, depositPayment]);
      }
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    try {
      await dbOperations.updateOrder(updatedOrder);
      setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      setEditingOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await dbOperations.deleteOrder(id);
      setOrders(orders.filter(o => o.id !== id));
      // Also delete any associated payments (like deposits)
      const updatedPayments = payments.filter(p => p.orderId !== id);
      setPayments(updatedPayments);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      
      <OrderForm
        onAddOrder={handleAddOrder}
        customers={customers}
        editingOrder={editingOrder}
        onUpdateOrder={handleUpdateOrder}
      />
      
      <OrderList
        orders={orders}
        customers={customers}
        payments={payments}
        onDeleteOrder={handleDeleteOrder}
        onUpdateOrder={handleUpdateOrder}
        onEditOrder={setEditingOrder}
      />
    </div>
  );
}