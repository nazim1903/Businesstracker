import { useState, useRef, useEffect } from 'react';
import { Package, Plus, Upload, Calendar, Pencil } from 'lucide-react';
import type { Customer, Order } from '../types';

interface OrderFormProps {
  onAddOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'modifiedAt' | 'depositTransferred'>) => void;
  onUpdateOrder?: (order: Order) => void;
  customers: Customer[];
  editingOrder: Order | null;
}

export function OrderForm({ onAddOrder, onUpdateOrder, customers, editingOrder }: OrderFormProps) {
  const [customerId, setCustomerId] = useState('');
  const [productName, setProductName] = useState('');
  const [details, setDetails] = useState('');
  const [goldKarat, setGoldKarat] = useState('');
  const [diamondCarat, setDiamondCarat] = useState('');
  const [diamondType, setDiamondType] = useState('');
  const [size, setSize] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingOrder) {
      setCustomerId(editingOrder.customerId);
      setProductName(editingOrder.productName);
      setDetails(editingOrder.details);
      setGoldKarat(editingOrder.goldKarat);
      setDiamondCarat(editingOrder.diamondCarat || '');
      setDiamondType(editingOrder.diamondType || '');
      setSize(editingOrder.size || '');
      setTotalPrice(editingOrder.totalPrice.toString());
      setCostPrice(editingOrder.costPrice.toString());
      setDeposit(editingOrder.deposit?.toString() || '');
      setOrderDate(new Date(editingOrder.createdAt).toISOString().split('T')[0]);
      setImages(editingOrder.images || []);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      resetForm();
    }
  }, [editingOrder]);

  const resetForm = () => {
    setCustomerId('');
    setProductName('');
    setDetails('');
    setGoldKarat('');
    setDiamondCarat('');
    setDiamondType('');
    setSize('');
    setTotalPrice('');
    setCostPrice('');
    setDeposit('');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !productName || !details || !goldKarat || !totalPrice || !costPrice || !orderDate) return;

    const orderData = {
      customerId,
      productName,
      details,
      goldKarat,
      diamondCarat: diamondCarat || undefined,
      diamondType: diamondType || undefined,
      size: size || undefined,
      deposit: deposit ? parseFloat(deposit) : undefined,
      totalPrice: parseFloat(totalPrice),
      costPrice: parseFloat(costPrice),
      images,
      status: 'pending' as const,
      createdAt: new Date(orderDate).toISOString()
    };

    if (editingOrder && onUpdateOrder) {
      onUpdateOrder({
        ...editingOrder,
        ...orderData,
        modifiedAt: new Date().toISOString()
      });
    } else {
      onAddOrder(orderData);
    }

    resetForm();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ring, Necklace, etc."
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gold Karat
          </label>
          <select
            value={goldKarat}
            onChange={(e) => setGoldKarat(e.target.value)}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select karat</option>
            <option value="10K">10K</option>
            <option value="14K">14K</option>
            <option value="18K">18K</option>
            <option value="22K">22K</option>
            <option value="24K">24K</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diamond Carat (optional)
          </label>
          <input
            type="text"
            value={diamondCarat}
            onChange={(e) => setDiamondCarat(e.target.value)}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.5, 1.0, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diamond Type (optional)
          </label>
          <input
            type="text"
            value={diamondType}
            onChange={(e) => setDiamondType(e.target.value)}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Natural, Lab-grown, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Size (optional)
          </label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="6, 7, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Price ($)
          </label>
          <input
            type="number"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost Price ($)
          </label>
          <input
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deposit Amount ($) (optional)
          </label>
          <input
            type="number"
            value={deposit}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              const total = parseFloat(totalPrice);
              if (!isNaN(total) && !isNaN(value) && value <= total) {
                setDeposit(e.target.value);
              }
            }}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            step="0.01"
            min="0"
            max={totalPrice || undefined}
          />
          {deposit && totalPrice && (
            <p className="mt-1 text-sm text-gray-500">
              Remaining: ${(parseFloat(totalPrice) - parseFloat(deposit)).toFixed(2)}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Details
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Enter order details..."
            required
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Images
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload files</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
        >
          {editingOrder ? (
            <>
              <Pencil className="w-5 h-5" />
              Update Order
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Create Order
            </>
          )}
        </button>
      </div>
    </form>
  );
}