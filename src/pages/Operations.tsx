import React, { useState } from 'react';
import { useOperations } from '../contexts/OperationsContext';
import { useServiceProviders } from '../contexts/ServiceProvidersContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFleet } from '../contexts/FleetContext';
import { 
  TruckIcon, 
  PlusIcon, 
  SearchIcon, 
  XIcon, 
  UserIcon, 
  DollarSignIcon, 
  MapPinIcon, 
  BuildingIcon, 
  ArrowRightIcon, 
  PencilIcon, 
  ShieldCheckIcon, 
  FileTextIcon, 
  UploadIcon, 
  PlayIcon, 
  DownloadIcon, 
  TrashIcon,
  FilterIcon,
  ArrowUpDownIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon
} from 'lucide-react';
import { exportToExcel, formatOperationsForExcel } from '../utils/excel';

const Operations: React.FC = () => {
  const { operations, addOperation, startOperation, completeOperation, uploadDocument, uploadInsurance, updateExtraCosts, deleteOperation } = useOperations();
  const { providers } = useServiceProviders();
  const { t } = useLanguage();
  const { getAvailableVehicles, assignToOperation, getVehicleByOperation, completeOperation: completeFleetOperation } = useFleet();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'operationNumber' | 'createdAt' | 'clientName'>('operationNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showServiceProviderModal, setShowServiceProviderModal] = useState(false);
  const [selectedOperationId, setSelectedOperationId] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [showExtraCostsModal, setShowExtraCostsModal] = useState(false);
  const [extraCosts, setExtraCosts] = useState({
    fuel: 0,
    tolls: 0,
    permits: 0,
    other: 0,
    description: ''
  });
  const [showNewOperationForm, setShowNewOperationForm] = useState(false);
  const [newOperation, setNewOperation] = useState({
    type: 'fleet',
    carrierCost: '',
    saleValue: '',
    documentType: 'crt',
    contractNumber: '',
    clientName: '',
    operationNumber: '',
    originCity: '',
    destinationCity: '',
    currency: 'USD' as 'USD' | 'CLP'
  });

  const filteredOperations = operations
    .filter(op => {
      const matchesSearch = 
        op.operationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.originCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.destinationCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (op.serviceProvider?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filter === 'all' || 
        op.status === filter;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortField === 'createdAt') {
        return sortDirection === 'asc' 
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime();
      }
      return sortDirection === 'asc'
        ? a[sortField].localeCompare(b[sortField])
        : b[sortField].localeCompare(a[sortField]);
    });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleStartOperation = (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    
    if (!operation) return;

    if (operation.type === 'fleet') {
      const availableVehicles = getAvailableVehicles();
      if (availableVehicles.length === 0) {
        alert('No available vehicles for this operation. Please check the fleet status.');
        return;
      }
      assignToOperation(availableVehicles[0].id, operationId, operation);
      startOperation(operationId, '');
    } else {
      setSelectedOperationId(operationId);
      setShowServiceProviderModal(true);
    }
  };

  const handleServiceProviderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOperationId && selectedProviderId) {
      const provider = providers.find(p => p.id === selectedProviderId);
      if (provider) {
        startOperation(selectedOperationId, provider.name);
        setShowServiceProviderModal(false);
        setSelectedOperationId(null);
        setSelectedProviderId('');
      }
    }
  };

  const handleCompleteOperation = (operationId: string) => {
    const vehicle = getVehicleByOperation(operationId);
    
    if (vehicle) {
      completeFleetOperation(vehicle.id, operationId, new Date());
    }
    
    completeOperation(operationId);
  };

  const handleEditExtraCosts = (operation: any) => {
    setSelectedOperationId(operation.id);
    setExtraCosts(operation.costs.extraCosts);
    setShowExtraCostsModal(true);
  };

  const handleExtraCostsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOperationId) {
      updateExtraCosts(selectedOperationId, extraCosts);
      setShowExtraCostsModal(false);
      setSelectedOperationId(null);
      setExtraCosts({
        fuel: 0,
        tolls: 0,
        permits: 0,
        other: 0,
        description: ''
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOperation({
      ...newOperation,
      carrierCost: parseFloat(newOperation.carrierCost),
      saleValue: parseFloat(newOperation.saleValue),
      status: 'pending',
      createdAt: new Date(),
      costs: {
        extraCosts: {
          fuel: 0,
          tolls: 0,
          permits: 0,
          other: 0,
          description: ''
        }
      }
    });
    setShowNewOperationForm(false);
    setNewOperation({
      type: 'fleet',
      carrierCost: '',
      saleValue: '',
      documentType: 'crt',
      contractNumber: '',
      clientName: '',
      operationNumber: '',
      originCity: '',
      destinationCity: '',
      currency: 'USD'
    });
  };

  const handleDeleteOperation = (id: string) => {
    if (window.confirm('Are you sure you want to delete this operation? This action cannot be undone.')) {
      deleteOperation(id);
    }
  };

  const handleExportToExcel = () => {
    const data = formatOperationsForExcel(filteredOperations);
    exportToExcel(data, 'operations-report');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-success-600" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-primary-600" />;
      default:
        return <AlertCircleIcon className="h-5 w-5 text-warning-600" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'in_progress':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-warning-100 text-warning-800';
    }
  };

  const getOperationRequirements = (operation: any) => {
    const requirements = [];
    
    if (!operation.documents || operation.documents.length === 0) {
      requirements.push({
        type: 'documents',
        icon: <FileTextIcon className="h-4 w-4 text-warning-500" />,
        label: t('missingDocuments'),
        items: ['CRT', 'MIC/DTA'],
        count: 2,
        uploaded: operation.documents?.length || 0,
        onUpload: (type: string) => uploadDocument(operation.id, type)
      });
    }

    const insuranceCount = 2;
    const uploadedInsurance = (operation.insurance?.cargo ? 1 : 0) + (operation.insurance?.liability ? 1 : 0);
    if (uploadedInsurance < insuranceCount) {
      requirements.push({
        type: 'insurance',
        icon: <ShieldCheckIcon className="h-4 w-4 text-warning-500" />,
        label: t('missingInsurance'),
        items: [
          {
            name: t('cargoInsurance'),
            uploaded: operation.insurance?.cargo || false,
            onUpload: () => uploadInsurance(operation.id, 'cargo')
          },
          {
            name: t('liabilityInsurance'),
            uploaded: operation.insurance?.liability || false,
            onUpload: () => uploadInsurance(operation.id, 'liability')
          }
        ],
        count: insuranceCount,
        uploaded: uploadedInsurance
      });
    }

    if (!operation.serviceProvider && operation.type !== 'fleet') {
      requirements.push({
        type: 'provider',
        icon: <UserIcon className="h-4 w-4 text-warning-500" />,
        label: t('missingServiceProvider'),
        items: [t('assignServiceProvider')],
        count: 1,
        uploaded: operation.serviceProvider ? 1 : 0
      });
    }

    const vehicle = getVehicleByOperation(operation.id);
    if (!vehicle && operation.type === 'fleet') {
      requirements.push({
        type: 'vehicle',
        icon: <TruckIcon className="h-4 w-4 text-warning-500" />,
        label: 'Missing Vehicle Assignment',
        items: ['Assign Vehicle'],
        count: 1,
        uploaded: 0
      });
    }

    return requirements;
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('operations')}</h2>
            <p className="text-gray-500 mt-1">{t('manageOperations')}</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button
              onClick={() => setShowNewOperationForm(true)}
              className="btn btn-primary flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Operation
            </button>
            <button
              onClick={handleExportToExcel}
              className="btn btn-primary flex items-center"
            >
              <DownloadIcon className="h-5 w-5 mr-2" />
              Export to Excel
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
              placeholder={t('searchOperations')}
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <FilterIcon className="h-5 w-5 text-gray-400" />
            <select
              className="select w-auto"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">{t('allOperations')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="in_progress">{t('inProgress')}</option>
              <option value="completed">{t('completed')}</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('operationNumber')}
                  >
                    <div className="flex items-center">
                      {t('operationNumber')}
                      <ArrowUpDownIcon className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('route')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('type')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('clientName')}
                  >
                    <div className="flex items-center">
                      {t('client')}
                      <ArrowUpDownIcon className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('carrierCost')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('saleValue')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extra Costs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('requirements')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOperations.map((operation) => {
                  const requirements = getOperationRequirements(operation);
                  const totalExtraCosts = 
                    operation.costs.extraCosts.fuel +
                    operation.costs.extraCosts.tolls +
                    operation.costs.extraCosts.permits +
                    operation.costs.extraCosts.other;

                  const vehicle = getVehicleByOperation(operation.id);

                  return (
                    <tr key={operation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TruckIcon className="h-5 w-5 text-primary-600 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {operation.operationNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(operation.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {operation.originCity}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <ArrowRightIcon className="h-4 w-4 mx-1" />
                              {operation.destinationCity}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          operation.type === 'international' 
                            ? 'bg-primary-100 text-primary-800'
                            : operation.type === 'fleet'
                            ? 'bg-accent-100 text-accent-800'
                            : 'bg-secondary-100 text-secondary-800'
                        }`}>
                          {t(operation.type)}
                        </span>
                        {operation.type === 'fleet' && vehicle && (
                          <div className="mt-1 text-xs text-gray-500">
                            Vehicle: {vehicle.licensePlate}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <BuildingIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {operation.clientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <DollarSignIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {operation.type === 'national' 
                            ? `CLP ${operation.carrierCost.toLocaleString()}`
                            : `$${operation.carrierCost.toLocaleString()}`
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <DollarSignIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {operation.type === 'national'
                            ? `CLP ${operation.saleValue.toLocaleString()}`
                            : `$${operation.saleValue.toLocaleString()}`
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>
                            {operation.type === 'national'
                              ? `CLP ${totalExtraCosts.toLocaleString()}`
                              : `$${totalExtraCosts.toLocaleString()}`
                            }
                          </span>
                          <button
                            onClick={() => handleEditExtraCosts(operation)}
                            className="ml-2 text-primary-600 hover:text-primary-900"
                            title="Edit extra costs"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                        {operation.costs.extraCosts.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {operation.costs.extraCosts.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {requirements.length > 0 ? (
                          <div className="flex flex-col space-y-2">
                            {requirements.map((req, index) => (
                              <div
                                key={index}
                                className="group relative"
                              >
                                <div className={`flex items-center px-3 py-2 rounded-md ${
                                  req.uploaded === req.count
                                    ? 'bg-success-50 text-success-700'
                                    : req.uploaded > 0
                                      ? 'bg-warning-50 text-warning-700'
                                      : 'bg-error-50 text-error-700'
                                }`}>
                                  {req.icon}
                                  <span className="ml-2 text-sm">
                                    {req.uploaded}/{req.count}
                                  </span>
                                </div>

                                <div className="hidden group-hover:block absolute left-0 top-full mt-2 z-10 w-64 p-4 bg-white rounded-md shadow-lg border border-gray-200">
                                  <h4 className="font-medium text-gray-900 mb-2">{req.label}</h4>
                                  {req.type === 'documents' && (
                                    <div className="space-y-2">
                                      {req.items.map((item: string, i: number) => (
                                        <div key={i} className="flex items-center justify-between">
                                          <span className="text-gray-600">{item}</span>
                                          <button
                                            onClick={() => req.onUpload(item)}
                                            className="btn btn-sm bg-primary-50 text-primary-600 hover:bg-primary-100 flex items-center"
                                          >
                                            <UploadIcon className="h-4 w-4 mr-1" />
                                            Upload
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {req.type === 'insurance' && (
                                    <div className="space-y-2">
                                      {req.items.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between">
                                          <span className="text-gray-600">{item.name}</span>
                                          {!item.uploaded && (
                                            <button
                                              onClick={item.onUpload}
                                              className="btn btn-sm bg-primary-50 text-primary-600 hover:bg-primary-100 flex items-center"
                                            >
                                              <UploadIcon className="h-4 w-4 mr-1" />
                                              Upload
                                            </button>
                                          )}
                                          {item.uploaded && (
                                            <CheckCircleIcon className="h-5 w-5 text-success-500" />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {(req.type === 'provider' || req.type === 'vehicle') && (
                                    <div className="space-y-2">
                                      <button
                                        onClick={() => handleStartOperation(operation.id)}
                                        className="btn btn-sm bg-primary-50 text-primary-600 hover:bg-primary-100 w-full flex items-center justify-center"
                                      >
                                        {req.type === 'provider' ? (
                                          <UserIcon className="h-4 w-4 mr-1" />
                                        ) : (
                                          <TruckIcon className="h-4 w-4 mr-1" />
                                        )}
                                        {req.type === 'provider' ? 'Assign Provider' : 'Assign Vehicle'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-success-600 flex items-center">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            {t('complete')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          {getStatusIcon(operation.status)}
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusClass(operation.status)}`}>
                            {t(operation.status === 'in_progress' ? 'inProgress' : operation.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <div className="flex justify-end space-x-2">
                          {operation.status === 'pending' && (
                            <button
                              onClick={() => handleStartOperation(operation.id)}
                              className={`text-primary-600 hover:text-primary-900 flex items-center ${
                                requirements.length > 0 ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              disabled={requirements.length > 0}
                              title={requirements.length > 0 ? t('completeRequirementsFirst') : ''}
                            >
                              <PlayIcon className="h-4 w-4 mr-1" />
                              {t('startOperation')}
                            </button>
                          )}
                          {operation.status === 'in_progress' && (
                            <button
                              onClick={() => handleCompleteOperation(operation.id)}
                              className="text-success-600 hover:text-success-900 flex items-center"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              {t('completeOperation')}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteOperation(operation.id)}
                            className="text-error-600 hover:text-error-900"
                            title="Delete operation"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showServiceProviderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('assignServiceProvider')}</h2>
              <button
                onClick={() => {
                  setShowServiceProviderModal(false);
                  setSelectedOperationId(null);
                  setSelectedProviderId('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleServiceProviderSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('serviceProvider')}
                </label>
                <select
                  className="select"
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  required
                >
                  <option value="">{t('selectProvider')}</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} ({provider.taxId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowServiceProviderModal(false);
                    setSelectedOperationId(null);
                    setSelectedProviderId('');
                  }}
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!selectedProviderId}
                >
                  {t('assign')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExtraCostsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Extra Costs</h2>
              <button
                onClick={() => {
                  setShowExtraCostsModal(false);
                  setSelectedOperationId(null);
                  setExtraCosts({
                    fuel: 0,
                    tolls: 0,
                    permits: 0,
                    other: 0,
                    description: ''
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleExtraCostsSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Costs
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={extraCosts.fuel}
                    onChange={(e) => setExtraCosts({ ...extraCosts, fuel: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Toll Costs
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={extraCosts.tolls}
                    onChange={(e) => setExtraCosts({ ...extraCosts, tolls: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permit Costs
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={extraCosts.permits}
                    onChange={(e) => setExtraCosts({ ...extraCosts, permits: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Costs
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={extraCosts.other}
                    onChange={(e) => setExtraCosts({ ...extraCosts, other: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="input"
                    value={extraCosts.description}
                    onChange={(e) => setExtraCosts({ ...extraCosts, description: e.target.value })}
                    rows={3}
                    placeholder="Enter description for extra costs..."
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
                  <p className="text-sm text-gray-600">
                    Total Extra Costs: ${(extraCosts.fuel + extraCosts.tolls + extraCosts.permits + extraCosts.other).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowExtraCostsModal(false);
                    setSelectedOperationId(null);
                    setExtraCosts({
                      fuel: 0,
                      tolls: 0,
                      permits: 0,
                      other: 0,
                      description: ''
                    });
                  }}
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewOperationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">New Operation</h2>
              <button
                onClick={() => setShowNewOperationForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operation Type
                  </label>
                  <select
                    className="select"
                    value={newOperation.type}
                    onChange={(e) => setNewOperation({ ...newOperation, type: e.target.value })}
                    required
                  >
                    <option value="fleet">Fleet</option>
                    <option value="international">International</option>
                    <option value="national">National</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operation Number
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newOperation.operationNumber}
                    onChange={(e) => setNewOperation({ ...newOperation, operationNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newOperation.clientName}
                    onChange={(e) => setNewOperation({ ...newOperation, clientName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Number
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newOperation.contractNumber}
                    onChange={(e) => setNewOperation({ ...newOperation, contractNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Origin City
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newOperation.originCity}
                    onChange={(e) => setNewOperation({ ...newOperation, originCity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination City
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newOperation.destinationCity}
                    onChange={(e) => setNewOperation({ ...newOperation, destinationCity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    className="select"
                    value={newOperation.currency}
                    onChange={(e) => setNewOperation({ ...newOperation, currency: e.target.value as 'USD' | 'CLP' })}
                    required
                  >
                    <option value="USD">USD</option>
                    <option value="CLP">CLP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carrier Cost ({newOperation.currency})
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={newOperation.carrierCost}
                    onChange={(e) => setNewOperation({ ...newOperation, carrierCost: e.target.value })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Value ({newOperation.currency})
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={newOperation.saleValue}
                    onChange={(e) => setNewOperation({ ...newOperation, saleValue: e.target.value })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewOperationForm(false)}
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Operation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Operations;