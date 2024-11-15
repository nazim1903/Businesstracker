import React, { useState } from 'react';
import { Trash2, Pencil, Users, CreditCard } from 'lucide-react';
import type { Product, Customer, Payment } from '../types';

interface ProductListProps {
  products: Product[];
  customers: Customer[];
  payments: Payment[];
  onDeleteProduct: (id: string) => void;
  onEditProduct?: (product: Product) => void;
  onEditPayment?: (payment: Payment) => void;
  onDeletePayment?: (id: string) => void;
}

export function ProductList({ 
  products = [], 
  customers = [], 
  payments = [],
  onDeleteProduct,
  onEditProduct,
  onEditPayment,
  onDeletePayment
}: ProductListProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const formatNumber = (value: number): string => {
    return value ? value.toFixed(2) : '0.00';
  };

  // Filter products by selected customer
  const filteredProducts = selectedCustomerId
    ? products.filter(product => product.customerId === selectedCustomerId)
    : products;

  // Sort filtered products by date, newest first
  const sortedProducts = [...filteredProducts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const calculateTotal = () => {
    return sortedProducts.reduce((sum, product) => sum + (product.salePrice || 0), 0);
  };

  // Get payments for a product
  const getProductPayments = (productId: string) => {
    return payments.filter(payment => 
      payment.description.includes(productId) || 
      payment.description.includes(`SALE-${productId}`)
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4">
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
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cost Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sale Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Profit</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedProducts.map((product) => (
                <React.Fragment key={product.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{product.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <button 
                        onClick={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {product.product}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getCustomerName(product.customerId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${formatNumber(product.costPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${formatNumber(product.salePrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${formatNumber(product.salePrice - product.costPrice)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {onEditProduct && (
                        <button
                          onClick={() => onEditProduct(product)}
                          className="text-blue-600 hover:text-blue-800 inline-block"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800 inline-block"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                  {expandedProductId === product.id && (
                    <tr key={`${product.id}-payments`}>
                      <td colSpan={8} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Related Payments
                          </h4>
                          <div className="bg-white rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {getProductPayments(product.id).map((payment) => (
                                  <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      {new Date(payment.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        payment.type === 'incoming' 
                                          ? 'bg-green-100 text-green-800'
                                          : payment.type === 'deposit'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      ${payment.amount.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      {payment.description}
                                    </td>
                                    <td className="px-4 py-2 text-right space-x-2">
                                      {onEditPayment && (
                                        <button
                                          onClick={() => onEditPayment(payment)}
                                          className="text-blue-600 hover:text-blue-800 inline-block"
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </button>
                                      )}
                                      {onDeletePayment && (
                                        <button
                                          onClick={() => onDeletePayment(payment.id)}
                                          className="text-red-600 hover:text-red-800 inline-block"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                                {getProductPayments(product.id).length === 0 && (
                                  <tr>
                                    <td colSpan={5} className="px-4 py-4 text-sm text-center text-gray-500">
                                      No payments found for this product
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {sortedProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No products found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
            {sortedProducts.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={5} className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
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