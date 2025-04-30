import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

function TransactionSidebar({ selectedDate, onEditTransaction, onAddTransaction, onRefresh }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format date for API (YYYY-MM-DD)
  const apiDate = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;

  // Fetch transactions for the selected date
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/transactions/date/${apiDate}`);
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Failed to fetch transactions');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [apiDate, onRefresh]);

  // Handle delete transaction
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the transaction from the list
        setTransactions(transactions.filter(t => t.id !== id));
        // Notify parent component to refresh data if needed
        if (onRefresh) onRefresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete transaction: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Error connecting to the server');
      console.error('Error deleting transaction:', err);
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full max-w-xs">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Transactions for {apiDate}</h3>
        <button 
          onClick={() => onAddTransaction()} 
          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"
          title="Add new transaction"
        >
          <FaPlus />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading transactions...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900 text-white p-3 rounded-md text-sm">
          {error}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-4 text-gray-400">
          <p>No transactions found for this date.</p>
          <p className="mt-2">Click the + button to add one.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {transactions.map((transaction) => (
            <li key={transaction.id} className="bg-gray-800 p-3 rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-white">{transaction.reason}</h4>
                  <p className={`text-sm ${transaction.mode === 'DEBIT' ? 'text-red-400' : 'text-green-400'}`}>
                    {transaction.mode === 'DEBIT' ? '-' : '+'} ₹{transaction.amount}
                    {transaction.ignore && <span className="ml-2 text-gray-400">(Ignored)</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{transaction.category} / {transaction.category2}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onEditTransaction(transaction)} 
                    className="text-blue-400 hover:text-blue-300"
                    title="Edit transaction"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDeleteTransaction(transaction.id)} 
                    className="text-red-400 hover:text-red-300"
                    title="Delete transaction"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TransactionSidebar;
