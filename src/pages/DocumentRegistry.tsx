import React, { useState } from 'react';
import { useOperations } from '../contexts/OperationsContext';
import { useLanguage } from '../contexts/LanguageContext';
import jsPDF from 'jspdf';
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  FileTextIcon, 
  FileIcon, 
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  UploadIcon,
  EyeIcon,
  PencilIcon,
  DownloadIcon,
  MapPinIcon,
  ArrowRightIcon,
  CheckIcon,
  XIcon,
  DollarSignIcon,
  CalendarIcon
} from 'lucide-react';
import { exportToExcel, formatDocumentsForExcel } from '../utils/excel';

const DocumentRegistry: React.FC = () => {
  const { operations, uploadDocument, updateDocumentStatus, updateOperation } = useOperations();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);

  const allDocuments = operations.flatMap(op => 
    (op.documents || []).map(doc => ({
      ...doc,
      operation: {
        id: op.id,
        number: op.operationNumber,
        originCity: op.originCity,
        destinationCity: op.destinationCity,
        route: `${op.originCity} - ${op.destinationCity}`,
        type: op.type,
        carrierCost: op.carrierCost,
        saleValue: op.saleValue,
        clientName: op.clientName,
        serviceProvider: op.serviceProvider
      }
    }))
  );

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = 
      (doc.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (doc.type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (doc.operation?.number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (doc.operation?.originCity?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (doc.operation?.destinationCity?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      doc.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOperation || !documentType || !documentDate) return;

    const newDocument = {
      id: Date.now(),
      name: `${documentType}-${documentDate.replace(/-/g, '')}-${allDocuments.length + 1}`,
      type: documentType,
      date: documentDate,
      status: 'pending' as const,
      description: documentDescription,
      fileName: uploadedFile?.name || ''
    };

    uploadDocument(selectedOperation, newDocument);
    setUploadSuccess(true);

    setTimeout(() => {
      setShowForm(false);
      setSelectedOperation('');
      setDocumentType('');
      setDocumentDate('');
      setDocumentDescription('');
      setUploadedFile(null);
      setUploadSuccess(false);
    }, 2000);
  };

  const handleApproveDocument = (operationId: string, documentId: number) => {
    updateDocumentStatus(operationId, documentId, 'approved');
  };

  const handleRejectDocument = (operationId: string, documentId: number) => {
    updateDocumentStatus(operationId, documentId, 'pending');
  };

  const handleDownloadDocument = (doc: any) => {
    const pdf = new jsPDF();
    
    pdf.setFontSize(20);
    pdf.text('Transport Document', 20, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Document ID: ${doc.name}`, 20, 40);
    pdf.text(`Type: ${doc.type}`, 20, 50);
    pdf.text(`Date: ${doc.date}`, 20, 60);
    pdf.text(`Status: ${doc.status}`, 20, 70);
    
    pdf.text('Operation Details:', 20, 90);
    pdf.text(`Operation Number: ${doc.operation.number}`, 30, 100);
    pdf.text(`Route: ${doc.operation.route}`, 30, 110);
    pdf.text(`Type: ${doc.operation.type}`, 30, 120);
    pdf.text(`Client: ${doc.operation.clientName}`, 30, 130);
    pdf.text(`Service Provider: ${doc.operation.serviceProvider}`, 30, 140);
    
    pdf.text('Financial Information:', 20, 160);
    pdf.text(`Carrier Cost: $${doc.operation.carrierCost.toLocaleString()}`, 30, 170);
    pdf.text(`Sale Value: $${doc.operation.saleValue.toLocaleString()}`, 30, 180);
    
    const today = new Date().toLocaleDateString();
    pdf.setFontSize(10);
    pdf.text(`Generated on ${today}`, 20, 280);
    
    pdf.save(`${doc.name}.pdf`);
  };

  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc);
    setShowPreview(true);
  };

  const handleEditDocument = (doc: any) => {
    setEditingDocument(doc);
    setShowEditForm(true);
  };

  const handleUpdateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDocument) return;

    const operation = operations.find(op => op.id === editingDocument.operation.id);
    if (!operation) return;

    const updatedDocuments = operation.documents.map(doc =>
      doc.id === editingDocument.id
        ? {
            ...doc,
            type: editingDocument.type,
            date: editingDocument.date,
            description: editingDocument.description
          }
        : doc
    );

    updateOperation(operation.id, { documents: updatedDocuments });
    setShowEditForm(false);
    setEditingDocument(null);
  };

  const handleExportToExcel = () => {
    const data = formatDocumentsForExcel(filteredDocuments);
    exportToExcel(data, 'documents-report');
  };

  return (
    <div className="animate-fade-in">
      {showPreview && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('documentDetails')}</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Document Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">ID:</span> {selectedDocument.name}</p>
                    <p><span className="font-medium">Type:</span> {selectedDocument.type}</p>
                    <p><span className="font-medium">Date:</span> {selectedDocument.date}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        selectedDocument.status === 'approved' 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-warning-100 text-warning-800'
                      }`}>
                        {selectedDocument.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Operation Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Operation Number:</span> {selectedDocument.operation.number}</p>
                    <p><span className="font-medium">Type:</span> {selectedDocument.operation.type}</p>
                    <p className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium">Route:</span> {selectedDocument.operation.route}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Client Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Client:</span> {selectedDocument.operation.clientName}</p>
                    <p><span className="font-medium">Service Provider:</span> {selectedDocument.operation.serviceProvider}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Financial Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p>
                      <DollarSignIcon className="h-4 w-4 text-gray-400 inline mr-2" />
                      <span className="font-medium">Carrier Cost:</span> ${selectedDocument.operation.carrierCost.toLocaleString()}
                    </p>
                    <p>
                      <DollarSignIcon className="h-4 w-4 text-gray-400 inline mr-2" />
                      <span className="font-medium">Sale Value:</span> ${selectedDocument.operation.saleValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPreview(false);
                  handleEditDocument(selectedDocument);
                }}
                className="btn btn-secondary flex items-center"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Edit Document
              </button>
              <button
                onClick={() => handleDownloadDocument(selectedDocument)}
                className="btn btn-primary flex items-center"
              >
                <DownloadIcon className="h-5 w-5 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditForm && editingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Document</h2>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingDocument(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateDocument}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                  </label>
                  <select 
                    className="select"
                    value={editingDocument.type}
                    onChange={(e) => setEditingDocument({ ...editingDocument, type: e.target.value })}
                    required
                  >
                    <option value="CRT">CRT</option>
                    <option value="MIC/DTA">MIC/DTA</option>
                    <option value="CMR">CMR</option>
                    <option value="AWB">AWB</option>
                    <option value="BOL">Bill of Lading</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Date
                  </label>
                  <input 
                    type="date" 
                    className="input"
                    value={editingDocument.date}
                    onChange={(e) => setEditingDocument({ ...editingDocument, date: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea 
                    className="input"
                    value={editingDocument.description || ''}
                    onChange={(e) => setEditingDocument({ ...editingDocument, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingDocument(null);
                  }}
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('documentRegistry')}</h2>
            <p className="text-gray-500 mt-1">{t('manageDocuments')}</p>
          </div>
          <div className="mt-4 md:mt-0 space-x-2">
            <button
              onClick={handleExportToExcel}
              className="btn btn-primary flex items-center"
            >
              <DownloadIcon className="h-5 w-5 mr-2" />
              Export to Excel
            </button>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              <span>{t('addDocument')}</span>
            </button>
          </div>
        </div>

        {showForm && (
          <div className="card mb-6 animate-slide-in-up">
            <h3 className="text-lg font-medium mb-4">{t('registerNewDocument')}</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('operationNumber')}
                  </label>
                  <select 
                    className="select"
                    value={selectedOperation}
                    onChange={(e) => setSelectedOperation(e.target.value)}
                    required
                  >
                    <option value="">{t('selectOperation')}</option>
                    {operations.map(operation => (
                      <option key={operation.id} value={operation.id}>
                        {operation.operationNumber} ({operation.originCity} - {operation.destinationCity})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('documentType')}
                  </label>
                  <select 
                    className="select"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    required
                  >
                    <option value="">{t('selectType')}</option>
                    <option value="CRT">CRT</option>
                    <option value="MIC/DTA">MIC/DTA</option>
                    <option value="CMR">CMR</option>
                    <option value="AWB">AWB</option>
                    <option value="BOL">Bill of Lading</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('documentDate')}
                  </label>
                  <input 
                    type="date" 
                    className="input"
                    value={documentDate}
                    onChange={(e) => setDocumentDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('documentDescription')}
                  </label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder={t('enterDescription')}
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('uploadDocument')}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative">
                  <div className="space-y-1 text-center">
                    {uploadSuccess ? (
                      <div className="flex flex-col items-center text-success-600 animate-fade-in">
                        <CheckCircleIcon className="h-12 w-12 mb-2" />
                        <p className="text-lg font-medium">{t('uploadSuccess')}</p>
                        <p className="text-sm">{uploadedFile?.name}</p>
                      </div>
                    ) : (
                      <>
                        <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                          >
                            <span>{t('uploadFile')}</span>
                            <input 
                              id="file-upload" 
                              name="file-upload" 
                              type="file" 
                              className="sr-only"
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx,.xls,.xlsx"
                            />
                          </label>
                          <p className="pl-1">{t('orDragAndDrop')}</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX up to 10MB</p>
                        {uploadedFile && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Selected file: {uploadedFile.name}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={uploadSuccess}
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={uploadSuccess || !uploadedFile}
                >
                  {uploadSuccess ? (
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      {t('documentRegistered')}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <UploadIcon className="h-5 w-5 mr-2" />
                      {t('registerDocument')}
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('searchDocuments')}
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
              <option value="all">{t('allDocuments')}</option>
              <option value="approved">{t('approved')}</option>
              <option value="pending">{t('pending')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>{t('documentId')}</th>
              <th>{t('type')}</th>
              <th>{t('operation')}</th>
              <th>{t('route')}</th>
              <th>{t('date')}</th>
              <th>{t('status')}</th>
              <th className="text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="font-medium text-gray-900">
                  <div className="flex items-center">
                    <FileTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                    {doc.name}
                  </div>
                </td>
                <td>{doc.type}</td>
                <td>
                  <div className="flex items-center">
                    <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                    {doc.operation.number}
                  </div>
                </td>
                <td>
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                    {doc.operation.originCity}
                    <ArrowRightIcon className="h-4 w-4 mx-1" />
                    {doc.operation.destinationCity}
                  </div>
                </td>
                <td>{doc.date}</td>
                <td>
                  {doc.status === 'approved' ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-success-100 text-success-800 flex items-center w-fit">
                      <CheckCircleIcon className="h-3 w-3 mr-1" /> {t('approved')}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-warning-100 text-warning-800 flex items-center w-fit">
                      <XCircleIcon className="h-3 w-3 mr-1" /> {t('pending')}
                    </span>
                  )}
                </td>
                <td>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleApproveDocument(doc.operation.id, doc.id)}
                      className={`text-success-600 hover:text-success-900 flex items-center ${
                        doc.status === 'approved' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={doc.status === 'approved'}
                      title={t('approve')}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRejectDocument(doc.operation.id, doc.id)}
                      className={`text-warning-600 hover:text-warning-900 flex items-center ${
                        doc.status === 'pending' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={doc.status === 'pending'}
                      title={t('reject')}
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleViewDocument(doc)}
                      className="text-primary-600 hover:text-primary-900 flex items-center"
                      title={t('view')}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleEditDocument(doc)}
                      className="text-secondary-600 hover:text-secondary-900 flex items-center"
                      title={t('edit')}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDownloadDocument(doc)}
                      className="text-gray-600 hover:text-gray-900 flex items-center"
                      title={t('download')}
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDocuments.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  {t('noDocumentsFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentRegistry;