import { useRef } from 'react';
import { X, Download, FileText } from 'lucide-react';
import type { Order, Customer } from '../types';
import { exportToPDF } from '../utils/export';

interface OrderReportProps {
  order: Order;
  customer: Customer;
  onClose: () => void;
}

export function OrderReport({ order, customer, onClose }: OrderReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    try {
      await exportToPDF(reportRef.current, true);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6" ref={reportRef}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Order Details
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

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900"><strong>Name:</strong> {customer.name}</p>
                  {customer.email && (
                    <p className="text-sm text-gray-900"><strong>Email:</strong> {customer.email}</p>
                  )}
                  {customer.phone && (
                    <p className="text-sm text-gray-900"><strong>Phone:</strong> {customer.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Status</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">
                    <strong>Created:</strong> {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  {order.completedAt && (
                    <p className="text-sm text-gray-900">
                      <strong>Completed:</strong> {new Date(order.completedAt).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Details</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-900"><strong>Product Name:</strong> {order.productName}</p>
                    <p className="text-sm text-gray-900"><strong>Gold Karat:</strong> {order.goldKarat}K</p>
                    {order.diamondCarat && (
                      <p className="text-sm text-gray-900">
                        <strong>Diamond:</strong> {order.diamondCarat}ct {order.diamondType}
                      </p>
                    )}
                    {order.size && (
                      <p className="text-sm text-gray-900"><strong>Size:</strong> {order.size}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <strong>Deposit Amount:</strong> ${order.depositAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-900"><strong>Details:</strong></p>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{order.details}</p>
                </div>
              </div>
            </div>

            {order.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {order.images.map((image, index) => (
                    <div key={index} className="aspect-square">
                      <img
                        src={image}
                        alt={`Order image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}