import { useState, useEffect } from 'react';
import { dbOperations } from '../utils/db';
import type { Customer, Product, Payment } from '../types';
import { CustomerForm } from '../components/CustomerForm';
import { CustomerList } from '../components/CustomerList';
import { CustomerReport } from '../components/CustomerReport';

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [loadedCustomers, loadedProducts, loadedPayments] = await Promise.all([
        dbOperations.getCustomers(),
        dbOperations.getProducts(),
        dbOperations.getPayments()
      ]);

      setCustomers(loadedCustomers);
      setProducts(loadedProducts);
      setPayments(loadedPayments);
    };

    loadData();
  }, []);

  const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...customerData,
      createdAt: new Date().toISOString()
    };

    try {
      await dbOperations.addCustomer(newCustomer);
      setCustomers([...customers, newCustomer]);
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    try {
      await dbOperations.updateCustomer(updatedCustomer);
      setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
      setEditingCustomer(null);
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await dbOperations.deleteCustomer(id);
      setCustomers(customers.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
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
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      
      <CustomerForm
        onAddCustomer={handleAddCustomer}
        onUpdateCustomer={handleUpdateCustomer}
        editingCustomer={editingCustomer}
      />
      
      <CustomerList
        customers={customers}
        products={products}
        payments={payments}
        onDeleteCustomer={handleDeleteCustomer}
        onShowReport={setSelectedCustomerId}
        onEditCustomer={setEditingCustomer}
      />

      {selectedCustomerId && (
        <CustomerReport
          customer={customers.find(c => c.id === selectedCustomerId)!}
          products={products.filter(p => p.customerId === selectedCustomerId)}
          payments={payments.filter(p => p.customerId === selectedCustomerId)}
          onClose={() => setSelectedCustomerId(null)}
          onEditProduct={setEditingProduct}
          onDeleteProduct={handleDeleteProduct}
          onEditPayment={handleEditPayment}
          onDeletePayment={handleDeletePayment}
        />
      )}
    </div>
  );
}