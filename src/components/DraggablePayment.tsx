import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { DollarSignIcon, CalendarIcon, XCircleIcon } from 'lucide-react';

interface DraggablePaymentProps {
  payment: any;
  className?: string;
}

const DraggablePayment: React.FC<DraggablePaymentProps> = ({ payment, className = '' }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `${payment.operation.id}-${payment.description}`,
    data: payment
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
    zIndex: 50
  } : undefined;

  // Determine if the operation is canceled
  const isCanceled = payment.operation.status === 'canceled';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${className} cursor-move touch-none select-none ${
        isCanceled ? 'opacity-75' : ''
      }`}
    >
      <div className="font-medium">{payment.operation.number}</div>
      <div className="flex items-center">
        {isCanceled ? (
          <XCircleIcon className="h-3 w-3 mr-1 text-error-500" />
        ) : (
          <DollarSignIcon className="h-3 w-3 mr-1" />
        )}
        {payment.currency === 'USD'
          ? `$${payment.amount.toLocaleString()}`
          : `CLP ${payment.amount.toLocaleString()}`
        }
      </div>
      <div className="text-xs opacity-75 flex items-center">
        <CalendarIcon className="h-3 w-3 mr-1" />
        {new Date(payment.dueDate).toLocaleDateString()}
      </div>
      <div className="text-xs opacity-75">
        {payment.type === 'carrier' ? '🚛' : '👤'} {payment.description}
      </div>
      {isCanceled && (
        <div className="text-xs text-error-600 mt-1 flex items-center">
          <XCircleIcon className="h-3 w-3 mr-1" />
          Canceled
        </div>
      )}
    </div>
  );
};

export default DraggablePayment;