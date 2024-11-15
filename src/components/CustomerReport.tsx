import { useRef } from 'react';
import { X, Download, FileText, Pencil, Trash2 } from 'lucide-react';
import type { Customer, Product, Payment } from '../types';
import { exportToPDF } from '../utils/export';

interface CustomerReportProps {
  customer: Customer;
  products: Product[];
  payments: Payment[];
  onClose: () => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onEditPayment?: (payment: Payment) => void;
  onDeletePayment?: (id: string) => void;
}

export function CustomerReport({ 
  customer, 
  products = [], 
  payments = [], 
  onClose,
  onEditProduct,
  onDeleteProduct,
  onEditPayment,
  onDeletePayment
}: CustomerReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  
  const totalSales = products.reduce((sum, product) => sum + product.salePrice, 0);
  const totalCosts = products.reduce((sum, product) => sum + product.costPrice, 0);
  const totalProfit = totalSales - totalCosts;
  
  const incomingPayments = payments
    .filter(p => p.type === 'incoming' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingPayments = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + ((p.type === 'incoming' ? 1 : -1) * p.amount), 0);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    try {
      await exportToPDF(reportRef.current, true);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  const sortedProducts = [...products].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const sortedPayments = [...payments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6" ref={reportRef}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Customer Report: {customer.name}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 report-section">
              <div className="text-blue-600 text-sm font-medium">Total Sales</div>
              <div className="text-2xl font-bold text-blue-900">${totalSales.toFixed(2)}</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 report-section">
              <div className="text-green-600 text-sm font-medium">Incoming Payments</div>
              <div className="text-2xl font-bold text-green-900">${incomingPayments.toFixed(2)}</div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 report-section">
              <div className="text-yellow-600 text-sm font-medium">Pending Balance</div>
              <div className="text-2xl font-bold text-yellow-900">${pendingPayments.toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-lg p-4 mb-8 report-section-view-only">
            <div className="text-indigo-600 text-sm font-medium">Total Profit</div>
            <div className="text-2xl font-bold text-indigo-900">${totalProfit.toFixed(2)}</div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Products</h3>
              <div className="bg-white rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                      {(onEditProduct || onDeleteProduct) && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{product.product}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">${product.costPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">${product.salePrice.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${(product.salePrice - product.costPrice).toFixed(2)}
                        </td>
                        {(onEditProduct || onDeleteProduct) && (
                          <td className="px-6 py-4 text-right space-x-2">
                            {onEditProduct && (
                              <button
                                onClick={() => onEditProduct(product)}
                                className="text-blue-600 hover:text-blue-800 inline-block"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                            {onDeleteProduct && (
                              <button
                                onClick={() => onDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-800 inline-block"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-gray-900">Total:</td>
                      <td colSpan={2} className="px-6 py-4 text-sm font-semibold text-gray-900">${totalSales.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Payments</h3>
              <div className="bg-white rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      {(onEditPayment || onDeletePayment) && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{payment.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">${payment.amount.toFixed(2)}</td>
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
                        {(onEditPayment || onDeletePayment) && (
                          <td className="px-6 py-4 text-right space-x-2">
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
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="px-6 py-4 text-sm font-semibold text-gray-900">Total:</td>
                      <td colSpan={3} className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${incomingPayments.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}