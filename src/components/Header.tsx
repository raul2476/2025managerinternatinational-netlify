import React from 'react';
import { MenuIcon, BellIcon, UserIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ExchangeRateWidget from './ExchangeRateWidget';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const { t } = useLanguage();
  
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return t('dashboard');
    if (path === '/documents') return t('documentRegistry');
    if (path === '/payments') return t('paymentConditions');
    if (path === '/reports') return t('reports');
    
    return 'TransManager';
  };

  return (
    <header className="flex-shrink-0 bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              type="button"
              className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 flex items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex-1 flex">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {getPageTitle()}
                </h1>
              </div>
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                <LanguageSelector />
                <ExchangeRateWidget />
                <button
                  type="button"
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;