import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar.jsx';
import Header from '../components/common/Header.jsx';
import ProductModal from '../components/inventory/ProductModal.jsx';
import SeedModal from '../components/inventory/SeedModal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import inventoryApi from '../services/api.js';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [seedModalOpen, setSeedModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalRecords, setTotalRecords] = useState(null);

  const { addToast } = useToast();

  const handleCreateProduct = async (productData) => {
    setIsSubmitting(true);
    try {
      const response = await inventoryApi.createProduct(productData);
      addToast({
        type: 'success',
        title: 'Product Created',
        message: `${response.data.productName} (${response.data.sku}) added successfully.`,
      });
      setAddModalOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeedDatabase = async (count, clearExisting) => {
    setIsSeeding(true);
    try {
      const result = await inventoryApi.seedDatabase(count, clearExisting);
      addToast({
        type: 'success',
        title: 'Database Seeded',
        message: result.message || `Successfully seeded ${count.toLocaleString()} products.`,
      });
      setSeedModalOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Seeding Failed',
        message: err.message || 'Failed to seed records into database.',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenAddModal={() => setAddModalOpen(true)}
          onOpenSeedModal={() => setSeedModalOpen(true)}
          totalRecords={totalRecords}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet context={{ refreshTrigger, setRefreshTrigger, setTotalRecords }} />
        </main>
      </div>

      {/* Global Add Product Modal */}
      <ProductModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreateProduct}
        isSubmitting={isSubmitting}
      />

      {/* Global Seed Modal */}
      <SeedModal
        isOpen={seedModalOpen}
        onClose={() => setSeedModalOpen(false)}
        onConfirm={handleSeedDatabase}
        isSeeding={isSeeding}
      />
    </div>
  );
};

export default MainLayout;
