import React from 'react';
import { PAYMENT_TERMS } from '../contexts/ClientsContext';

interface PaymentTermsSelectProps {
  value: string;
  onChange: (value: any) => void;
  currency: 'USD' | 'CLP';
  className?: string;
}

const PaymentTermsSelect: React.FC<PaymentTermsSelectProps> = ({
  value,
  onChange,
  currency,
  className = ''
}) => {
  return (
    <select
      className={`select ${className}`}
      value={value}
      onChange={(e) => onChange(PAYMENT_TERMS[e.target.value as keyof typeof PAYMENT_TERMS])}
    >
      <option value="">Select payment terms</option>
      {Object.entries(PAYMENT_TERMS).map(([key, terms]) => (
        <option key={key} value={key}>
          {terms.description}
        </option>
      ))}
    </select>
  );
};

export default PaymentTermsSelect;