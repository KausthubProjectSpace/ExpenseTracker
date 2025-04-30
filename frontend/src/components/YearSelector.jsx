import React, { useState } from 'react';

// Simple placeholder for now. A real app might fetch years or allow input.
const availableYears = [2023, 2024, 2025, 2026];

function YearSelector({ onYearSelect, currentYear }) {
   // Basic state to show selection visually, might need refinement for adding years
  const [selected, setSelected] = useState(currentYear);

  const handleSelect = (year) => {
    setSelected(year);
    onYearSelect(year);
  }

  return (
    <div className="p-4 bg-gray-700 rounded-lg shadow-md text-gray-100">
      <h2 className="text-lg font-semibold mb-3 text-center">Select Year</h2>
      <div className="flex gap-2 justify-center items-center">
         {/* Basic example: iterating over some years */}
         {availableYears.map(year => (
             <button
               key={year}
               onClick={() => handleSelect(year)}
               className={`px-4 py-1 rounded transition duration-150 ${
                 selected === year
                   ? 'bg-blue-600 text-white font-bold'
                   : 'bg-gray-600 hover:bg-gray-500'
               }`}
             >
               {year}
             </button>
         ))}
        <button
          title="Add New Year (Feature not implemented)"
          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xl font-bold"
          onClick={() => alert('Add Year feature not implemented yet.')}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default YearSelector;