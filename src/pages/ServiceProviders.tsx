import React, { useState } from 'react';
import { useServiceProviders, PAYMENT_TERMS } from '../contexts/ServiceProvidersContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  UserIcon, 
  PlusIcon, 
  SearchIcon, 
  XIcon, 
  MailIcon, 
  PhoneIcon, 
  AwardIcon as IdCardIcon, 
  ArrowUpDownIcon, 
  TruckIcon,
  DollarSignIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowRightIcon,
  MapPinIcon,
  CalendarIcon
} from 'lucide-react';

const ServiceProviders: React.FC = () => {
  const { providers, addProvider, updateProvider, deleteProvider, getProviderOperations } = useServiceProviders();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [newProvider, setNewProvider] = useState({
    name: '',
    taxId: '',
    email: '',
    phone: '',
    type: 'national',
    paymentTermsUSD: PAYMENT_TERMS.advance50_balance50,
    paymentTermsCLP: PAYMENT_TERMS.advance50_balance50
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProvider) {
      updateProvider(editingProvider, newProvider);
      setEditingProvider(null);
    } else {
      addProvider(newProvider);
    }
    setShowForm(false);
    setNewProvider({
      name: '',
      taxId: '',
      email: '',
      phone: '',
      type: 'national',
      paymentTermsUSD: PAYMENT_TERMS.advance50_balance50,
      paymentTermsCLP: PAYMENT_TERMS.advance50_balance50
    });
  };

  const handleEdit = (provider: any) => {
    setEditingProvider(provider.id);
    setNewProvider({
      ...provider,
      type: provider.type || 'national'
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this provider?')) {
      deleteProvider(id);
    }
  };

  const handleViewDetails = (provider: any) => {
    setSelectedProvider(provider.id);
    setShowDetails(true);
  };

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.taxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProviderData = providers.find(p => p.id === selectedProvider);
  const providerOperations = selectedProvider ? getProviderOperations(selectedProvider) : [];

  const getPaymentTermsDisplay = (terms: any) => {
    if (!terms) return '';
    return typeof terms === 'object' ? terms.description : terms;
  };

  return (
    <div className="animate-fade-in">
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingProvider ? t('editProvider') : t('newServiceProvider')}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProvider(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('providerName')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="input pl-10"
                      value={newProvider.name}
                      onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('taxId')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdCardIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="input pl-10"
                      value={newProvider.taxId}
                      onChange={(e) => setNewProvider({ ...newProvider, taxId: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('email')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MailIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      className="input pl-10"
                      value={newProvider.email}
                      onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('phone')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      className="input pl-10"
                      value={newProvider.phone}
                      onChange={(e) => setNewProvider({ ...newProvider, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    className="select"
                    value={newProvider.type}
                    onChange={(e) => setNewProvider({ ...newProvider, type: e.target.value })}
                    required
                  >
                    <option value="national">National</option>
                    <option value="international">International</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('paymentTermsUSD')}
                  </label>
                  <select
                    className="select"
                    value={Object.keys(PAYMENT_TERMS).find(
                      key => PAYMENT_TERMS[key as keyof typeof PAYMENT_TERMS] === newProvider.paymentTermsUSD
                    )}
                    onChange={(e) => setNewProvider({
                      ...newProvider,
                      paymentTermsUSD: PAYMENT_TERMS[e.target.value as keyof typeof PAYMENT_TERMS]
                    })}
                    required
                  >
                    {Object.entries(PAYMENT_TERMS).map(([key, terms]) => (
                      <option key={key} value={key}>
                        {terms.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('paymentTermsCLP')}
                  </label>
                  <select
                    className="select"
                    value={Object.keys(PAYMENT_TERMS).find(
                      key => PAYMENT_TERMS[key as keyof typeof PAYMENT_TERMS] === newProvider.paymentTermsCLP
                    )}
                    onChange={(e) => setNewProvider({
                      ...newProvider,
                      paymentTermsCLP: PAYMENT_TERMS[e.target.value as keyof typeof PAYMENT_TERMS]
                    })}
                    required
                  >
                    {Object.entries(PAYMENT_TERMS).map(([key, terms]) => (
                      <option key={key} value={key}>
                        {terms.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProvider(null);
                  }}
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProvider ? t('save') : t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetails && selectedProviderData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('providerDetails')}</h2>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedProvider(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Provider Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="font-medium">{selectedProviderData.name}</p>
                      <p className="text-sm text-gray-500">{selectedProviderData.taxId}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MailIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p>{selectedProviderData.email}</p>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p>{selectedProviderData.phone}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Payment Terms</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">USD Terms</p>
                    <p className="text-lg">{getPaymentTermsDisplay(selectedProviderData.paymentTermsUSD)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">CLP Terms</p>
                    <p className="text-lg">{getPaymentTermsDisplay(selectedProviderData.paymentTermsCLP)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg">
              <h3 className="text-lg font-medium mb-4">Recent Operations</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        {t('operationNumber')}
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        {t('route')}
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        {t('type')}
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        {t('status')}
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Value (USD)
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Value (CLP)
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Payment Terms
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {providerOperations.map((operation) => (
                      <tr key={operation.operationId} className="hover:bg-gray-100">
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                            {operation.operationNumber}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                            {operation.route}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            operation.type === 'international'
                              ? 'bg-primary-100 text-primary-800'
                              : 'bg-secondary-100 text-secondary-800'
                          }`}>
                            {operation.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            operation.status === 'completed' ? 'bg-success-100 text-success-800' :
                            operation.status === 'in_progress' ? 'bg-primary-100 text-primary-800' :
                            'bg-warning-100 text-warning-800'
                          }`}>
                            {t(operation.status === 'in_progress' ? 'inProgress' : operation.status)}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          ${operation.serviceValue.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          CLP {operation.serviceValueCLP.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {operation.paymentTerms}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('serviceProviders')}</h2>
            <p className="text-gray-500 mt-1">{t('manageServiceProviders')}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              {t('newServiceProvider')}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('searchProviders')}
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('providerName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('taxId')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('contact')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Terms
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('operations')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProviders.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(provider.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        provider.type === 'international'
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-secondary-100 text-secondary-800'
                      }`}>
                        {provider.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{provider.taxId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{provider.email}</div>
                      <div className="text-sm text-gray-500">{provider.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <DollarSignIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span>USD: {getPaymentTermsDisplay(provider.paymentTermsUSD)}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSignIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span>CLP: {getPaymentTermsDisplay(provider.paymentTermsCLP)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedProvider(selectedProvider === provider.id ? null : provider.id)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {t('viewOperations')}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(provider)}
                          className="text-gray-600 hover:text-gray-900"
                          title={t('viewDetails')}
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(provider)}
                          className="text-primary-600 hover:text-primary-900"
                          title={t('edit')}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(provider.id)}
                          className="text-error-600 hover:text-error-900"
                          title={t('delete')}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviders;