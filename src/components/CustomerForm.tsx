import { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, User, Pencil } from 'lucide-react';
import type { Customer } from '../types';

interface CustomerFormProps {
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onUpdateCustomer?: (customer: Customer) => void;
  editingCustomer: Customer | null;
}

export function CustomerForm({ onAddCustomer, onUpdateCustomer, editingCustomer }: CustomerFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (editingCustomer) {
      setName(editingCustomer.name);
      setEmail(editingCustomer.email || '');
      setPhone(editingCustomer.phone || '');
    } else {
      setName('');
      setEmail('');
      setPhone('');
    }
  }, [editingCustomer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingCustomer && onUpdateCustomer) {
      onUpdateCustomer({
        ...editingCustomer,
        name,
        email: email || null,
        phone: phone || null,
      });
    } else {
      onAddCustomer({
        name,
        email: email || null,
        phone: phone || null,
      });
    }

    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email (optional)
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone (optional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-200 border py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
        >
          {editingCustomer ? (
            <>
              <Pencil className="w-5 h-5" />
              Update Customer
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Add Customer
            </>
          )}
        </button>
      </div>
    </form>
  );
}