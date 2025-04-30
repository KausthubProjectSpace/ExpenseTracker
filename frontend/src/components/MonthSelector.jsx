// src/components/MonthSelector.jsx
import React from 'react';

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function MonthSelector({ selectedYear, onMonthSelect, selectedMonth }) {
  return (
    // --- Apply min-height to this outer container ---
    <div className="p-4 bg-gray-800 rounded-lg shadow min-h-[28rem] flex flex-col"> {/* Added min-h and flex utils */}
      <h3 className="text-lg font-semibold mb-3 text-center flex-shrink-0">{selectedYear}</h3> {/* Prevent title shrinking */}

      {/* Removed min-h from grid, added flex-grow to make grid fill space */}
      <div className="grid grid-cols-3 gap-2 flex-grow">
        {months.map((monthName, index) => {
          const monthNumber = index + 1;
          return (
            <button
              key={monthNumber}
              onClick={() => onMonthSelect(monthNumber)}
              type="button"
              // You might want buttons to stretch or align differently now
              className={`p-3 rounded text-center font-medium transition-colors duration-150 ease-in-out text-sm md:text-base h-full flex items-center justify-center ${ // Added h-full flex items/justify center
                selectedMonth === monthNumber
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              }`}
            >
              {monthName}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MonthSelector;
// import React from 'react';

// const months = [
//   'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
// ];

// function MonthSelector({ onMonthSelect, selectedYear }) {
//   return (
//     <div className="p-4 bg-gray-700 rounded-lg shadow-md text-gray-100">
//       <h2 className="text-lg font-semibold mb-3 text-center">Select Month ({selectedYear})</h2>
//       <div className="grid grid-cols-3 gap-3">
//         {months.map((month, index) => (
//           <button
//             key={month}
//             onClick={() => onMonthSelect(index + 1)} // Pass month number (1-12)
//             className="p-3 bg-gray-600 hover:bg-gray-500 rounded text-center font-medium transition duration-150"
//           >
//             {month}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default MonthSelector;