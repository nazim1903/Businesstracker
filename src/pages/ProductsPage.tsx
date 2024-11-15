import { useState, useEffect } from 'react';
import { dbOperations } from '../utils/db';
import type { Customer, Product, Order, Payment } from '../types';
import { ProductForm } from '../components/ProductForm';
import { ProductList } from '../components/ProductList';

export function ProductsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [loadedCustomers, loadedProducts, loadedOrders, loadedPayments] = await Promise.all([
        dbOperations.getCustomers(),
        dbOperations.getProducts(),
        dbOperations.getOrders(),
        dbOperations.getPayments()
      ]);

      setCustomers(loadedCustomers);
      setProducts(loadedProducts);
      setOrders(loadedOrders);
      setPayments(loadedPayments);
    };

    loadData();
  }, []);

  const handleAddProduct = async (
    code: string,
    productName: string,
    costPrice: number,
    salePrice: number,
    customerId: string,
    orderId?: string,
    date?: Date
  ) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      code,
      product: productName,
      costPrice,
      salePrice,
      profit: salePrice - costPrice,
      customerId,
      createdAt: (date || new Date()).toISOString(),
      modifiedAt: new Date().toISOString()
    };

    try {
      await dbOperations.addProduct(newProduct);
      setProducts([...products, newProduct]);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      // Update profit calculation
      const product = {
        ...updatedProduct,
        profit: updatedProduct.salePrice - updatedProduct.costPrice,
        modifiedAt: new Date().toISOString()
      };
      
      await dbOperations.updateProduct(product);
      setProducts(products.map(p => p.id === product.id ? product : p));
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await dbOperations.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEditPayment = async (payment: Payment) => {
    // Navigate to payments page with the payment pre-selected for editing
    window.location.href = `/payments?edit=${payment.id}`;
  };

  const handleDeletePayment = async (id: string) => {
    try {
      await dbOperations.deletePayment(id);
      setPayments(payments.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
      
      <ProductForm
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        customers={customers}
        orders={orders}
        editingProduct={editingProduct}
      />
      
      <ProductList
        products={products}
        customers={customers}
        payments={payments}
        onDeleteProduct={handleDeleteProduct}
        onEditProduct={setEditingProduct}
        onEditPayment={handleEditPayment}
        onDeletePayment={handleDeletePayment}
      />
    </div>
  );
}