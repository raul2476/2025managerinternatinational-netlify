import React, { useState, useEffect } from 'react';
import { RefreshCwIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ExchangeRateWidget: React.FC = () => {
  const [exchangeRate, setExchangeRate] = useState<number>(850.25);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { t } = useLanguage();

  const updateRate = async () => {
    setLoading(true);
    try {
      // In a real application, this would fetch from Banco Central de Chile's API
      // For demo purposes, we'll simulate a random fluctuation around the last observed rate
      const response = await fetch('https://mindicador.cl/api/dolar');
      const data = await response.json();
      const newRate = data.serie[0].valor;
      setExchangeRate(parseFloat(newRate.toFixed(2)));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      // Fallback to simulation if API fails
      const newRate = 850.25 + (Math.random() * 10 - 5);
      setExchangeRate(parseFloat(newRate.toFixed(2)));
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateRate();
    const intervalId = setInterval(updateRate, 60 * 60 * 1000); // Update every hour
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-gray-100 px-3 py-2 rounded-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{t('exchangeRate')}</p>
          <p className="font-medium">
            {loading ? '...' : `${exchangeRate} CLP/USD`}
          </p>
          <p className="text-xs text-gray-500">
            {t('lastUpdated')}: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button 
          onClick={updateRate}
          disabled={loading}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          title={t('updateExchangeRate')}
        >
          <RefreshCwIcon 
            className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>
    </div>
  );
};

export default ExchangeRateWidget;