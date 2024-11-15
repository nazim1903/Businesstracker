import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home, LayoutIcon, Users, Package, CreditCard, ClipboardList } from 'lucide-react';
import { CustomersPage } from './pages/CustomersPage';
import { OrdersPage } from './pages/OrdersPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ProductsPage } from './pages/ProductsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { PrivateRoute } from './components/PrivateRoute';
import { useLocalStorage } from './utils/storage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authToken, setAuthToken] = useLocalStorage<string | null>('authToken', null);

  useEffect(() => {
    setIsAuthenticated(!!authToken);
    setAuthChecked(true);
  }, [authToken]);

  if (!authChecked) {
    return null;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {isAuthenticated && (
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <a href="/" className="flex items-center px-4 text-gray-900 hover:text-blue-600">
                    <LayoutIcon className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Business Manager</span>
                  </a>
                </div>
                <div className="flex space-x-4">
                  <a href="/" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                    <Home className="w-5 h-5 mr-1" />
                    Dashboard
                  </a>
                  <a href="/customers" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                    <Users className="w-5 h-5 mr-1" />
                    Customers
                  </a>
                  <a href="/products" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                    <Package className="w-5 h-5 mr-1" />
                    Sales
                  </a>
                  <a href="/orders" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                    <ClipboardList className="w-5 h-5 mr-1" />
                    Orders
                  </a>
                  <a href="/payments" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                    <CreditCard className="w-5 h-5 mr-1" />
                    Payments
                  </a>
                  <button
                    onClick={() => {
                      setAuthToken(null);
                      setIsAuthenticated(false);
                    }}
                    className="flex items-center px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>
        )}

        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/" /> : <LoginPage onLogin={(token) => {
                  setAuthToken(token);
                  setIsAuthenticated(true);
                }} />
              } />
              <Route path="/" element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <DashboardPage />
                </PrivateRoute>
              } />
              <Route path="/customers" element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <CustomersPage />
                </PrivateRoute>
              } />
              <Route path="/products" element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <ProductsPage />
                </PrivateRoute>
              } />
              <Route path="/orders" element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <OrdersPage />
                </PrivateRoute>
              } />
              <Route path="/payments" element={
                <PrivateRoute isAuthenticated={isAuthenticated}>
                  <PaymentsPage />
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}