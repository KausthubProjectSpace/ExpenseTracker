import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TransactionForm from './TransactionForm';
import TransactionSidebar from './TransactionSidebar';

function TransactionPage() {
  const navigate = useNavigate();
  const { year, month, day } = useParams();
  
  const [selectedDate, setSelectedDate] = useState({
    year: parseInt(year),
    month: parseInt(month),
    day: parseInt(day)
  });
  
  const [editTransaction, setEditTransaction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleBack = () => {
    navigate('/');
  };
  
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
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto">
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
              onBack={handleBack}
              editTransaction={editTransaction}
              onSaveComplete={handleSaveComplete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionPage;
