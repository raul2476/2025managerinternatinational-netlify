import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const formatOperationsForExcel = (operations: any[]) => {
  return operations.map(op => ({
    'Operation Number': op.operationNumber,
    'Type': op.type,
    'Client': op.clientName,
    'Origin': op.originCity,
    'Destination': op.destinationCity,
    'Service Provider': op.serviceProvider || 'Not assigned',
    'Carrier Cost': `${op.type === 'national' ? 'CLP' : 'USD'} ${op.carrierCost.toLocaleString()}`,
    'Sale Value': `${op.type === 'national' ? 'CLP' : 'USD'} ${op.saleValue.toLocaleString()}`,
    'Status': op.status,
    'Created At': new Date(op.createdAt).toLocaleDateString(),
    'Started At': op.startedAt ? new Date(op.startedAt).toLocaleDateString() : 'Not started',
    'Completed At': op.completedAt ? new Date(op.completedAt).toLocaleDateString() : 'Not completed',
    'Extra Costs': {
      'Fuel': op.costs?.extraCosts?.fuel || 0,
      'Tolls': op.costs?.extraCosts?.tolls || 0,
      'Permits': op.costs?.extraCosts?.permits || 0,
      'Other': op.costs?.extraCosts?.other || 0,
      'Description': op.costs?.extraCosts?.description || ''
    },
    'Payment Status': op.costs.paymentSchedule.map((payment: any) => ({
      'Description': payment.description,
      'Amount': payment.amount,
      'Due Date': new Date(payment.dueDate).toLocaleDateString(),
      'Status': payment.status
    }))
  }));
};

export const formatDocumentsForExcel = (documents: any[]) => {
  return documents.map(doc => ({
    'Document ID': doc.name,
    'Type': doc.type,
    'Operation': doc.operation.number,
    'Route': doc.operation.route,
    'Date': doc.date,
    'Status': doc.status,
    'Client': doc.operation.clientName,
    'Service Provider': doc.operation.serviceProvider
  }));
};

export const formatPaymentsForExcel = (payments: any[]) => {
  return payments.map(payment => ({
    'Operation Number': payment.operation.number,
    'Type': payment.type === 'carrier' ? 'Carrier Payment' : 'Client Payment',
    'Description': payment.description,
    'Amount': payment.amount,
    'Currency': payment.currency,
    'Due Date': new Date(payment.dueDate).toLocaleDateString(),
    'Status': payment.status,
    'Provider/Client': payment.type === 'carrier' ? payment.operation.provider : payment.operation.client,
    'Operation Type': payment.operation.type
  }));
};