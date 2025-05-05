import React, { createContext, useContext, useState } from 'react';

interface VehicleConsumption {
  date: Date;
  kilometers: number;
  liters: number;
  cost: number;
  location: string;
}

interface Vehicle {
  id: string;
  licensePlate: string;
  type: 'tractor' | 'mining_trailer' | 'trailer' | 'semi_trailer';
  brand: string;
  model: string;
  year: number;
  status: 'active' | 'maintenance' | 'inactive' | 'in_operation';
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  currentOperation?: string;
  documents: {
    type: string;
    number: string;
    expiryDate: Date;
    status: 'valid' | 'expired' | 'expiring_soon';
  }[];
  financials: {
    acquisitionCost: number;
    maintenanceCosts: number;
    fuelCosts: number;
    insuranceCosts: number;
    otherCosts: number;
    revenue: number;
  };
  specifications: {
    capacity?: string;
    weight?: string;
    dimensions?: string;
    engineType?: string;
    fuelType?: string;
    fuelTankCapacity?: number;
    averageFuelEfficiency?: number;
  };
  operationHistory: {
    operationId: string;
    operationNumber: string;
    startDate: Date;
    endDate?: Date;
    route: string;
    revenue: number;
    costs: number;
    consumption?: {
      kilometers: number;
      liters: number;
      cost: number;
      averageConsumption: number;
    };
  }[];
  consumption: {
    averageConsumption: number;
    records: VehicleConsumption[];
    totalKilometers: number;
    totalLiters: number;
    totalCost: number;
  };
}

interface FleetContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'operationHistory'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  assignToOperation: (vehicleId: string, operationId: string, operationDetails: any) => void;
  completeOperation: (vehicleId: string, operationId: string, endDate: Date) => void;
  getAvailableVehicles: () => Vehicle[];
  getVehicleByOperation: (operationId: string) => Vehicle | undefined;
  addConsumptionRecord: (vehicleId: string, record: Omit<VehicleConsumption, 'date'>) => void;
  getConsumptionStats: (vehicleId: string) => {
    averageConsumption: number;
    totalCost: number;
    costPerKm: number;
    records: VehicleConsumption[];
  };
  getFleetConsumptionStats: () => {
    totalKilometers: number;
    totalLiters: number;
    totalCost: number;
    averageConsumption: number;
    vehicleStats: {
      vehicleId: string;
      licensePlate: string;
      averageConsumption: number;
      totalKilometers: number;
      costPerKm: number;
    }[];
  };
  calculateInitialConsumption: (specifications: Vehicle['specifications']) => {
    averageConsumption: number;
    totalKilometers: number;
    totalLiters: number;
    totalCost: number;
  };
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      licensePlate: 'ABC123',
      type: 'tractor',
      brand: 'Volvo',
      model: 'FH16',
      year: 2022,
      status: 'active',
      lastMaintenance: new Date('2024-01-15'),
      nextMaintenance: new Date('2024-04-15'),
      documents: [
        {
          type: 'Insurance',
          number: 'INS-2024-001',
          expiryDate: new Date('2024-12-31'),
          status: 'valid'
        },
        {
          type: 'Technical Review',
          number: 'TR-2024-123',
          expiryDate: new Date('2024-06-30'),
          status: 'valid'
        }
      ],
      financials: {
        acquisitionCost: 150000,
        maintenanceCosts: 5000,
        fuelCosts: 8000,
        insuranceCosts: 3000,
        otherCosts: 1000,
        revenue: 25000
      },
      specifications: {
        engineType: 'Diesel D16K',
        fuelType: 'Diesel',
        fuelTankCapacity: 600,
        averageFuelEfficiency: 35,
        weight: '8,500 kg',
        dimensions: '16.5m x 2.5m x 4m'
      },
      operationHistory: [],
      consumption: {
        averageConsumption: 35,
        records: [],
        totalKilometers: 0,
        totalLiters: 0,
        totalCost: 0
      }
    }
  ]);

  const calculateInitialConsumption = (specifications: Vehicle['specifications']) => {
    // Base consumption values based on fuel type
    const baseFuelEfficiency: Record<string, number> = {
      'Diesel': 35,
      'Biodiesel': 37,
      'CNG': 40,
      'LNG': 38
    };

    // Get base efficiency from specifications or fuel type
    const baseEfficiency = specifications.averageFuelEfficiency || 
      (specifications.fuelType ? baseFuelEfficiency[specifications.fuelType] : 35);

    // Adjust based on tank capacity (larger tanks often mean larger vehicles)
    const tankCapacityFactor = specifications.fuelTankCapacity 
      ? 1 + ((specifications.fuelTankCapacity - 400) / 2000)
      : 1;

    // Calculate initial average consumption
    const averageConsumption = baseEfficiency * tankCapacityFactor;

    return {
      averageConsumption,
      totalKilometers: 0,
      totalLiters: 0,
      totalCost: 0
    };
  };

  const addVehicle = (vehicle: Omit<Vehicle, 'id' | 'operationHistory'>) => {
    const initialConsumption = calculateInitialConsumption(vehicle.specifications);
    
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString(),
      operationHistory: [],
      consumption: {
        ...initialConsumption,
        records: []
      }
    };
    
    setVehicles([...vehicles, newVehicle]);
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(vehicles.map(vehicle => {
      if (vehicle.id === id) {
        // If specifications are being updated, recalculate consumption
        if (updates.specifications) {
          const newConsumption = calculateInitialConsumption(updates.specifications);
          return {
            ...vehicle,
            ...updates,
            consumption: {
              ...vehicle.consumption,
              averageConsumption: newConsumption.averageConsumption
            }
          };
        }
        return { ...vehicle, ...updates };
      }
      return vehicle;
    }));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
  };

  const assignToOperation = (vehicleId: string, operationId: string, operationDetails: any) => {
    setVehicles(vehicles.map(vehicle => {
      if (vehicle.id === vehicleId) {
        // Calculate estimated consumption for this operation
        const estimatedKilometers = 100; // This should be calculated based on route
        const estimatedConsumption = {
          kilometers: estimatedKilometers,
          liters: (estimatedKilometers * vehicle.consumption.averageConsumption) / 100,
          cost: 0, // This should be calculated based on current fuel prices
          averageConsumption: vehicle.consumption.averageConsumption
        };

        return {
          ...vehicle,
          status: 'in_operation',
          currentOperation: operationId,
          operationHistory: [
            ...vehicle.operationHistory,
            {
              operationId,
              operationNumber: operationDetails.operationNumber,
              startDate: new Date(),
              route: `${operationDetails.originCity} - ${operationDetails.destinationCity}`,
              revenue: operationDetails.saleValue,
              costs: operationDetails.carrierCost,
              consumption: estimatedConsumption
            }
          ]
        };
      }
      return vehicle;
    }));
  };

  const completeOperation = (vehicleId: string, operationId: string, endDate: Date) => {
    setVehicles(vehicles.map(vehicle => {
      if (vehicle.id === vehicleId) {
        // Update operation history with actual consumption data
        const updatedHistory = vehicle.operationHistory.map(op => {
          if (op.operationId === operationId && op.consumption) {
            // Calculate actual consumption based on specifications and distance
            const actualConsumption = {
              ...op.consumption,
              cost: op.consumption.liters * 1.5 // Assuming fuel price of $1.5 per liter
            };

            return {
              ...op,
              endDate,
              consumption: actualConsumption
            };
          }
          return op;
        });

        // Update vehicle's overall consumption stats
        const totalConsumption = updatedHistory.reduce((acc, op) => {
          if (op.consumption) {
            acc.kilometers += op.consumption.kilometers;
            acc.liters += op.consumption.liters;
            acc.cost += op.consumption.cost;
          }
          return acc;
        }, { kilometers: 0, liters: 0, cost: 0 });

        return {
          ...vehicle,
          status: 'active',
          currentOperation: undefined,
          operationHistory: updatedHistory,
          consumption: {
            ...vehicle.consumption,
            totalKilometers: totalConsumption.kilometers,
            totalLiters: totalConsumption.liters,
            totalCost: totalConsumption.cost,
            averageConsumption: totalConsumption.kilometers > 0 
              ? (totalConsumption.liters / totalConsumption.kilometers) * 100 
              : vehicle.consumption.averageConsumption
          }
        };
      }
      return vehicle;
    }));
  };

  const getAvailableVehicles = () => {
    return vehicles.filter(vehicle => 
      vehicle.status === 'active' && 
      !vehicle.currentOperation &&
      vehicle.documents.every(doc => doc.status !== 'expired')
    );
  };

  const getVehicleByOperation = (operationId: string) => {
    return vehicles.find(vehicle => vehicle.currentOperation === operationId);
  };

  const addConsumptionRecord = (vehicleId: string, record: Omit<VehicleConsumption, 'date'>) => {
    setVehicles(vehicles.map(vehicle => {
      if (vehicle.id === vehicleId) {
        const newRecord = {
          ...record,
          date: new Date()
        };
        
        const newRecords = [...vehicle.consumption.records, newRecord];
        const totalKilometers = newRecords.reduce((sum, r) => sum + r.kilometers, 0);
        const totalLiters = newRecords.reduce((sum, r) => sum + r.liters, 0);
        const totalCost = newRecords.reduce((sum, r) => sum + r.cost, 0);
        
        // Calculate new average consumption based on specifications and actual data
        const baseConsumption = vehicle.specifications.averageFuelEfficiency || 35;
        const actualConsumption = (totalLiters / totalKilometers) * 100;
        const averageConsumption = (baseConsumption + actualConsumption) / 2;

        return {
          ...vehicle,
          consumption: {
            records: newRecords,
            totalKilometers,
            totalLiters,
            totalCost,
            averageConsumption
          }
        };
      }
      return vehicle;
    }));
  };

  const getConsumptionStats = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      return {
        averageConsumption: 0,
        totalCost: 0,
        costPerKm: 0,
        records: []
      };
    }

    const { consumption } = vehicle;
    const costPerKm = consumption.totalKilometers > 0 
      ? consumption.totalCost / consumption.totalKilometers 
      : 0;

    return {
      averageConsumption: consumption.averageConsumption,
      totalCost: consumption.totalCost,
      costPerKm,
      records: consumption.records
    };
  };

  const getFleetConsumptionStats = () => {
    const stats = vehicles.reduce((acc, vehicle) => {
      acc.totalKilometers += vehicle.consumption.totalKilometers;
      acc.totalLiters += vehicle.consumption.totalLiters;
      acc.totalCost += vehicle.consumption.totalCost;

      acc.vehicleStats.push({
        vehicleId: vehicle.id,
        licensePlate: vehicle.licensePlate,
        averageConsumption: vehicle.consumption.averageConsumption,
        totalKilometers: vehicle.consumption.totalKilometers,
        costPerKm: vehicle.consumption.totalKilometers > 0 
          ? vehicle.consumption.totalCost / vehicle.consumption.totalKilometers 
          : 0
      });

      return acc;
    }, {
      totalKilometers: 0,
      totalLiters: 0,
      totalCost: 0,
      averageConsumption: 0,
      vehicleStats: [] as {
        vehicleId: string;
        licensePlate: string;
        averageConsumption: number;
        totalKilometers: number;
        costPerKm: number;
      }[]
    });

    stats.averageConsumption = stats.totalKilometers > 0 
      ? (stats.totalLiters / stats.totalKilometers) * 100 
      : 0;

    return stats;
  };

  return (
    <FleetContext.Provider value={{
      vehicles,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      assignToOperation,
      completeOperation,
      getAvailableVehicles,
      getVehicleByOperation,
      addConsumptionRecord,
      getConsumptionStats,
      getFleetConsumptionStats,
      calculateInitialConsumption
    }}>
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (context === undefined) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};