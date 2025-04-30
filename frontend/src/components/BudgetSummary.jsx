import React, { useState, useEffect } from 'react';
import BudgetForm from './BudgetForm';

function BudgetSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // JavaScript months are 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchBudgetSummary();
  }, [year, month]);

  const fetchBudgetSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/budget-summary/year/${year}/month/${month}`);

      if (!response.ok) {
        if (response.status === 404) {
          // No budget found for this month
          setSummary({
            year,
            month,
            budget: 0,
            spent: 0,
            earned: 0,
            remaining: 0,
            transactions: []
          });
          return;
        }
        throw new Error('Failed to fetch budget summary');
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error('Error fetching budget summary:', err);
      setError(err.message);
      // Set default summary if there's an error
      setSummary({
        year,
        month,
        budget: 0,
        spent: 0,
        earned: 0,
        remaining: 0,
        transactions: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetSet = () => {
    fetchBudgetSummary();
    setShowBudgetForm(false);
  };

  const handlePreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow-md text-gray-100">
        <p className="text-center">Loading budget information...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md text-gray-100">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePreviousMonth}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
        >
          ←
        </button>

        <h2 className="text-lg font-semibold text-center">
          {monthNames[month - 1]} {year}
        </h2>

        <button
          onClick={handleNextMonth}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
        >
          →
        </button>
      </div>

      {showBudgetForm ? (
        <BudgetForm
          onClose={() => setShowBudgetForm(false)}
          onBudgetSet={handleBudgetSet}
          initialYear={year}
          initialMonth={month}
        />
      ) : (
        <>
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg shadow-lg mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-300 uppercase tracking-wider">Budget</p>
              <p className="text-3xl font-bold text-white">₹{summary?.budget.toFixed(2)}</p>
            </div>
            <div className="h-12 w-0.5 bg-gray-600 mx-4"></div>
            <div className="text-center">
              <p className="text-sm text-gray-300 uppercase tracking-wider">Remaining</p>
              <p className={`text-3xl font-bold ${summary?.remaining < 0 ? 'text-red-400' : 'text-green-400'}`}>
                ₹{summary?.remaining.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={() => setShowBudgetForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition duration-200"
            >
              {summary?.budget > 0 ? 'Update Budget' : 'Set Budget'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default BudgetSummary;
