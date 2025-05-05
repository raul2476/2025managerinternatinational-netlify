import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useOperations } from '../contexts/OperationsContext';
import { useServiceProviders } from '../contexts/ServiceProvidersContext';
import { 
  DownloadIcon, 
  DollarSignIcon,
  CalendarIcon,
  TruckIcon,
  UserIcon,
  ArrowRightIcon,
  MapPinIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClockIcon,
  FileTextIcon,
  FilterIcon,
  TrendingUpIcon,
  ArrowUpDownIcon
} from 'lucide-react';
import Chart from '../components/Chart';
import { exportToExcel } from '../utils/excel';

const Reports: React.FC = () => {
  const { t } = useLanguage();
  const { operations } = useOperations();
  const { providers } = useServiceProviders();
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'CLP'>('USD');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [sortField, setSortField] = useState<'operationNumber' | 'startDate' | 'profit'>('operationNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Exchange rate (in a real app, this would come from your exchange rate service)
  const exchangeRate = 850.25;

  // Calculate date range for filtering
  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return { start, end: now };
  };

  // Filter operations by date range
  const filteredOperations = useMemo(() => {
    const { start, end } = getDateRange();
    return operations.filter(op => {
      const opDate = new Date(op.createdAt);
      return opDate >= start && opDate <= end;
    });
  }, [operations, dateRange]);

  // Calculate financial metrics
  const metrics = useMemo(() => {
    const data = {
      usd: {
        revenue: 0,
        costs: 0,
        profit: 0,
        margin: 0
      },
      clp: {
        revenue: 0,
        costs: 0,
        profit: 0,
        margin: 0
      }
    };

    filteredOperations.forEach(op => {
      const currency = op.type === 'national' ? 'clp' : 'usd';
      data[currency].revenue += op.saleValue;
      data[currency].costs += op.carrierCost;
      
      // Add extra costs
      const extraCosts = 
        op.costs.extraCosts.fuel +
        op.costs.extraCosts.tolls +
        op.costs.extraCosts.permits +
        op.costs.extraCosts.other;
      
      data[currency].costs += extraCosts;
    });

    // Calculate profits and margins
    data.usd.profit = data.usd.revenue - data.usd.costs;
    data.clp.profit = data.clp.revenue - data.clp.costs;
    
    data.usd.margin = data.usd.revenue ? (data.usd.profit / data.usd.revenue) * 100 : 0;
    data.clp.margin = data.clp.revenue ? (data.clp.profit / data.clp.revenue) * 100 : 0;

    return data;
  }, [filteredOperations]);

  // Calculate provider payments
  const providerPayments = useMemo(() => {
    return providers.map(provider => {
      // Get all operations for this provider
      const providerOperations = filteredOperations.filter(op => 
        op.serviceProvider === provider.name
      );

      // Initialize payment totals
      const payments = {
        usd: {
          pending: [] as any[],
          total: 0
        },
        clp: {
          pending: [] as any[],
          total: 0
        }
      };

      // Process each operation
      providerOperations.forEach(operation => {
        const currency = operation.type === 'national' ? 'clp' : 'usd';
        
        // Process payment schedule
        operation.costs.paymentSchedule.forEach(payment => {
          payments[currency].total += payment.amount;
          
          if (payment.status === 'pending' || selectedStatus === 'all') {
            payments[currency].pending.push({
              operation,
              ...payment,
              dueDate: new Date(payment.dueDate)
            });
          }
        });
      });

      return {
        provider,
        payments
      };
    });
  }, [providers, filteredOperations, selectedStatus]);

  // Calculate cost analysis data
  const costAnalysisData = useMemo(() => {
    return filteredOperations.map(op => {
      const totalExtraCosts = 
        op.costs.extraCosts.fuel +
        op.costs.extraCosts.tolls +
        op.costs.extraCosts.permits +
        op.costs.extraCosts.other;

      const totalCosts = op.carrierCost + totalExtraCosts;
      const profit = op.saleValue - totalCosts;
      const profitMargin = (profit / op.saleValue) * 100;

      return {
        operationNumber: op.operationNumber,
        serviceProvider: op.serviceProvider || 'Not assigned',
        startDate: op.startedAt ? new Date(op.startedAt) : null,
        carrierCost: op.carrierCost,
        extraCosts: totalExtraCosts,
        totalCosts,
        saleValue: op.saleValue,
        profit,
        profitMargin,
        currency: op.type === 'national' ? 'CLP' : 'USD',
        status: op.status,
        route: `${op.originCity} - ${op.destinationCity}`
      };
    }).sort((a, b) => {
      if (sortField === 'startDate') {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return sortDirection === 'asc' 
          ? a.startDate.getTime() - b.startDate.getTime()
          : b.startDate.getTime() - a.startDate.getTime();
      }
      if (sortField === 'profit') {
        return sortDirection === 'asc'
          ? a.profit - b.profit
          : b.profit - a.profit;
      }
      return sortDirection === 'asc'
        ? a[sortField].localeCompare(b[sortField])
        : b[sortField].localeCompare(a[sortField]);
    });
  }, [filteredOperations, sortField, sortDirection]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Calculate extra costs data for chart
  const extraCostsData = useMemo(() => {
    const data = {
      fuel: 0,
      tolls: 0,
      permits: 0,
      other: 0
    };

    filteredOperations.forEach(op => {
      data.fuel += op.costs.extraCosts.fuel;
      data.tolls += op.costs.extraCosts.tolls;
      data.permits += op.costs.extraCosts.permits;
      data.other += op.costs.extraCosts.other;
    });

    return [
      { name: 'Fuel', value: data.fuel },
      { name: 'Tolls', value: data.tolls },
      { name: 'Permits', value: data.permits },
      { name: 'Other', value: data.other }
    ];
  }, [filteredOperations]);

  // Calculate provider payments data for chart
  const providerPaymentsData = useMemo(() => {
    const data = providers.map(provider => {
      const providerOperations = filteredOperations.filter(op => 
        op.serviceProvider === provider.name
      );

      const totalPayments = providerOperations.reduce((sum, op) => 
        sum + op.carrierCost + 
        op.costs.extraCosts.fuel +
        op.costs.extraCosts.tolls +
        op.costs.extraCosts.permits +
        op.costs.extraCosts.other,
        0
      );

      return {
        name: provider.name,
        value: totalPayments
      };
    });

    return data.sort((a, b) => b.value - a.value);
  }, [filteredOperations, providers]);

  // Prepare data for sales trend chart
  const salesTrendData = useMemo(() => {
    const data: { date: string; usd: number; clp: number }[] = [];
    const { start, end } = getDateRange();
    
    let current = new Date(start);
    while (current <= end) {
      const dayOperations = filteredOperations.filter(op => {
        const opDate = new Date(op.createdAt);
        return opDate.toDateString() === current.toDateString();
      });

      data.push({
        date: current.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
        usd: dayOperations
          .filter(op => op.type === 'international')
          .reduce((sum, op) => sum + op.saleValue, 0),
        clp: dayOperations
          .filter(op => op.type === 'national')
          .reduce((sum, op) => sum + op.saleValue, 0)
      });

      current.setDate(current.getDate() + 1);
    }

    return data;
  }, [filteredOperations]);

  // Prepare data for payment status chart
  const paymentStatusData = useMemo(() => {
    const data = {
      usd: { paid: 0, pending: 0 },
      clp: { paid: 0, pending: 0 }
    };

    filteredOperations.forEach(op => {
      const currency = op.type === 'national' ? 'clp' : 'usd';
      op.costs.paymentSchedule.forEach(payment => {
        if (payment.status === 'paid') {
          data[currency].paid += payment.amount;
        } else {
          data[currency].pending += payment.amount;
        }
      });
    });

    return [
      { name: 'Paid', usd: data.usd.paid, clp: data.clp.paid },
      { name: 'Pending', usd: data.usd.pending, clp: data.clp.pending }
    ];
  }, [filteredOperations]);

  const formatCurrency = (value: number, currency: 'USD' | 'CLP') => {
    if (currency === 'CLP') {
      return value.toLocaleString('es-CL');
    }
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleExportToExcel = () => {
    const data = providerPayments.flatMap(({ provider, payments }) => {
      const currencyData = selectedCurrency === 'USD' ? payments.usd : payments.clp;
      return currencyData.pending.map(payment => ({
        'Operation Number': payment.operation.operationNumber,
        'Provider Name': provider.name,
        'Tax ID': provider.taxId,
        'Payment Description': payment.description,
        'Amount': `${selectedCurrency} ${formatCurrency(payment.amount, selectedCurrency)}`,
        'Due Date': payment.dueDate.toLocaleDateString(),
        'Status': payment.status,
        'Operation Type': payment.operation.type,
        'Route': `${payment.operation.originCity} - ${payment.operation.destinationCity}`
      }));
    });
    
    exportToExcel(data, 'financial-report');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Financial Analysis</h2>
            <p className="text-gray-500 mt-1">Track financial performance and metrics</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <select
              className="select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'month' | 'quarter' | 'year')}
            >
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <button 
              onClick={handleExportToExcel}
              className="btn btn-primary flex items-center"
            >
              <DownloadIcon className="h-5 w-5 mr-2" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">USD Revenue</p>
                <p className="text-xl font-bold">${metrics.usd.revenue.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-primary-100 p-3">
                <DollarSignIcon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <p className="text-sm text-success-600 mt-2">
              Margin: {metrics.usd.margin.toFixed(1)}%
            </p>
          </div>

          <div className="card">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">CLP Revenue</p>
                <p className="text-xl font-bold">CLP {metrics.clp.revenue.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-secondary-100 p-3">
                <DollarSignIcon className="h-6 w-6 text-secondary-600" />
              </div>
            </div>
            <p className="text-sm text-success-600 mt-2">
              Margin: {metrics.clp.margin.toFixed(1)}%
            </p>
          </div>

          <div className="card">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">USD Profit</p>
                <p className="text-xl font-bold">${metrics.usd.profit.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-success-100 p-3">
                <TrendingUpIcon className="h-6 w-6 text-success-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Costs: ${metrics.usd.costs.toLocaleString()}
            </p>
          </div>

          <div className="card">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">CLP Profit</p>
                <p className="text-xl font-bold">CLP {metrics.clp.profit.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-success-100 p-3">
                <TrendingUpIcon className="h-6 w-6 text-success-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Costs: CLP {metrics.clp.costs.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend Chart */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h3>
            <Chart 
              type="line"
              data={salesTrendData}
              dataKey={selectedCurrency === 'USD' ? 'usd' : 'clp'}
              nameKey="date"
              height={300}
              valuePrefix={selectedCurrency === 'USD' ? '$' : 'CLP '}
            />
          </div>

          {/* Extra Costs Distribution Chart */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Extra Costs Distribution</h3>
            <Chart 
              type="pie"
              data={extraCostsData}
              dataKey="value"
              nameKey="name"
              height={300}
              valuePrefix={selectedCurrency === 'USD' ? '$' : 'CLP '}
              colors={['#1E3A8A', '#0D9488', '#F59E0B', '#059669']}
            />
          </div>

          {/* Provider Payments Chart */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Provider Payments</h3>
            <Chart 
              type="bar"
              data={providerPaymentsData}
              dataKey="value"
              nameKey="name"
              height={300}
              valuePrefix={selectedCurrency === 'USD' ? '$' : 'CLP '}
              colors={['#1E3A8A']}
            />
          </div>

          {/* Payment Status Chart */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status</h3>
            <Chart 
              type="pie"
              data={paymentStatusData}
              dataKey={selectedCurrency === 'USD' ? 'usd' : 'clp'}
              nameKey="name"
              height={300}
              valuePrefix={selectedCurrency === 'USD' ? '$' : 'CLP '}
              colors={['#059669', '#F59E0B']}
            />
          </div>
        </div>

        {/* Provider Payments Table */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Provider Payments</h3>
            <div className="flex space-x-2">
              <select
                className="select"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as 'USD' | 'CLP')}
              >
                <option value="USD">USD</option>
                <option value="CLP">CLP</option>
              </select>
              <select
                className="select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'pending' | 'completed')}
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operation Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Terms
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {providerPayments.map(({ provider, payments }) => {
                  const currencyData = selectedCurrency === 'USD' ? payments.usd : payments.clp;
                  return currencyData.pending
                    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                    .map((payment, index) => (
                    <tr key={`${provider.id}-${payment.operation.id}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.operation.operationNumber}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <FileTextIcon className="h-4 w-4 mr-1" />
                              CRT: {
                                payment.operation.documentType === 'crt' 
                                  ? payment.operation.documents.find(d => d.type === 'CRT')?.name || 'Pending'
                                  : 'N/A'
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                            <div className="text-sm text-gray-500">{provider.taxId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {payment.operation.originCity}
                            <ArrowRightIcon className="inline-block h-3 w-3 mx-1" />
                            {payment.operation.destinationCity}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <DollarSignIcon className="h-4 w-4 text-gray-400 mr-2" />
                            {payment.advance}% advance
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {payment.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                            Start: {payment.operation.startedAt?.toLocaleDateString() || 'Not started'}
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                            Due: {payment.dueDate.toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSignIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {selectedCurrency} {formatCurrency(payment.amount, selectedCurrency)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          payment.status === 'paid'
                            ? 'bg-success-100 text-success-800'
                            : 'bg-warning-100 text-warning-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ));
                })}
                {providerPayments.every(({ payments }) => 
                  (selectedCurrency === 'USD' ? payments.usd : payments.clp).pending.length === 0
                ) && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No {selectedStatus === 'all' ? '' : selectedStatus} payments found for {selectedCurrency}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Total {selectedStatus === 'all' ? '' : selectedStatus} Amount
                  </td>
                  <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {selectedCurrency} {formatCurrency(
                      providerPayments.reduce((total, { payments }) => 
                        total + (selectedCurrency === 'USD' ? payments.usd.total : payments.clp.total), 
                        0
                      ),
                      selectedCurrency
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Cost Analysis Table */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Transport Cost Analysis</h3>
            <button 
              onClick={() => exportToExcel(costAnalysisData, 'cost-analysis')}
              className="btn btn-primary flex items-center"
            >
              <DownloadIcon className="h-5 w-5 mr-2" />
              Export Analysis
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('operationNumber')}
                  >
                    <div className="flex items-center">
                      Operation
                      <ArrowUpDownIcon className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Provider
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('startDate')}
                  >
                    <div className="flex items-center">
                      Start Date
                      <ArrowUpDownIcon className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carrier Cost
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extra Costs
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Costs
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sale Value
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('profit')}
                  >
                    <div className="flex items-center justify-end">
                      Profit
                      <ArrowUpDownIcon className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {costAnalysisData.map((op) => (
                  <tr key={op.operationNumber} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium">{op.operationNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                        {op.serviceProvider}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                        {op.startDate ? op.startDate.toLocaleDateString() : 'Not started'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                        {op.route}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {op.currency} {op.carrierCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {op.currency} {op.extraCosts.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      {op.currency} {op.totalCosts.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {op.currency} {op.saleValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={op.profit >= 0 ? 'text-success-600' : 'text-error-600'}>
                        {op.currency} {op.profit.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        op.profitMargin >= 20 ? 'bg-success-100 text-success-800' :
                        op.profitMargin >= 10 ? 'bg-warning-100 text-warning-800' :
                        'bg-error-100 text-error-800'
                      }`}>
                        {op.profitMargin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-6 py-4 whitespace-nowrap font-medium">
                    Totals
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    USD {costAnalysisData
                      .filter(op => op.currency === 'USD')
                      .reduce((sum, op) => sum + op.carrierCost, 0)
                      .toLocaleString()}
                    <br />
                    CLP {costAnalysisData
                      .filter(op => op.currency === 'CLP')
                      .reduce((sum, op) => sum + op.carrierCost, 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    USD {costAnalysisData
                      .filter(op => op.currency === 'USD')
                      .reduce((sum, op) => sum + op.extraCosts, 0)
                      .toLocaleString()}
                    <br />
                    CLP {costAnalysisData
                      .filter(op => op.currency === 'CLP')
                      .reduce((sum, op) => sum + op.extraCosts, 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    USD {costAnalysisData
                      .filter(op => op.currency === 'USD')
                      .reduce((sum, op) => sum + op.totalCosts, 0)
                      .toLocaleString()}
                    <br />
                    CLP {costAnalysisData
                      .filter(op => op.currency === 'CLP')
                      .reduce((sum, op) => sum + op.totalCosts, 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    USD {costAnalysisData
                      .filter(op => op.currency === 'USD')
                      .reduce((sum, op) => sum + op.saleValue, 0)
                      .toLocaleString()}
                    <br />
                    CLP {costAnalysisData
                      .filter(op => op.currency === 'CLP')
                      .reduce((sum, op) => sum + op.saleValue, 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    USD {costAnalysisData
                      .filter(op => op.currency === 'USD')
                      .reduce((sum, op) => sum + op.profit, 0)
                      .toLocaleString()}
                    <br />
                    CLP {costAnalysisData
                      .filter(op => op.currency === 'CLP')
                      .reduce((sum, op) => sum + op.profit, 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    {(costAnalysisData.reduce((sum, op) => sum + op.profit, 0) / 
                      costAnalysisData.reduce((sum, op) => sum + op.saleValue, 0) * 100).toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;