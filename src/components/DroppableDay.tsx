import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import DraggablePayment from './DraggablePayment';

interface DroppableDayProps {
  date: Date | null;
  payments: any[];
  isCurrentMonth: boolean;
  onDrop: (date: Date, payment: any) => void;
}

const DroppableDay: React.FC<DroppableDayProps> = ({ date, payments, isCurrentMonth, onDrop }) => {
  const { setNodeRef } = useDroppable({
    id: date ? date.toISOString() : 'empty',
    data: { date }
  });

  if (!date) {
    return (
      <div 
        ref={setNodeRef}
        className="bg-gray-50 p-2 min-h-[120px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`bg-white p-2 min-h-[120px] ${
        !isCurrentMonth ? 'bg-gray-50' : ''
      } ${payments.length > 0 ? 'hover:bg-gray-50' : ''}`}
    >
      <div className={`font-medium mb-2 ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
        {date.getDate()}
      </div>
      {payments.map((payment, i) => (
        <DraggablePayment
          key={`${payment.operation.id}-${payment.description}`}
          payment={payment}
          className={`text-xs p-1 rounded mb-1 ${
            payment.type === 'carrier'
              ? payment.status === 'paid'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-primary-50 text-primary-800'
              : payment.status === 'paid'
                ? 'bg-success-100 text-success-800'
                : 'bg-success-50 text-success-800'
          }`}
        />
      ))}
    </div>
  );
};

export default DroppableDay;