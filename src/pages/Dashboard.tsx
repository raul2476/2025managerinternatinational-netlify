import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useOperations } from '../contexts/OperationsContext';
import { useServiceProviders } from '../contexts/ServiceProvidersContext';
import { useClients } from '../contexts/ClientsContext';
import { 
  TruckIcon, 
  HomeIcon, 
  FileTextIcon,
  DollarSignIcon, 
  TrendingUpIcon, 
  PlusIcon, 
  XIcon, 
  UserIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  SearchIcon,
  FilterIcon,
  MapPinIcon,
  ArrowRightIcon,
  CalendarIcon,
  BanIcon
} from 'lucide-react';
import Chart from '../components/Chart';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { operations, addOperation, updateOperation } = useOperations();
  const { providers } = useServiceProviders();
  const { clients, getClientPaymentTerms } = useClients();
  const [showNewOperationForm, setShowNewOperationForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [documentFilter, setDocumentFilter] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [operationToCancel, setOperationToCancel] = useState<string | null>(null);
  const [newOperation, setNewOperation] = useState({
    type: 'international',
    carrierCost: '',
    saleValue: '',
    documentType: 'crt',
    contractNumber: '',
    clientName: '',
    operationNumber: '',
    originCity: '',
    destinationCity: '',
    serviceProvider: ''
  });

  // Exchange rate (in a real app, this would come from your exchange rate service)
  const exchangeRate = 850.25;

  // Calculate financial metrics
  const metrics = {
    totalTrips: operations.length,
    activeDocuments: operations.reduce((sum, op) => sum + op.documents.length, 0),
    pendingDocuments: operations.reduce((sum, op) => 
      sum + op.documents.filter(d => d.status === 'pending').length, 0
    ),
    revenue: {
      usd: operations
        .filter(op => op.type === 'international')
        .reduce((sum, op) => sum + op.saleValue, 0),
      clp: operations
        .filter(op => op.type === 'national')
        .reduce((sum, op) => sum + op.saleValue, 0)
    },
    pendingPayments: operations.reduce((sum, op) => 
      sum + op.costs.paymentSchedule
        .filter(p => p.status === 'pending')
        .reduce((pSum, p) => pSum + p.amount, 0), 
      0
    ),
    pendingInvoices: operations.reduce((sum, op) => 
      sum + op.costs.paymentSchedule
        .filter(p => p.status === 'pending').length, 
      0
    )
  };

  // Calculate provider costs for chart
  const providerCostsData = providers.map(provider => {
    const providerOperations = operations.filter(op => op.serviceProvider === provider.name);
    const totalCosts = providerOperations.reduce((sum, op) => {
      const baseCost = op.carrierCost;
      const extraCosts = 
        op.costs.extraCosts.fuel +
        op.costs.extraCosts.tolls +
        op.costs.extraCosts.permits +
        op.costs.extraCosts.other;
      return sum + baseCost + extraCosts;
    }, 0);

    return {
      name: provider.name,
      value: totalCosts
    };
  });

  // Calculate extra costs distribution
  const extraCostsData = operations.reduce((acc, op) => {
    acc.fuel += op.costs.extraCosts.fuel;
    acc.tolls += op.costs.extraCosts.tolls;
    acc.permits += op.costs.extraCosts.permits;
    acc.other += op.costs.extraCosts.other;
    return acc;
  }, { fuel: 0, tolls: 0, permits: 0, other: 0 });

  const extraCostsChartData = [
    { name: 'Fuel', value: extraCostsData.fuel },
    { name: 'Tolls', value: extraCostsData.tolls },
    { name: 'Permits', value: extraCostsData.permits },
    { name: 'Other', value: extraCostsData.other }
  ];

  // Calculate monthly revenue trend
  const monthlyRevenue = operations.reduce((acc, op) => {
    const month = new Date(op.createdAt).toLocaleString('default', { month: 'short' });
    const revenue = op.type === 'international' ? op.saleValue : op.saleValue / exchangeRate;
    
    const existingMonth = acc.find(m => m.month === month);
    if (existingMonth) {
      existingMonth.value += revenue;
    } else {
      acc.push({ month, value: revenue });
    }
    return acc;
  }, [] as { month: string; value: number }[]);

  // Calculate operation status distribution
  const statusDistribution = operations.reduce((acc, op) => {
    acc[op.status] = (acc[op.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusDistribution).map(([status, count]) => ({
    name: status,
    value: count
  }));

  useEffect(() => {
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient);
      if (client) {
        setNewOperation(prev => ({
          ...prev,
          clientName: client.name
        }));
      }
    }
  }, [selectedClient, clients]);

  useEffect(() => {
    if (newOperation.type === 'national') {
      setNewOperation(prev => ({
        ...prev,
        carrierCost: prev.carrierCost ? String(Math.round(parseFloat(prev.carrierCost) * exchangeRate)) : '',
        saleValue: prev.saleValue ? String(Math.round(parseFloat(prev.saleValue) * exchangeRate)) : ''
      }));
    } else {
      setNewOperation(prev => ({
        ...prev,
        carrierCost: prev.carrierCost ? String(Math.round(parseFloat(prev.carrierCost) / exchangeRate)) : '',
        saleValue: prev.saleValue ? String(Math.round(parseFloat(prev.saleValue) / exchangeRate)) : ''
      }));
    }
  }, [newOperation.type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOperation({
      ...newOperation,
      carrierCost: parseFloat(newOperation.carrierCost),
      saleValue: parseFloat(newOperation.saleValue),
    });
    setShowNewOperationForm(false);
    setNewOperation({
      type: 'international',
      carrierCost: '',
      saleValue: '',
      documentType: 'crt',
      contractNumber: '',
      clientName: '',
      operationNumber: '',
      originCity: '',
      destinationCity: '',
      serviceProvider: ''
    });
    setSelectedClient('');
  };

  const handlePaymentStatusChange = (operationId: string, status: 'paid' | 'pending') => {
    updateOperation(operationId, {
      costs: {
        ...operations.find(op => op.id === operationId)?.costs,
        paymentSchedule: operations.find(op => op.id === operationId)?.costs.paymentSchedule.map(payment => ({
          ...payment,
          status: status
        }))
      }
    });
  };

  const handleCancelOperation = (operationId: string) => {
    setOperationToCancel(operationId);
    setShowCancelConfirm(true);
  };

  const confirmCancelOperation = () => {
    if (operationToCancel) {
      updateOperation(operationToCancel, {
        status: 'canceled',
        canceledAt: new Date()
      });
      setShowCancelConfirm(false);
      setOperationToCancel(null);
    }
  };

  const selectedProvider = providers.find(p => p.id === newOperation.serviceProvider);
  const selectedClientData = clients.find(c => c.id === selectedClient);
  const clientPaymentTerms = selectedClient ? getClientPaymentTerms(selectedClient, newOperation.type === 'national' ? 'CLP' : 'USD') : null;

  const recentOperations = [...operations]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 4);

  // Filter recent operations based on document type
  const filteredRecentOperations = recentOperations.filter(operation => {
    if (!documentFilter) return true;
    
    const hasDocument = operation.documents.some(doc => 
      doc.type.toLowerCase() === documentFilter.toLowerCase()
    );
    return hasDocument;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
        <button
          onClick={() => setShowNewOperationForm(true)}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('newOperation')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card transition-all hover:shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">{t('totalTrips')}</p>
              <p className="text-2xl font-bold">{metrics.totalTrips}</p>
            </div>
            <div className="rounded-full bg-primary-100 p-3">
              <TruckIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-success-600 flex items-center">
              <TrendingUpIcon className="h-4 w-4 mr-1" />
              <span>8% {t('increase')}</span>
            </p>
          </div>
        </div>

        <div className="card transition-all hover:shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">{t('activeDocuments')}</p>
              <p className="text-2xl font-bold">{metrics.activeDocuments}</p>
            </div>
            <div className="rounded-full bg-secondary-100 p-3">
              <FileTextIcon className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 flex items-center">
              <span>{metrics.pendingDocuments} {t('pendingApproval')}</span>
            </p>
          </div>
        </div>

        <div className="card transition-all hover:shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">{t('monthlyRevenue')}</p>
              <div>
                <p className="text-2xl font-bold">${metrics.revenue.usd.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  CLP {metrics.revenue.clp.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="rounded-full bg-accent-100 p-3">
              <DollarSignIcon className="h-6 w-6 text-accent-500" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-success-600 flex items-center">
              <TrendingUpIcon className="h-4 w-4 mr-1" />
              <span>5.2% {t('increase')}</span>
            </p>
          </div>
        </div>

        <div className="card transition-all hover:shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">{t('pendingPayments')}</p>
              <p className="text-2xl font-bold">${metrics.pendingPayments.toLocaleString()}</p>
            </div>
            <div className="rounded-full bg-warning-100 p-3">
              <DollarSignIcon className="h-6 w-6 text-warning-500" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 flex items-center">
              <span>{metrics.pendingInvoices} invoices {t('pending')}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue (USD)</h3>
          <Chart 
            type="line"
            data={monthlyRevenue}
            dataKey="value"
            nameKey="month"
            height={300}
            valuePrefix="$"
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Provider Costs</h3>
          <Chart 
            type="bar"
            data={providerCostsData}
            dataKey="value"
            nameKey="name"
            height={300}
            valuePrefix="$"
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Extra Costs Distribution</h3>
          <Chart 
            type="pie"
            data={extraCostsChartData}
            dataKey="value"
            nameKey="name"
            height={300}
            valuePrefix="$"
            colors={['#1E3A8A', '#0D9488', '#F59E0B', '#059669']}
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Operations by Status</h3>
          <Chart 
            type="pie"
            data={statusChartData}
            dataKey="value"
            nameKey="name"
            height={300}
            colors={['#059669', '#F59E0B', '#1E3A8A']}
          />
        </div>
      </div>

      {showNewOperationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('newOperation')}</h2>
              <button
                onClick={() => setShowNewOperationForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('client')}
                  </label>
                  <select
                    className="select"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    required
                  >
                    <option value="">{t('selectOption')}</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.taxId})
                      </option>
                    ))}
                  </select>
                  {selectedClientData && (
                    <div className="mt-2 bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Contact</h4>
                          <p className="text-sm text-gray-600">{selectedClientData.email}</p>
                          <p className="text-sm text-gray-600">{selectedClientData.phone}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Payment Terms</h4>
                          <p className="text-sm text-gray-600">
                            {clientPaymentTerms?.advance}% advance, {clientPaymentTerms?.daysToPayment} days
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('operationType')}
                  </label>
                  <select
                    className="select"
                    value={newOperation.type}
                    onChange={(e) => setNewOperation({ ...newOperation, type: e.target.value as 'international' | 'national' })}
                    required
                  >
                    <option value="international">{t('international')}</option>
                    <option value="national">{t('national')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('documentType')}
                  </label>
                  <select
                    className="select"
                    value={newOperation.documentType}
                    onChange={(e) => setNewOperation({ ...newOperation, documentType: e.target.value as 'crt' | 'mic' })}
                    required
                  >
                    <option value="crt">CRT</option>
                    <option value="mic">MIC/DTA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('originCity')}
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newOperation.originCity}
                    onChange={(e) => setNewOperation({ ...newOperation, originCity: e.target.value })}
                    placeholder="Santiago"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('destinationCity')}
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newOperation.destinationCity}
                    onChange={(e) => setNewOperation({ ...newOperation, destinationCity: e.target.value })}
                    placeholder="Buenos Aires"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('carrierCost')} {newOperation.type === 'national' ? '(CLP)' : '(USD)'}
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={newOperation.carrierCost}
                    onChange={(e) => setNewOperation({ ...newOperation, carrierCost: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('saleValue')} {newOperation.type === 'national' ? '(CLP)' : '(USD)'}
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={newOperation.saleValue}
                    onChange={(e) => setNewOperation({ ...newOperation, saleValue: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('contractNumber')}
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newOperation.contractNumber}
                    onChange={(e) => setNewOperation({ ...newOperation, contractNumber: e.target.value })}
                    placeholder="CTR-2024-..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('operationNumber')}
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newOperation.operationNumber}
                    onChange={(e) => setNewOperation({ ...newOperation, operationNumber: e.target.value })}
                    placeholder="1234-2024TI"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('serviceProvider')}
                  </label>
                  <select
                    className="select"
                    value={newOperation.serviceProvider}
                    onChange={(e) => setNewOperation({ ...newOperation, serviceProvider: e.target.value })}
                  >
                    <option value="">{t('selectProvider')}</option>
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name} ({provider.taxId})
                      </option>
                    ))}
                  </select>
                  {selectedProvider && (
                    <div className="mt-2 bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">{t('paymentTermsUSD')}</h4>
                          <p className="text-sm text-gray-600">{selectedProvider.paymentTermsUSD?.description || selectedProvider.paymentTermsUSD}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">{t('paymentTermsCLP')}</h4>
                          <p className="text-sm text-gray-600">{selectedProvider.paymentTermsCLP?.description || selectedProvider.paymentTermsCLP}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">{t('contact')}</h4>
                          <p className="text-sm text-gray-600">{selectedProvider.email}</p>
                          <p className="text-sm text-gray-600">{selectedProvider.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewOperationForm(false)}
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <BanIcon className="h-6 w-6 text-error-600 mr-2" />
              <h2 className="text-xl font-bold">Cancel Operation</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this operation? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setOperationToCancel(null);
                }}
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                No, Keep Operation
              </button>
              <button
                onClick={confirmCancelOperation}
                className="btn bg-error-600 text-white hover:bg-error-700"
              >
                Yes, Cancel Operation
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{t('activeTrips')}</h3>
          <div className="flex space-x-2">
            <div className="relative">
              <select
                className="select w-auto text-sm"
                value={documentFilter}
                onChange={(e) => setDocumentFilter(e.target.value)}
              >
                <option value="">All Documents</option>
                <option value="CRT">CRT</option>
                <option value="MIC">MIC/DTA</option>
              </select>
            </div>
            <select className="select w-auto text-sm">
              <option value="all">{t('allClients')}</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            <button className="btn btn-primary text-sm">{t('exportToExcel')}</button>
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>{t('operationNumber')}</th>
                <th>{t('client')}</th>
                <th>{t('type')}</th>
                <th>{t('status')}</th>
                <th>{t('documents')}</th>
                <th>{t('carrierCost')}</th>
                <th>{t('saleValue')}</th>
                <th>{t('paymentStatus')}</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecentOperations.map((operation) => (
                <tr key={operation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="font-medium text-gray-900">{operation.operationNumber}</td>
                  <td>{operation.clientName}</td>
                  <td>{t(operation.type)}</td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      operation.status === 'completed' ? 'bg-success-100 text-success-800' :
                      operation.status === 'in_progress' ? 'bg-primary-100 text-primary-800' :
                      operation.status === 'canceled' ? 'bg-error-100 text-error-800' :
                      'bg-warning-100 text-warning-800'
                    }`}>
                      {operation.status === 'canceled' ? 'Canceled' : t(operation.status === 'in_progress' ? 'inProgress' : operation.status)}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-1">
                      {operation.documents.map((doc, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs rounded-full ${
                            doc.status === 'approved' 
                              ? 'bg-success-100 text-success-800' 
                              : 'bg-warning-100 text-warning-800'
                          }`}
                        >
                          {doc.type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {operation.type === 'national' 
                      ? `CLP ${operation.carrierCost.toLocaleString()}`
                      : `$${operation.carrierCost.toLocaleString()}`
                    }
                  </td>
                  <td>
                    {operation.type === 'national'
                      ? `CLP ${operation.saleValue.toLocaleString()}`
                      : `$${operation.saleValue.toLocaleString()}`
                    }
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePaymentStatusChange(operation.id, 'paid')}
                        className={`px-2 py-1 text-xs rounded-full flex items-center ${
                          operation.costs.paymentSchedule.every(p => p.status === 'paid')
                            ? 'bg-success-100 text-success-800'
                            : 'bg-gray-100 text-gray-800 hover:bg-success-50'
                        }`}
                      >
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        {t('paid')}
                      </button>
                      <button
                        onClick={() => handlePaymentStatusChange(operation.id, 'pending')}
                        className={`px-2 py-1 text-xs rounded-full flex items-center ${
                          operation.costs.paymentSchedule.some(p => p.status === 'pending')
                            ? 'bg-warning-100 text-warning-800'
                            : 'bg-gray-100 text-gray-800 hover:bg-warning-50'
                        }`}
                      >
                        <AlertCircleIcon className="h-3 w-3 mr-1" />
                        {t('pending')}
                      </button>
                    </div>
                  </td>
                  <td className="text-right">
                    {operation.status !== 'canceled' && (
                      <button
                        onClick={() => handleCancelOperation(operation.id)}
                        className="text-error-600 hover:text-error-900"
                        title="Cancel Operation"
                      >
                        <BanIcon className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;