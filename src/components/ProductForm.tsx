import { useState, useEffect, useCallback, useMemo } from 'react';
import { Package, Plus, Pencil } from 'lucide-react';
import type { Customer, Product, Order } from '../types';

interface ProductFormProps {
  onAddProduct: (
    code: string,
    product: string,
    costPrice: number,
    salePrice: number,
    customerId: string,
    orderId?: string,
    date?: Date
  ) => void;
  onUpdateProduct?: (product: Product) => void;
  customers: Customer[];
  orders: Order[];
  editingProduct?: Product;
}

const initialFormState = {
  customerId: '',
  orderId: '',
  code: '',
  product: '',
  costPrice: '',
  salePrice: '',
  date: new Date().toISOString().split('T')[0]
};

export function ProductForm({ 
  onAddProduct, 
  onUpdateProduct, 
  customers = [], 
  orders = [], 
  editingProduct 
}: ProductFormProps) {
  const [formState, setFormState] = useState(() => ({
    ...initialFormState,
    ...(editingProduct && {
      customerId: editingProduct.customerId,
      code: editingProduct.code,
      product: editingProduct.product,
      costPrice: editingProduct.costPrice.toString(),
      salePrice: editingProduct.salePrice.toString(),
      date: new Date(editingProduct.createdAt).toISOString().split('T')[0]
    })
  }));

  const customerOrders = useMemo(() => {
    if (!formState.customerId) return [];
    return orders.filter(
      order => order.customerId === formState.customerId && 
      !order.depositTransferred &&
      (order.status === 'pending' || order.status === 'in_progress')
    );
  }, [orders, formState.customerId]);

  const selectedOrder = useMemo(() => 
    formState.orderId ? customerOrders.find(o => o.id === formState.orderId) : null,
    [customerOrders, formState.orderId]
  );

  const handleOrderSelect = useCallback((selectedOrderId: string) => {
    const selectedOrder = orders.find(o => o.id === selectedOrderId);
    
    if (selectedOrder) {
      setFormState(prev => ({
        ...prev,
        orderId: selectedOrderId,
        product: selectedOrder.productName,
        salePrice: selectedOrder.totalPrice.toString(),
        costPrice: (selectedOrder.totalPrice * 0.7).toString()
      }));
    } else {
      setFormState(prev => ({
        ...prev,
        orderId: selectedOrderId
      }));
    }
  }, [orders]);

  const handleInputChange = useCallback((field: keyof typeof initialFormState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: field === 'code' ? value.toUpperCase() : value,
      ...(field === 'customerId' ? { orderId: '' } : {})
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numCostPrice = parseFloat(formState.costPrice);
    const numSalePrice = parseFloat(formState.salePrice);
    
    if (!formState.code || !formState.product || isNaN(numCostPrice) || isNaN(numSalePrice) || !formState.customerId) {
      return;
    }

    if (editingProduct && onUpdateProduct) {
      onUpdateProduct({
        ...editingProduct,
        code: formState.code.toUpperCase(),
        product: formState.product,
        costPrice: numCostPrice,
        salePrice: numSalePrice,
        profit: numSalePrice - numCostPrice,
        customerId: formState.customerId,
        modifiedAt: new Date().toISOString()
      });
    } else {
      onAddProduct(
        formState.code.toUpperCase(),
        formState.product,
        numCostPrice,
        numSalePrice,
        formState.customerId,
        formState.orderId || undefined,
        new Date(formState.date)
      );
    }

    setFormState(initialFormState);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer
          </label>
          <select
            value={formState.customerId}
            onChange={(e) => handleInputChange('customerId', e.target.value)}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {customerOrders.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Order
            </label>
            <select
              value={formState.orderId}
              onChange={(e) => handleOrderSelect(e.target.value)}
              className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an order</option>
              {customerOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.productName} {order.deposit ? `(Deposit: $${order.deposit})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Code
          </label>
          <input
            type="text"
            value={formState.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            placeholder="PRD001"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formState.product}
              onChange={(e) => handleInputChange('product', e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product name"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost Price ($)
          </label>
          <input
            type="number"
            value={formState.costPrice}
            onChange={(e) => handleInputChange('costPrice', e.target.value)}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sale Price ($)
          </label>
          <input
            type="number"
            value={formState.salePrice}
            onChange={(e) => handleInputChange('salePrice', e.target.value)}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={formState.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {selectedOrder?.deposit && (
        <div className="mt-4 p-4 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> This order has a deposit of ${selectedOrder.deposit.toFixed(2)}. 
            When you complete this sale, the deposit will be automatically transferred to the payment.
          </p>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
        >
          {editingProduct ? (
            <>
              <Pencil className="w-5 h-5" />
              Update Product
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add Product
            </>
          )}
        </button>
      </div>
    </form>
  );
}