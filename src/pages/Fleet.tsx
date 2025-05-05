import React, { useState } from 'react';
import { useFleet } from '../contexts/FleetContext';
import { 
  TruckIcon, 
  PlusIcon, 
  XIcon, 
  GaugeIcon,
  DollarSignIcon,
  CalendarIcon,
  FileTextIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClockIcon
} from 'lucide-react';
import Chart from '../components/Chart';

const Fleet: React.FC = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, getFleetConsumptionStats } = useFleet();
  const [showNewVehicleForm, setShowNewVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    licensePlate: '',
    type: 'tractor' as const,
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    status: 'active' as const,
    documents: [],
    financials: {
      acquisitionCost: 0,
      maintenanceCosts: 0,
      fuelCosts: 0,
      insuranceCosts: 0,
      otherCosts: 0,
      revenue: 0
    },
    specifications: {
      engineType: '',
      fuelType: '',
      fuelTankCapacity: 0,
      averageFuelEfficiency: 0,
      weight: '',
      dimensions: ''
    },
    consumption: {
      averageConsumption: 0,
      records: [],
      totalKilometers: 0,
      totalLiters: 0,
      totalCost: 0
    }
  });

  const fleetStats = getFleetConsumptionStats();

  // Prepare data for consumption chart
  const consumptionData = fleetStats.vehicleStats.map(stat => ({
    name: stat.licensePlate,
    value: stat.averageConsumption
  }));

  // Prepare data for cost per km chart
  const costPerKmData = fleetStats.vehicleStats.map(stat => ({
    name: stat.licensePlate,
    value: stat.costPerKm
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      updateVehicle(editingVehicle, newVehicle);
      setEditingVehicle(null);
    } else {
      addVehicle(newVehicle);
    }
    setShowNewVehicleForm(false);
    setNewVehicle({
      licensePlate: '',
      type: 'tractor',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      status: 'active',
      documents: [],
      financials: {
        acquisitionCost: 0,
        maintenanceCosts: 0,
        fuelCosts: 0,
        insuranceCosts: 0,
        otherCosts: 0,
        revenue: 0
      },
      specifications: {
        engineType: '',
        fuelType: '',
        fuelTankCapacity: 0,
        averageFuelEfficiency: 0,
        weight: '',
        dimensions: ''
      },
      consumption: {
        averageConsumption: 0,
        records: [],
        totalKilometers: 0,
        totalLiters: 0,
        totalCost: 0
      }
    });
  };

  const handleEdit = (vehicle: any) => {
    setEditingVehicle(vehicle.id);
    setNewVehicle(vehicle);
    setShowNewVehicleForm(true);
  };

  const handleDelete = (id: string) => {
    setVehicleToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (vehicleToDelete) {
      deleteVehicle(vehicleToDelete);
      setShowDeleteConfirm(false);
      setVehicleToDelete(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800';
      case 'maintenance':
        return 'bg-warning-100 text-warning-800';
      case 'in_operation':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-error-100 text-error-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'maintenance':
        return <AlertCircleIcon className="h-4 w-4" />;
      case 'in_operation':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <XIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fleet Management</h2>
          <p className="text-gray-500 mt-1">Manage your vehicle fleet and monitor consumption</p>
        </div>
        <button
          onClick={() => setShowNewVehicleForm(true)}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Vehicle
        </button>
      </div>

      {/* Fleet Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Distance</p>
              <p className="text-2xl font-bold">{fleetStats.totalKilometers.toLocaleString()} km</p>
            </div>
            <div className="rounded-full bg-primary-100 p-3">
              <MapPinIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Fuel</p>
              <p className="text-2xl font-bold">{fleetStats.totalLiters.toLocaleString()} L</p>
            </div>
            <div className="rounded-full bg-secondary-100 p-3">
              <GaugeIcon className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Cost</p>
              <p className="text-2xl font-bold">${fleetStats.totalCost.toLocaleString()}</p>
            </div>
            <div className="rounded-full bg-accent-100 p-3">
              <DollarSignIcon className="h-6 w-6 text-accent-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Consumption</p>
              <p className="text-2xl font-bold">{fleetStats.averageConsumption.toFixed(2)} L/100km</p>
            </div>
            <div className="rounded-full bg-success-100 p-3">
              <TruckIcon className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Consumption Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fuel Consumption by Vehicle</h3>
          <Chart 
            type="bar"
            data={consumptionData}
            dataKey="value"
            nameKey="name"
            height={300}
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cost per Kilometer</h3>
          <Chart 
            type="bar"
            data={costPerKmData}
            dataKey="value"
            nameKey="name"
            height={300}
            valuePrefix="$"
          />
        </div>
      </div>

      {/* Vehicle Table */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Fleet</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specifications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consumption
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <TruckIcon className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {vehicle.licensePlate}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="mb-1">
                        <span className="font-medium">Engine:</span> {vehicle.specifications.engineType}
                      </div>
                      <div className="mb-1">
                        <span className="font-medium">Fuel:</span> {vehicle.specifications.fuelType}
                      </div>
                      <div>
                        <span className="font-medium">Tank:</span> {vehicle.specifications.fuelTankCapacity}L
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="mb-1">
                        <span className="font-medium">Avg. Consumption:</span> {vehicle.consumption.averageConsumption.toFixed(2)} L/100km
                      </div>
                      <div className="mb-1">
                        <span className="font-medium">Total Distance:</span> {vehicle.consumption.totalKilometers.toLocaleString()} km
                      </div>
                      <div>
                        <span className="font-medium">Total Fuel:</span> {vehicle.consumption.totalLiters.toLocaleString()} L
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full flex items-center w-fit ${getStatusBadgeClass(vehicle.status)}`}>
                      {getStatusIcon(vehicle.status)}
                      <span className="ml-1">{vehicle.status}</span>
                    </span>
                    {vehicle.currentOperation && (
                      <div className="mt-2 text-xs text-gray-500">
                        Operation: {vehicle.currentOperation}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit vehicle"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-error-600 hover:text-error-900"
                        title="Delete vehicle"
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

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Vehicle</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setVehicleToDelete(null);
                }}
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn bg-error-600 text-white hover:bg-error-700"
              >
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewVehicleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
              <button
                onClick={() => {
                  setShowNewVehicleForm(false);
                  setEditingVehicle(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Plate
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={newVehicle.licensePlate}
                      onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      className="select"
                      value={newVehicle.type}
                      onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value as any })}
                      required
                    >
                      <option value="tractor">Tractor</option>
                      <option value="trailer">Trailer</option>
                      <option value="semi_trailer">Semi-Trailer</option>
                      <option value="mining_trailer">Mining Trailer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={newVehicle.brand}
                      onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={newVehicle.year}
                      onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                      min="1900"
                      max={new Date().getFullYear()}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="select"
                      value={newVehicle.status}
                      onChange={(e) => setNewVehicle({ ...newVehicle, status: e.target.value as any })}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium mb-4">Vehicle Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Engine Type
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={newVehicle.specifications.engineType}
                      onChange={(e) => setNewVehicle({
                        ...newVehicle,
                        specifications: {
                          ...newVehicle.specifications,
                          engineType: e.target.value
                        }
                      })}
                      placeholder="e.g., Diesel D13C"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fuel Type
                    </label>
                    <select
                      className="select"
                      value={newVehicle.specifications.fuelType}
                      onChange={(e) => setNewVehicle({
                        ...newVehicle,
                        specifications: {
                          ...newVehicle.specifications,
                          fuelType: e.target.value
                        }
                      })}
                    >
                      <option value="">Select fuel type</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Biodiesel">Biodiesel</option>
                      <option value="CNG">CNG</option>
                      <option value="LNG">LNG</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fuel Tank Capacity (L)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={newVehicle.specifications.fuelTankCapacity || ''}
                      onChange={(e) => setNewVehicle({
                        ...newVehicle,
                        specifications: {
                          ...newVehicle.specifications,
                          fuelTankCapacity: parseFloat(e.target.value)
                        }
                      })}
                      min="0"
                      step="1"
                      placeholder="e.g., 400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Average Fuel Efficiency (L/100km)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={newVehicle.specifications.averageFuelEfficiency || ''}
                      onChange={(e) => setNewVehicle({
                        ...newVehicle,
                        specifications: {
                          ...newVehicle.specifications,
                          averageFuelEfficiency: parseFloat(e.target.value)
                        }
                      })}
                      min="0"
                      step="0.1"
                      placeholder="e.g., 30.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={newVehicle.specifications.weight}
                      onChange={(e) => setNewVehicle({
                        ...newVehicle,
                        specifications: {
                          ...newVehicle.specifications,
                          weight: e.target.value
                        }
                      })}
                      placeholder="e.g., 8,500 kg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={newVehicle.specifications.dimensions}
                      onChange={(e) => setNewVehicle({
                        ...newVehicle,
                        specifications: {
                          ...newVehicle.specifications,
                          dimensions: e.target.value
                        }
                      })}
                      placeholder="e.g., 16.5m x 2.5m x 4m"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewVehicleForm(false);
                    setEditingVehicle(null);
                  }}
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fleet;