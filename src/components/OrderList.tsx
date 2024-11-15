import { useState } from 'react';
import { Trash2, FileText, Download, Users, Pencil } from 'lucide-react';
import type { Order, Customer, Payment } from '../types';
import { exportToPDF } from '../utils/export';

interface OrderListProps {
  orders: Order[];
  customers: Customer[];
  payments: Payment[];
  onDeleteOrder: (id: string) => void;
  onUpdateOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
}

export function OrderList({
  orders = [],
  customers = [],
  payments = [],
  onDeleteOrder,
  onUpdateOrder,
  onEditOrder
}: OrderListProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const getOrderDeposit = (orderId: string): number => {
    const deposit = payments.find(
      p => p.orderId === orderId && p.type === 'deposit' && p.status === 'completed'
    );
    return deposit?.amount || 0;
  };

  // Filter orders by customer and status
  const filteredOrders = orders.filter(order => {
    const matchesCustomer = selectedCustomerId ? order.customerId === selectedCustomerId : true;
    const matchesStatus = selectedStatus ? order.status === selectedStatus : true;
    return matchesCustomer && matchesStatus;
  });

  // Sort filtered orders by date, newest first
  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleExportPDF = async (order: Order) => {
    // Create a temporary div for PDF export with larger images
    const tempDiv = document.createElement('div');
    tempDiv.className = 'bg-white p-6';
    
    // Clone the order content
    const orderContent = document.getElementById(`order-${order.id}`)?.cloneNode(true) as HTMLElement;
    if (!orderContent) return;

    // Remove action buttons and status section for PDF
    const actionsSection = orderContent.querySelector('[data-actions-section]');
    if (actionsSection) {
      actionsSection.remove();
    }

    // Find the images container and update its style
    const imagesContainer = orderContent.querySelector('[data-images-container]');
    if (imagesContainer) {
      imagesContainer.className = 'flex flex-wrap justify-center gap-4 mt-4';
      
      // Update image sizes
      const images = imagesContainer.querySelectorAll('img');
      images.forEach(img => {
        img.className = 'w-72 h-72 object-contain rounded-lg';
      });
    }

    tempDiv.appendChild(orderContent);
    document.body.appendChild(tempDiv);

    try {
      const customerName = getCustomerName(order.customerId).replace(/[^a-z0-9]/gi, '_');
      const productName = order.productName.replace(/[^a-z0-9]/gi, '_');
      const date = new Date().toISOString().split('T')[0];
      const filename = `${customerName}_${productName}_${date}`;
      
      await exportToPDF(tempDiv, true, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }

    document.body.removeChild(tempDiv);
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      onUpdateOrder({
        ...order,
        status: newStatus,
        modifiedAt: new Date().toISOString()
      });
    }
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
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedOrders.map((order) => {
          const totalPrice = order.totalPrice || 0;
          const deposit = order.deposit || 0;
          const remaining = totalPrice - deposit;

          return (
            <div
              key={order.id}
              id={`order-${order.id}`}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {order.productName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Customer: {getCustomerName(order.customerId)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2" data-actions-section>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                    className="rounded-lg border-gray-200 border py-1 px-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => onEditOrder(order)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit Order"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleExportPDF(order)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Export PDF"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDeleteOrder(order.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Order"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Gold Karat</p>
                  <p className="text-sm text-gray-900">{order.goldKarat}</p>
                </div>
                {order.diamondCarat && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Diamond Carat</p>
                    <p className="text-sm text-gray-900">{order.diamondCarat}</p>
                  </div>
                )}
                {order.diamondType && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Diamond Type</p>
                    <p className="text-sm text-gray-900">{order.diamondType}</p>
                  </div>
                )}
                {order.size && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Size</p>
                    <p className="text-sm text-gray-900">{order.size}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Price</p>
                  <p className="text-sm text-gray-900">${totalPrice.toFixed(2)}</p>
                </div>
                {deposit > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Deposit</p>
                    <p className="text-sm text-gray-900">${deposit.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      Remaining: ${remaining.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Details</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{order.details}</p>
              </div>

              {order.images && order.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Images</p>
                  <div data-images-container className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {order.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Order ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sortedOrders.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No orders found matching the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}