import React, { useState } from 'react';
import { useClients, PAYMENT_TERMS } from '../contexts/ClientsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  UserIcon, 
  PlusIcon, 
  SearchIcon, 
  XIcon, 
  MailIcon, 
  PhoneIcon, 
  MapPinIcon,
  BuildingIcon,
  GlobeIcon,
  DollarSignIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon
} from 'lucide-react';

const Clients: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    type: 'national',
    paymentTermsUSD: PAYMENT_TERMS.advance50_net30,
    paymentTermsCLP: PAYMENT_TERMS.advance50_net30
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateClient(editingClient, newClient);
      setEditingClient(null);
    } else {
      addClient(newClient);
    }
    setShowForm(false);
    setNewClient({
      name: '',
      taxId: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      type: 'national',
      paymentTermsUSD: PAYMENT_TERMS.advance50_net30,
      paymentTermsCLP: PAYMENT_TERMS.advance50_net30
    });
  };

  const handleEdit = (client: any) => {
    setEditingClient(client.id);
    setNewClient({
      ...client,
      type: client.type || 'national'
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteClient(id);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.taxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingClient ? t('editClient') : t('newClient')}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingClient(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('name')}
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('taxId')}
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newClient.taxId}
                    onChange={(e) => setNewClient({ ...newClient, taxId: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    className="input"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('phone')}
                  </label>
                  <input
                    type="tel"
                    className="input"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('address')}
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('city')}
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newClient.city}
                    onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('country')}
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newClient.country}
                    onChange={(e) => setNewClient({ ...newClient, country: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    className="select"
                    value={newClient.type}
                    onChange={(e) => setNewClient({ ...newClient, type: e.target.value })}
                    required
                  >
                    <option value="national">National</option>
                    <option value="international">International</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium mb-4">Payment Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">USD Terms</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Terms (USD)
                      </label>
                      <select
                        className="select"
                        value={Object.keys(PAYMENT_TERMS).find(
                          key => PAYMENT_TERMS[key as keyof typeof PAYMENT_TERMS] === newClient.paymentTermsUSD
                        )}
                        onChange={(e) => setNewClient({
                          ...newClient,
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
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">CLP Terms</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Terms (CLP)
                      </label>
                      <select
                        className="select"
                        value={Object.keys(PAYMENT_TERMS).find(
                          key => PAYMENT_TERMS[key as keyof typeof PAYMENT_TERMS] === newClient.paymentTermsCLP
                        )}
                        onChange={(e) => setNewClient({
                          ...newClient,
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
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingClient(null);
                  }}
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingClient ? t('save') : t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('clients')}</h2>
            <p className="text-gray-500 mt-1">{t('manageClients')}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              {t('newClient')}
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
              placeholder={t('searchClients')}
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
                    {t('client')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('contact')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('location')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    USD Terms
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CLP Terms
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">{client.taxId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        client.type === 'international'
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-secondary-100 text-secondary-800'
                      }`}>
                        {client.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center mb-1">
                          <MailIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {client.email}
                        </div>
                        <div className="flex items-center">
                          <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center mb-1">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {client.address}
                        </div>
                        <div className="flex items-center">
                          <BuildingIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {client.city}, {client.country}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center mb-1">
                          <DollarSignIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {client.paymentTermsUSD.advance}% advance
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {client.paymentTermsUSD.daysToPayment} days
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center mb-1">
                          <DollarSignIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {client.paymentTermsCLP.advance}% advance
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {client.paymentTermsCLP.daysToPayment} days
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="text-error-600 hover:text-error-900"
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

export default Clients;