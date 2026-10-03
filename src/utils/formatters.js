export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatDate = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '—';
  }
};

export const getStockStatus = (stockQuantity, reorderLevel) => {
  const stock = Number(stockQuantity) || 0;
  const reorder = Number(reorderLevel) || 0;

  if (stock === 0) {
    return {
      type: 'OUT_OF_STOCK',
      label: 'Out of Stock',
      variant: 'danger',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10',
      dotClass: 'bg-rose-500',
    };
  }

  if (stock <= reorder) {
    return {
      type: 'LOW_STOCK',
      label: 'Low Stock',
      variant: 'warning',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-600/10',
      dotClass: 'bg-amber-500',
    };
  }

  return {
    type: 'IN_STOCK',
    label: 'In Stock',
    variant: 'success',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-600/10',
    dotClass: 'bg-emerald-500',
  };
};

export const CATEGORIES = [
  'Electronics',
  'Audio',
  'Computers',
  'Mobile',
  'Gaming',
  'Home Appliances',
  'Accessories',
  'Networking',
  'Cameras',
  'Wearables',
];
