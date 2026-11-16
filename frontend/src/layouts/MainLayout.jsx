import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import UploadModal from '../components/UploadModal';

export default function MainLayout({
  activeTab,
  onTabChange,
  activeDataset,
  dateRange,
  onDatasetUpdated,
  onGlobalSearch,
  children
}) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          activeDataset={activeDataset}
          dateRange={dateRange}
          onOpenUpload={() => setIsUploadOpen(true)}
          onGlobalSearch={onGlobalSearch}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Upload & Preprocessing Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDatasetUpdated={onDatasetUpdated}
      />
    </div>
  );
}
