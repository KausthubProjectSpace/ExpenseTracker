import React, { useState } from 'react';
import TransactionForm from './TransactionForm';
import TransactionSidebar from './TransactionSidebar';

function TransactionManager({ selectedDate, onBack }) {
  const [editTransaction, setEditTransaction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleEditTransaction = (transaction) => {
    setEditTransaction(transaction);
  };
  
  const handleAddTransaction = () => {
    setEditTransaction(null);
  };
  
  const handleSaveComplete = () => {
    setEditTransaction(null);
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <TransactionSidebar 
            selectedDate={selectedDate}
            onEditTransaction={handleEditTransaction}
            onAddTransaction={handleAddTransaction}
            onRefresh={refreshKey}
          />
        </div>
        <div className="md:w-2/3">
          <TransactionForm 
            selectedDate={selectedDate}
            onBack={onBack}
            editTransaction={editTransaction}
            onSaveComplete={handleSaveComplete}
          />
        </div>
      </div>
    </div>
  );
}

export default TransactionManager;
