import React, { createContext, useContext, useState, useCallback } from 'react';

interface Operation {
  id: string;
  type: 'international' | 'national';
  carrierCost: number;
  saleValue: number;
  documentType: 'crt' | 'mic';
  contractNumber: string;
  clientName: string;
  operationNumber: string;
  status: 'pending' | 'in_progress' | 'completed';
  documents: {
    id: number;
    name: string;
    type: string;
    date: string;
    status: 'approved' | 'pending';
  }[];
  insurance: {
    cargo?: boolean;
    liability?: boolean;
  };
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  originCity: string;
  destinationCity: string;
  serviceProvider?: string;
  requiredDocuments: {
    type: string;
    name: string;
    required: boolean;
    uploaded: boolean;
  }[];
  costs: {
    serviceProviderCost: number;
    extraCosts: {
      fuel: number;
      tolls: number;
      permits: number;
      other: number;
      description?: string;
      forecastedDate?: Date;
      status: 'pending' | 'paid';
    };
    advancePayment: number;
    pendingBalance: number;
    paymentSchedule: {
      description: string;
      amount: number;
      dueDate: Date;
      status: 'paid' | 'pending';
      type: 'provider' | 'extra';
    }[];
  };
}

interface OperationsContextType {
  operations: Operation[];
  addOperation: (operation: Omit<Operation, 'id' | 'status' | 'documents' | 'createdAt' | 'insurance' | 'requiredDocuments' | 'costs'>) => void;
  updateOperation: (id: string, updates: Partial<Operation>) => void;
  startOperation: (id: string, serviceProvider: string) => void;
  completeOperation: (id: string) => void;
  uploadDocument: (operationId: string, document: { id: number; name: string; type: string; date: string; status: 'approved' | 'pending' }) => void;
  uploadInsurance: (id: string, insuranceType: 'cargo' | 'liability') => void;
  getOperationDocuments: (operationId: string) => Operation['documents'];
  updateOperationCosts: (id: string, costs: Partial<Operation['costs']>) => void;
  updateDocumentStatus: (operationId: string, documentId: number, status: 'approved' | 'pending') => void;
  updateExtraCosts: (id: string, extraCosts: Operation['costs']['extraCosts']) => void;
  deleteOperation: (id: string) => void;
  updatePaymentStatus: (id: string, paymentIndex: number, status: 'paid' | 'pending') => void;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const OperationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [operations, setOperations] = useState<Operation[]>([
    {
      id: '1',
      type: 'international',
      carrierCost: 5000,
      saleValue: 6000,
      documentType: 'crt',
      contractNumber: 'CTR-2024-001',
      clientName: 'Trans Andes Ltd',
      operationNumber: 'OP-2024-001',
      status: 'pending',
      documents: [],
      insurance: {
        cargo: false,
        liability: false
      },
      createdAt: new Date(),
      originCity: 'Santiago',
      destinationCity: 'Buenos Aires',
      requiredDocuments: getRequiredDocuments('international'),
      costs: {
        serviceProviderCost: 5000,
        extraCosts: {
          fuel: 0,
          tolls: 0,
          permits: 0,
          other: 0,
          description: '',
          status: 'pending'
        },
        advancePayment: 1500,
        pendingBalance: 3500,
        paymentSchedule: []
      }
    }
  ]);

  const addOperation = (newOperation: Omit<Operation, 'id' | 'status' | 'documents' | 'createdAt' | 'insurance' | 'requiredDocuments' | 'costs'>) => {
    const operation: Operation = {
      ...newOperation,
      id: newOperation.operationNumber,
      status: 'pending',
      documents: [],
      insurance: {
        cargo: false,
        liability: false
      },
      createdAt: new Date(),
      requiredDocuments: getRequiredDocuments(newOperation.type),
      costs: {
        serviceProviderCost: newOperation.carrierCost,
        extraCosts: {
          fuel: 0,
          tolls: 0,
          permits: 0,
          other: 0,
          description: '',
          status: 'pending'
        },
        advancePayment: newOperation.carrierCost * 0.3,
        pendingBalance: newOperation.carrierCost * 0.7,
        paymentSchedule: []
      }
    };
    
    const updatedOperation = {
      ...operation,
      costs: {
        ...operation.costs,
        paymentSchedule: calculatePaymentSchedule(operation, { advance: 30, daysToPayment: 30 })
      }
    };
    
    setOperations([...operations, updatedOperation]);
  };

  const updateOperation = useCallback((id: string, updates: Partial<Operation>) => {
    setOperations(operations => operations.map(op => 
      op.id === id ? { ...op, ...updates } : op
    ));
  }, []);

  const startOperation = useCallback((id: string, serviceProvider: string) => {
    setOperations(operations => operations.map(op =>
      op.id === id ? {
        ...op,
        status: 'in_progress',
        startedAt: new Date(),
        serviceProvider
      } : op
    ));
  }, []);

  const completeOperation = useCallback((id: string) => {
    setOperations(operations => operations.map(op =>
      op.id === id ? {
        ...op,
        status: 'completed',
        completedAt: new Date()
      } : op
    ));
  }, []);

  const uploadDocument = useCallback((operationId: string, document: { id: number; name: string; type: string; date: string; status: 'approved' | 'pending' }) => {
    setOperations(operations => operations.map(op =>
      op.id === operationId ? {
        ...op,
        documents: [...op.documents, document],
        requiredDocuments: op.requiredDocuments.map(req =>
          req.name === document.type ? { ...req, uploaded: true } : req
        )
      } : op
    ));
  }, []);

  const uploadInsurance = useCallback((id: string, insuranceType: 'cargo' | 'liability') => {
    setOperations(operations => operations.map(op =>
      op.id === id ? {
        ...op,
        insurance: {
          ...op.insurance,
          [insuranceType]: true
        },
        requiredDocuments: op.requiredDocuments.map(doc =>
          doc.name === `${insuranceType.charAt(0).toUpperCase() + insuranceType.slice(1)} Insurance`
            ? { ...doc, uploaded: true }
            : doc
        )
      } : op
    ));
  }, []);

  const getOperationDocuments = useCallback((operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    return operation ? operation.documents : [];
  }, [operations]);

  const updateOperationCosts = useCallback((id: string, costs: Partial<Operation['costs']>) => {
    setOperations(operations => operations.map(op =>
      op.id === id ? {
        ...op,
        costs: {
          ...op.costs,
          ...costs
        }
      } : op
    ));
  }, []);

  const updateDocumentStatus = useCallback((operationId: string, documentId: number, status: 'approved' | 'pending') => {
    setOperations(operations => operations.map(op =>
      op.id === operationId ? {
        ...op,
        documents: op.documents.map(doc =>
          doc.id === documentId ? { ...doc, status } : doc
        )
      } : op
    ));
  }, []);

  const updateExtraCosts = useCallback((id: string, extraCosts: Operation['costs']['extraCosts']) => {
    setOperations(operations => operations.map(op => {
      if (op.id === id) {
        const updatedOperation = {
          ...op,
          costs: {
            ...op.costs,
            extraCosts,
            paymentSchedule: calculatePaymentSchedule(op, {
              advance: op.costs.advancePayment / op.carrierCost * 100,
              daysToPayment: 30
            })
          }
        };
        return updatedOperation;
      }
      return op;
    }));
  }, []);

  const updatePaymentStatus = useCallback((id: string, paymentIndex: number, status: 'paid' | 'pending') => {
    setOperations(operations => operations.map(op =>
      op.id === id ? {
        ...op,
        costs: {
          ...op.costs,
          paymentSchedule: op.costs.paymentSchedule.map((payment, index) =>
            index === paymentIndex ? { ...payment, status } : payment
          )
        }
      } : op
    ));
  }, []);

  const deleteOperation = useCallback((id: string) => {
    setOperations(operations => operations.filter(op => op.id !== id));
  }, []);

  return (
    <OperationsContext.Provider value={{ 
      operations, 
      addOperation,
      updateOperation,
      startOperation,
      completeOperation,
      uploadDocument,
      uploadInsurance,
      getOperationDocuments,
      updateOperationCosts,
      updateDocumentStatus,
      updateExtraCosts,
      deleteOperation,
      updatePaymentStatus
    }}>
      {children}
    </OperationsContext.Provider>
  );
};

export const useOperations = () => {
  const context = useContext(OperationsContext);
  if (context === undefined) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
};

const getRequiredDocuments = (type: 'international' | 'national') => {
  const baseDocuments = [
    { type: 'insurance', name: 'Cargo Insurance', required: true, uploaded: false },
    { type: 'insurance', name: 'Liability Insurance', required: true, uploaded: false }
  ];

  if (type === 'international') {
    return [
      ...baseDocuments,
      { type: 'document', name: 'CRT', required: true, uploaded: false },
      { type: 'document', name: 'MIC/DTA', required: true, uploaded: false }
    ];
  }

  return [
    ...baseDocuments,
    { type: 'document', name: 'National Waybill', required: true, uploaded: false }
  ];
};

const calculatePaymentSchedule = (operation: Operation, terms: any) => {
  const today = new Date();
  const schedule = [];

  // Provider payments
  if (terms.advance > 0) {
    schedule.push({
      description: `Provider Advance Payment (${terms.advance}%)`,
      amount: operation.carrierCost * (terms.advance / 100),
      dueDate: today,
      status: 'pending',
      type: 'provider'
    });
  }

  const remainingPercentage = 100 - terms.advance;
  if (remainingPercentage > 0) {
    const dueDate = new Date(today.getTime() + terms.daysToPayment * 24 * 60 * 60 * 1000);
    schedule.push({
      description: `Provider Balance Payment (${remainingPercentage}%)`,
      amount: operation.carrierCost * (remainingPercentage / 100),
      dueDate: dueDate,
      status: 'pending',
      type: 'provider'
    });
  }

  // Extra costs
  const extraCosts = operation.costs.extraCosts;
  if (extraCosts.fuel > 0) {
    schedule.push({
      description: 'Fuel Cost',
      amount: extraCosts.fuel,
      dueDate: extraCosts.forecastedDate || today,
      status: extraCosts.status || 'pending',
      type: 'extra'
    });
  }

  if (extraCosts.tolls > 0) {
    schedule.push({
      description: 'Toll Costs',
      amount: extraCosts.tolls,
      dueDate: extraCosts.forecastedDate || today,
      status: extraCosts.status || 'pending',
      type: 'extra'
    });
  }

  if (extraCosts.permits > 0) {
    schedule.push({
      description: 'Permit Costs',
      amount: extraCosts.permits,
      dueDate: extraCosts.forecastedDate || today,
      status: extraCosts.status || 'pending',
      type: 'extra'
    });
  }

  if (extraCosts.other > 0) {
    schedule.push({
      description: extraCosts.description || 'Other Costs',
      amount: extraCosts.other,
      dueDate: extraCosts.forecastedDate || today,
      status: extraCosts.status || 'pending',
      type: 'extra'
    });
  }

  return schedule;
};