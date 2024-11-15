import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Calendar } from 'lucide-react';
import type { Customer, Payment, Order } from '../types';

interface PaymentFormProps {
  onAddPayment: (
    customerId: string,
    amount: number,
    description: string,
    type: Payment['type'],
    status: 'pending' | 'completed' | 'cancelled',
    date: string,
    orderId?: string,
    isOrderCompletion?: boolean,
    costPrice?: number
  ) => void;
  customers: Customer[];
  orders: Order[];
  payments: Payment[];
}

export function PaymentForm({ onAddPayment, customers = [], orders = [], payments = [] }: PaymentFormProps) {
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Payment['type']>('incoming');
  const [status, setStatus] = useState<'pending' | 'completed' | 'cancelled'>('completed');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderId, setOrderId] = useState('');
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [isCompletingOrder, setIsCompletingOrder] = useState(false);
  const [costPrice, setCostPrice] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (customerId) {
      const availableOrders = orders.filter(
        order => order.customerId === customerId && 
        (order.status === 'pending' || order.status === 'in_progress') &&
        !order.depositTransferred
      );
      setCustomerOrders(availableOrders);
    } else {
      setCustomerOrders([]);
      setOrderId('');
      setSelectedOrder(null);
      setDepositAmount(0);
      setRemainingAmount(0);
      setIsCompletingOrder(false);
      setCostPrice(undefined);
    }
  }, [customerId, orders]);

  useEffect(() => {
    if (orderId) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
        // Find deposit payment for this order
        const deposit = payments.find(
          p => p.orderId === orderId && p.type === 'deposit' && p.status === 'completed'
        );
        const depositAmt = deposit?.amount || 0;
        setDepositAmount(depositAmt);
        setDescription(`Final payment for ${order.productName}`);
        
        // Calculate remaining amount after deposit
        const total = order.totalPrice;
        if (typeof total === 'number') {
          const remaining = Math.max(0, total - depositAmt);
          setRemainingAmount(remaining);
          setAmount(remaining.toString());
        }
        setIsCompletingOrder(true);
        setCostPrice(order.costPrice);
      }
    } else {
      setSelectedOrder(null);
      setDepositAmount(0);
      setRemainingAmount(0);
      setAmount('');
      setDescription('');
      setIsCompletingOrder(false);
      setCostPrice(undefined);
    }
  }, [orderId, orders, payments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if ((!customerId && type !== 'company_payment' && type !== 'personal_account') || isNaN(numAmount) || !description) return;

    if (isCompletingOrder && selectedOrder) {
      // For order completion, create a new payment for the remaining amount
      onAddPayment(
        customerId,
        numAmount, // Only the remaining amount
        description,
        'incoming',
        status,
        date,
        orderId,
        true, // This indicates it's an order completion payment
        costPrice // Pass the cost price for profit calculation
      );
    } else {
      onAddPayment(
        type === 'company_payment' ? 'COMPANY' :
        type === 'personal_account' ? 'PERSONAL' : customerId,
        numAmount,
        description,
        type,
        status,
        date,
        orderId,
        false,
        undefined
      );
    }

    // Reset form
    setCustomerId('');
    setAmount('');
    setDescription('');
    setType('incoming');
    setStatus('completed');
    setDate(new Date().toISOString().split('T')[0]);
    setOrderId('');
    setSelectedOrder(null);
    setDepositAmount(0);
    setRemainingAmount(0);
    setIsCompletingOrder(false);
    setCostPrice(undefined);
  };

  const handleTypeChange = (newType: Payment['type']) => {
    setType(newType);
    if (newType === 'company_payment' || newType === 'personal_account') {
      setCustomerId('');
      setOrderId('');
      setSelectedOrder(null);
      setDepositAmount(0);
      setRemainingAmount(0);
      setIsCompletingOrder(false);
      setCostPrice(undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as Payment['type'])}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isCompletingOrder}
          >
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
            <option value="company_payment">Notte Payment</option>
            <option value="personal_account">Personal Account (Fatih KARA)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={type === 'company_payment' || type === 'personal_account'}
            required={type !== 'company_payment' && type !== 'personal_account'}
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {customerOrders.length > 0 && type === 'incoming' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order (Optional)
            </label>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an order</option>
              {customerOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.productName} (Total: ${order.totalPrice?.toFixed(2) || '0.00'})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount ($)
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'pending' | 'completed' | 'cancelled')}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Payment description"
            required
          />
        </div>
      </div>

      {selectedOrder && (
        <div className="mt-4 p-4 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Order Summary:</strong>
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            <li>Total Price: ${selectedOrder.totalPrice?.toFixed(2) || '0.00'}</li>
            <li>Previous Deposit: ${depositAmount.toFixed(2)}</li>
            <li>Remaining Balance: ${remainingAmount.toFixed(2)}</li>
            {costPrice !== undefined && <li>Cost Price: ${costPrice.toFixed(2)}</li>}
          </ul>
          {depositAmount > 0 && (
            <p className="mt-2 text-sm text-amber-800">
              The deposit of ${depositAmount.toFixed(2)} will be automatically included in the final payment.
              Please enter the remaining balance of ${remainingAmount.toFixed(2)} to complete the payment.
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {isCompletingOrder ? 'Complete Order Payment' : 'Add Payment'}
        </button>
      </div>
    </form>
  );
}