import { useState } from 'react';
import { Trash2, Users, Filter } from 'lucide-react';
import type { Payment, Customer } from '../types';

interface PaymentListProps {
  payments: Payment[];
  customers: Customer[];
  onDeletePayment: (id: string) => void;
}

export function PaymentList({ payments = [], customers = [], onDeletePayment }: PaymentListProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const getCustomerName = (customerId: string) => {
    if (customerId === 'COMPANY') return 'Notte Payment';
    if (customerId === 'PERSONAL') return 'Fatih KARA';
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const formatNumber = (value: number): string => {
    return value ? value.toFixed(2) : '0.00';
  };

  // Filter payments by customer and status
  const filteredPayments = payments.filter(payment => {
    const matchesCustomer = selectedCustomerId ? payment.customerId === selectedCustomerId : true;
    const matchesStatus = selectedStatus ? payment.status === selectedStatus : true;
    return matchesCustomer && matchesStatus;
  });

  // Sort filtered payments by date, newest first
  const sortedPayments = [...filteredPayments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const calculateTotal = () => {
    return sortedPayments.reduce((sum, payment) => {
      const amount = payment.amount || 0;
      return sum + (payment.type === 'incoming' ? amount : -amount);
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Filter by Customer
              </div>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Customers</option>
              <option value="COMPANY">Notte Payment</option>
              <option value="PERSONAL">Fatih KARA</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Status
              </div>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {getCustomerName(payment.customerId)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {payment.description}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.type === 'incoming' 
                        ? 'bg-green-100 text-green-800'
                        : payment.type === 'company_payment'
                        ? 'bg-purple-100 text-purple-800'
                        : payment.type === 'personal_account'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.type.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${formatNumber(payment.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onDeletePayment(payment.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {sortedPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No payments found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
            {sortedPayments.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                    Total:
                  </td>
                  <td colSpan={3} className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ${formatNumber(calculateTotal())}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}