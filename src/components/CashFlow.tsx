import { Wallet, ArrowUpRight, ArrowDownRight, Building2, Download, User, ClipboardList } from 'lucide-react';
import type { Payment, Customer, Product, Order } from '../types';
import { exportToPDF } from '../utils/export';

interface CashFlowProps {
  payments: Payment[];
  customers: Customer[];
  products: Product[];
  orders: Order[];
}

export function CashFlow({ payments = [], customers = [], products = [], orders = [] }: CashFlowProps) {
  const completedPayments = payments.filter(p => p.status === 'completed');
  
  // Include deposits in total incoming
  const totalIncoming = completedPayments
    .filter(p => p.type === 'incoming' || p.type === 'deposit')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalOutgoing = completedPayments
    .filter(p => p.type === 'outgoing')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalCompanyPayments = completedPayments
    .filter(p => p.type === 'company_payment')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPersonalPayments = completedPayments
    .filter(p => p.type === 'personal_account')
    .reduce((sum, p) => sum + p.amount, 0);

  // Calculate total deposits for active orders
  const activeDeposits = completedPayments
    .filter(p => {
      if (p.type !== 'deposit' || !p.orderId) return false;
      const order = orders.find(o => o.id === p.orderId);
      return order && !order.depositTransferred;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const currentBalance = totalIncoming - totalOutgoing - totalCompanyPayments - totalPersonalPayments;

  // Get active orders with deposits
  const activeOrdersWithDeposits = orders
    .filter(order => 
      (order.status === 'pending' || order.status === 'in_progress') &&
      !order.depositTransferred &&
      order.deposit
    )
    .map(order => {
      const deposit = completedPayments.find(
        p => p.orderId === order.id && p.type === 'deposit' && p.status === 'completed'
      );
      return {
        ...order,
        depositAmount: deposit?.amount || 0
      };
    })
    .filter(order => order.depositAmount > 0);

  const customerBalances = customers.map(customer => {
    const totalSales = products
      .filter(p => p.customerId === customer.id)
      .reduce((sum, p) => sum + p.salePrice, 0);

    const totalReceived = completedPayments
      .filter(p => 
        p.customerId === customer.id && 
        (p.type === 'incoming' || p.type === 'deposit')
      )
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = totalSales - totalReceived;

    return {
      customerId: customer.id,
      customerName: customer.name,
      pendingAmount: pendingAmount > 0 ? pendingAmount : 0
    };
  }).filter(balance => balance.pendingAmount > 0);

  const totalPendingFromCustomers = customerBalances.reduce((sum, balance) => sum + balance.pendingAmount, 0);
  const totalProfit = products.reduce((sum, product) => sum + (product.salePrice - product.costPrice), 0);
  const halfProfit = totalProfit / 2;

  const handleExportPDF = async () => {
    const reportElement = document.getElementById('cash-flow-report');
    if (reportElement) {
      try {
        await exportToPDF(reportElement, 'cash_flow_report');
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  };

  return (
    <div id="cash-flow-report" className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Cash Flow</h2>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-blue-600 text-sm font-medium">Current Balance</div>
          <div className="text-2xl font-bold text-blue-900">
            ${currentBalance.toFixed(2)}
          </div>
          {activeDeposits > 0 && (
            <div className="text-sm text-blue-600">
              Includes ${activeDeposits.toFixed(2)} in deposits
            </div>
          )}
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <ArrowUpRight className="w-4 h-4" />
            Total Income
          </div>
          <div className="text-2xl font-bold text-green-900">
            ${totalIncoming.toFixed(2)}
          </div>
          {activeDeposits > 0 && (
            <div className="text-sm text-green-600">
              Includes ${activeDeposits.toFixed(2)} in deposits
            </div>
          )}
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
            <ArrowDownRight className="w-4 h-4" />
            Total Expenses
          </div>
          <div className="text-2xl font-bold text-red-900">
            ${totalOutgoing.toFixed(2)}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
            <Building2 className="w-4 h-4" />
            Notte Payments
          </div>
          <div className="text-2xl font-bold text-purple-900">
            ${totalCompanyPayments.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-indigo-600 text-sm font-medium">Total Profit</div>
          <div className="text-2xl font-bold text-indigo-900">
            ${totalProfit.toFixed(2)}
          </div>
          <div className="mt-1 text-sm text-indigo-600">
            Half: ${halfProfit.toFixed(2)}
          </div>
        </div>

        <div className="bg-cyan-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-cyan-600 text-sm font-medium">
            <User className="w-4 h-4" />
            Personal Account
          </div>
          <div className="text-2xl font-bold text-cyan-900">
            ${totalPersonalPayments.toFixed(2)}
          </div>
          <div className="mt-1 text-sm text-cyan-600">
            Fatih KARA
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
            <ClipboardList className="w-4 h-4" />
            Active Orders & Deposits
          </div>
          <div className="text-2xl font-bold text-amber-900">
            ${activeDeposits.toFixed(2)}
          </div>
          <div className="mt-2 text-sm text-amber-600 max-h-20 overflow-y-auto">
            {activeOrdersWithDeposits.map((order, i) => (
              <div key={i} className="flex justify-between">
                <span>{order.productName}</span>
                <span>${order.depositAmount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-yellow-600 text-sm font-medium">Pending from Customers</div>
          <div className="text-2xl font-bold text-yellow-900">
            ${totalPendingFromCustomers.toFixed(2)}
          </div>
          <div className="mt-2 text-sm text-yellow-600 max-h-20 overflow-y-auto">
            {customerBalances.map((balance, i) => (
              <div key={i} className="flex justify-between">
                <span>{balance.customerName}</span>
                <span>${balance.pendingAmount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}