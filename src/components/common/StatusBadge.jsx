import React from 'react';
import { getStockStatus } from '../../utils/formatters.js';

export const StatusBadge = ({ stockQuantity, reorderLevel }) => {
  const status = getStockStatus(stockQuantity, reorderLevel);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
      {status.label}
    </span>
  );
};

export default StatusBadge;
