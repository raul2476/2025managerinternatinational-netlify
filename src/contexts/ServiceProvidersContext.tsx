import React, { createContext, useContext, useState } from 'react';

export const PAYMENT_TERMS = {
  advance50_balance50: {
    type: 'advance50_balance50',
    description: '50% advance, 50% upon delivery'
  },
  advance70_balance30: {
    type: 'advance70_balance30',
    description: '70% advance, 30% upon delivery'
  },
  net15: {
    type: 'net15',
    description: '100% at 15 days'
  },
  net30: {
    type: 'net30',
    description: '100% at 30 days'
  },
  immediate: {
    type: 'immediate',
    description: '100% immediate payment'
  }
} as const;

type PaymentTermsType = typeof PAYMENT_TERMS[keyof typeof PAYMENT_TERMS];

interface ServiceProvider {
  id: string;
  name: string;
  taxId: string;
  email: string;
  phone: string;
  type: 'national' | 'international';
  paymentTermsUSD: PaymentTermsType;
  paymentTermsCLP: PaymentTermsType;
  createdAt: Date;
}

interface ServiceProviderOperation {
  operationId: string;
  operationNumber: string;
  type: 'international' | 'national';
  status: 'pending' | 'in_progress' | 'completed';
  route: string;
  serviceValue: number;
  serviceValueCLP: number;
  paymentTerms: string;
  startDate?: Date;
  completionDate?: Date;
}

interface ServiceProvidersContextType {
  providers: ServiceProvider[];
  addProvider: (provider: Omit<ServiceProvider, 'id' | 'createdAt'>) => void;
  updateProvider: (id: string, updates: Partial<ServiceProvider>) => void;
  deleteProvider: (id: string) => void;
  getProviderOperations: (id: string) => ServiceProviderOperation[];
}

const ServiceProvidersContext = createContext<ServiceProvidersContextType | undefined>(undefined);

export const ServiceProvidersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [providers, setProviders] = useState<ServiceProvider[]>([
    {
      id: '1',
      name: 'Carlos Mendez',
      taxId: '76.543.210-K',
      email: 'carlos.mendez@transportes.cl',
      phone: '+56 9 1234 5678',
      type: 'international',
      paymentTermsUSD: PAYMENT_TERMS.advance70_balance30,
      paymentTermsCLP: PAYMENT_TERMS.advance50_balance50,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Juan Perez',
      taxId: '20-12345678-9',
      email: 'juan.perez@transandes.com',
      phone: '+54 9 11 2345-6789',
      type: 'national',
      paymentTermsUSD: PAYMENT_TERMS.net30,
      paymentTermsCLP: PAYMENT_TERMS.advance50_balance50,
      createdAt: new Date('2024-01-05')
    }
  ]);

  const addProvider = (provider: Omit<ServiceProvider, 'id' | 'createdAt'>) => {
    const newProvider: ServiceProvider = {
      ...provider,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setProviders([...providers, newProvider]);
  };

  const updateProvider = (id: string, updates: Partial<ServiceProvider>) => {
    setProviders(providers.map(provider =>
      provider.id === id ? { ...provider, ...updates } : provider
    ));
  };

  const deleteProvider = (id: string) => {
    setProviders(providers.filter(provider => provider.id !== id));
  };

  const getProviderOperations = (id: string): ServiceProviderOperation[] => {
    const exchangeRate = 850.25;
    return [
      {
        operationId: '1234-2024TI',
        operationNumber: '1234-2024TI',
        type: 'international',
        status: 'completed',
        route: 'Santiago - Buenos Aires',
        serviceValue: 3450,
        serviceValueCLP: 3450 * exchangeRate,
        paymentTerms: '70/30',
        startDate: new Date('2024-01-16'),
        completionDate: new Date('2024-01-20')
      },
      {
        operationId: '1235-2024TI',
        operationNumber: '1235-2024TI',
        type: 'international',
        status: 'in_progress',
        route: 'Santiago - Mendoza',
        serviceValue: 2850,
        serviceValueCLP: 2850 * exchangeRate,
        paymentTerms: '50/50',
        startDate: new Date('2024-01-19')
      }
    ];
  };

  return (
    <ServiceProvidersContext.Provider value={{
      providers,
      addProvider,
      updateProvider,
      deleteProvider,
      getProviderOperations
    }}>
      {children}
    </ServiceProvidersContext.Provider>
  );
};

export const useServiceProviders = () => {
  const context = useContext(ServiceProvidersContext);
  if (context === undefined) {
    throw new Error('useServiceProviders must be used within a ServiceProvidersProvider');
  }
  return context;
};