import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // generous timeout for large bulk seed operations
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = 'An unexpected error occurred';
    let fieldErrors = [];

    if (error.response) {
      const data = error.response.data;
      errorMessage = data?.message || `Server responded with status ${error.response.status}`;
      fieldErrors = data?.errors || [];
    } else if (error.request) {
      errorMessage = 'Network error: Unable to reach the inventory server. Please check connection.';
    } else {
      errorMessage = error.message;
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      errors: fieldErrors,
      raw: error,
    });
  }
);

export const inventoryApi = {
  // Fetch paginated inventory
  getInventory: (params = {}) => {
    return api.get('/inventory', { params });
  },

  // Fetch single item by ID
  getProductById: (id) => {
    return api.get(`/inventory/${id}`);
  },

  // Create new product
  createProduct: (productData) => {
    return api.post('/inventory', productData);
  },

  // Update product by ID
  updateProduct: (id, productData) => {
    return api.put(`/inventory/${id}`, productData);
  },

  // Delete product by ID
  deleteProduct: (id) => {
    return api.delete(`/inventory/${id}`);
  },

  // Trigger bulk seeder (e.g. 50,000 records)
  seedDatabase: (count = 50000, clearExisting = true) => {
    return api.post('/inventory/seed', { count, clearExisting });
  },

  // Fetch aggregate analytics
  getAnalytics: () => {
    return api.get('/analytics');
  },

  // Health check
  checkHealth: () => {
    return api.get('/health');
  },
};

export default inventoryApi;
