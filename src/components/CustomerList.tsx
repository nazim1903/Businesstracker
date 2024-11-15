import { Users, Package, FileText, Pencil, Trash2 } from 'lucide-react';
import type { Customer, Product, Payment } from '../types';

interface CustomerListProps {
  customers: Customer[];
  products: Product[];
  payments: Payment[];
  onDeleteCustomer: (id: string) => void;
  onShowReport: (id: string) => void;
  onEditCustomer: (customer: Customer) => void;
}

export function CustomerList({ 
  customers = [], 
  products = [], 
  payments = [], 
  onDeleteCustomer, 
  onShowReport,
  onEditCustomer 
}: CustomerListProps) {
  const getCustomerProducts = (customerId: string) => {
    return products.filter(product => product.customerId === customerId);
  };

  const getCustomerPayments = (customerId: string) => {
    return payments
      .filter(payment => payment.customerId === customerId && payment.status === 'completed')
      .reduce((total, payment) => {
        return total + (payment.type === 'incoming' ? payment.amount : -payment.amount);
      }, 0);
  };

  // Sort customers by date, newest first
  const sortedCustomers = [...customers].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalRevenue = customers.reduce((total, customer) => {
    return total + getCustomerPayments(customer.id);
  }, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Products</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total Revenue ($)</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                  <div className="text-sm text-gray-500">
                    Added {new Date(customer.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{customer.email || '-'}</div>
                  {customer.phone && (
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {getCustomerProducts(customer.id).length}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">
                    ${getCustomerPayments(customer.id).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => onEditCustomer(customer)}
                    className="text-blue-600 hover:text-blue-800 inline-block"
                    title="Edit Customer"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onShowReport(customer.id)}
                    className="text-green-600 hover:text-green-800 inline-block"
                    title="View Report"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDeleteCustomer(customer.id)}
                    className="text-red-600 hover:text-red-800 inline-block"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {sortedCustomers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No customers yet. Add your first customer above.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td colSpan={3} className="px-6 py-4 text-right text-gray-900">
                Total Revenue:
              </td>
              <td colSpan={2} className="px-6 py-4 text-left text-gray-900">
                ${totalRevenue.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}