import React, { createContext, useContext, useState } from 'react';

export const PAYMENT_TERMS = {
  advance50_net30: {
    advance: 50,
    uponDelivery: 50,
    daysToPayment: 30,
    description: '50% advance, 50% at 30 days'
  },
  advance70_net30: {
    advance: 70,
    uponDelivery: 30,
    daysToPayment: 30,
    description: '70% advance, 30% at 30 days'
  },
  net15: {
    advance: 0,
    uponDelivery: 100,
    daysToPayment: 15,
    description: '100% at 15 days'
  },
  net30: {
    advance: 0,
    uponDelivery: 100,
    daysToPayment: 30,
    description: '100% at 30 days'
  },
  immediate: {
    advance: 0,
    uponDelivery: 100,
    daysToPayment: 0,
    description: '100% immediate payment'
  }
} as const;

type PaymentTermsType = typeof PAYMENT_TERMS[keyof typeof PAYMENT_TERMS];

interface Client {
  id: string;
  name: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  type: 'national' | 'international';
  paymentTermsUSD: PaymentTermsType;
  paymentTermsCLP: PaymentTermsType;
  createdAt: Date;
}

interface ClientsContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientPaymentTerms: (id: string, currency: 'USD' | 'CLP') => PaymentTermsType | null;
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export const ClientsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'LogiFreight SA',
      taxId: '76.543.210-K',
      email: 'accounts@logifreight.cl',
      phone: '+56 9 1234 5678',
      address: 'Av. Apoquindo 4700',
      city: 'Santiago',
      country: 'Chile',
      type: 'international',
      paymentTermsUSD: PAYMENT_TERMS.advance70_net30,
      paymentTermsCLP: PAYMENT_TERMS.advance50_net30,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Trans Andes Ltd',
      taxId: '20-12345678-9',
      email: 'finance@transandes.com',
      phone: '+54 9 11 2345-6789',
      address: 'Av. del Libertador 4444',
      city: 'Buenos Aires',
      country: 'Argentina',
      type: 'national',
      paymentTermsUSD: PAYMENT_TERMS.net30,
      paymentTermsCLP: PAYMENT_TERMS.immediate,
      createdAt: new Date('2024-01-05')
    }
  ]);

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setClients([...clients, newClient]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(clients.map(client =>
      client.id === id ? { ...client, ...updates } : client
    ));
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(client => client.id !== id));
  };

  const getClientPaymentTerms = (id: string, currency: 'USD' | 'CLP'): PaymentTermsType | null => {
    const client = clients.find(c => c.id === id);
    if (!client) return null;
    return currency === 'USD' ? client.paymentTermsUSD : client.paymentTermsCLP;
  };

  return (
    <ClientsContext.Provider value={{
      clients,
      addClient,
      updateClient,
      deleteClient,
      getClientPaymentTerms
    }}>
      {children}
    </ClientsContext.Provider>
  );
};

export const useClients = () => {
  const context = useContext(ClientsContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientsProvider');
  }
  return context;
};