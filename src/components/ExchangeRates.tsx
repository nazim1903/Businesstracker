import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface ExchangeRate {
  EUR_USD: number;
  GBP_USD: number;
  USD_EUR: number;
  USD_GBP: number;
}

export function ExchangeRates() {
  const [rates, setRates] = useState<ExchangeRate>({
    EUR_USD: 1.0922,
    GBP_USD: 1.2651,
    USD_EUR: 0.9156,
    USD_GBP: 0.7905
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchRates = async () => {
    try {
      // In a real app, this would fetch from an API
      // For demo, we'll simulate slight variations
      const variation = () => 1 + (Math.random() - 0.5) * 0.01; // ±0.5% variation
      
      setRates({
        EUR_USD: 1.0922 * variation(),
        GBP_USD: 1.2651 * variation(),
        USD_EUR: 0.9156 * variation(),
        USD_GBP: 0.7905 * variation()
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 30 * 60 * 1000); // Update every 30 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Exchange Rates</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchRates}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-500">EUR/USD</div>
          <div className="text-lg font-semibold text-gray-900">{rates.EUR_USD.toFixed(4)}</div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-500">GBP/USD</div>
          <div className="text-lg font-semibold text-gray-900">{rates.GBP_USD.toFixed(4)}</div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-500">USD/EUR</div>
          <div className="text-lg font-semibold text-gray-900">{rates.USD_EUR.toFixed(4)}</div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-500">USD/GBP</div>
          <div className="text-lg font-semibold text-gray-900">{rates.USD_GBP.toFixed(4)}</div>
        </div>
      </div>
    </div>
  );
}