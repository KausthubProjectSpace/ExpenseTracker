import React, { useState, useEffect } from 'react';

function BudgetForm({ onClose, onBudgetSet }) {
  const [amount, setAmount] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // JavaScript months are 0-indexed
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch current budget if it exists
  useEffect(() => {
    const fetchCurrentBudget = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/budgets/year/${year}/month/${month}`);
        if (response.ok) {
          const data = await response.json();
          setCurrentBudget(data);
          setAmount(data.amount);
        } else if (response.status === 404) {
          // No budget found for this month, reset the form
          setCurrentBudget(null);
          setAmount('');
          console.log('No budget found for this month, will create new one');
        }
      } catch (error) {
        console.error('Error fetching budget:', error);
      }
    };

    fetchCurrentBudget();
  }, [year, month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const budgetData = {
        year: parseInt(year),
        month: parseInt(month),
        amount: parseFloat(amount) || 0
      };

      const url = currentBudget
        ? `http://127.0.0.1:8000/budgets/${currentBudget.id}`
        : 'http://127.0.0.1:8000/budgets/';

      const method = currentBudget ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(method === 'PUT' ? { amount: budgetData.amount } : budgetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save budget');
      }

      const savedBudget = await response.json();
      console.log('Budget saved:', savedBudget);

      setSuccess(true);

      if (onBudgetSet) {
        onBudgetSet(savedBudget);
      }

      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error('Error saving budget:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-xl text-gray-100 w-full max-w-md mx-auto border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-400">Set Monthly Budget</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-xl"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-1">Year</label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {[...Array(10)].map((_, i) => {
                const yearValue = new Date().getFullYear() - 2 + i;
                return (
                  <option key={yearValue} value={yearValue}>
                    {yearValue}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-300 mb-1">Month</label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {monthNames.map((name, index) => (
                <option key={index} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Budget Amount</label>
          <input
            type="number"
            id="amount"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter budget amount"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-800 text-white rounded-md text-sm">
            Error: {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-800 text-white rounded-md text-sm">
            Budget saved successfully!
          </div>
        )}

        <div className="pt-4 text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-lg text-white font-bold text-lg transition duration-200 shadow-lg ${
              isSubmitting
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
            }`}
          >
            {isSubmitting ? 'Saving...' : currentBudget ? 'Update Budget' : 'Set Budget'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BudgetForm;
