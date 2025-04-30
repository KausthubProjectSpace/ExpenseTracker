import React, { useState } from 'react';
import BudgetSummary from './BudgetSummary';

function WelcomeScreen({ onStart }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exportMonth, setExportMonth] = useState('');
  const [exportDay, setExportDay] = useState('');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportError, setExportError] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      // Construct the URL with optional parameters
      let url = 'http://127.0.0.1:8000/export/csv';
      const params = [];

      if (exportYear) {
        params.push(`year=${exportYear}`);
      }

      if (exportMonth) {
        params.push(`month=${exportMonth}`);
      }

      if (exportDay) {
        params.push(`day=${exportDay}`);
      }

      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      // Open the URL in a new tab to trigger the download
      window.open(url, '_blank');

      // Hide export options after successful export
      setTimeout(() => {
        setShowExportOptions(false);
      }, 1000);
    } catch (err) {
      console.error('Export error:', err);
      setExportError('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-xl text-gray-100 border border-gray-700">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">Budget Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Budget Summary */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <BudgetSummary />
        </div>

        {/* Main Actions */}
        <div className="flex flex-col space-y-6 justify-center bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <button
            onClick={onStart}
            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-white font-bold transition duration-200 text-lg shadow-lg"
          >
            Add Transaction
          </button>
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg text-white font-bold transition duration-200 text-lg shadow-lg"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Export options */}
      {showExportOptions && (
        <div className="mt-6 p-6 bg-gray-800 rounded-lg w-full max-w-2xl mx-auto border border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-blue-400">Export Options</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Year (optional)</label>
              <input
                type="number"
                value={exportYear}
                onChange={(e) => setExportYear(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Month (optional)</label>
              <select
                value={exportMonth}
                onChange={(e) => setExportMonth(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Month</option>
                {monthNames.map((name, index) => (
                  <option key={index} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Day (optional)</label>
              <input
                type="number"
                min="1"
                max="31"
                value={exportDay}
                onChange={(e) => setExportDay(e.target.value)}
                disabled={!exportMonth}
                className={`w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!exportMonth ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {exportError && (
            <div className="p-4 mb-4 bg-red-900 text-white rounded-lg text-sm border border-red-700">
              Error: {exportError}
            </div>
          )}

          <div className="flex space-x-4 justify-end">
            <button
              onClick={() => setShowExportOptions(false)}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition duration-200 shadow-md"
            >
              Cancel
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`px-5 py-2 rounded-lg text-white font-semibold transition duration-200 shadow-md ${
                isExporting ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
              }`}
            >
              {isExporting ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomeScreen;