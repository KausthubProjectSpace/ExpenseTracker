// src/components/DaySelector.jsx
import React from 'react';

// Helpers remain the same
const isSelected = (day, selectedDay) => day === selectedDay;
const isToday = (day, year, month) => {
    const today = new Date();
    return day === today.getDate() &&
           month === today.getMonth() + 1 &&
           year === today.getFullYear();
}

function DaySelector({ selectedYear, selectedMonth, onDaySelect, selectedDay }) {
  if (!selectedMonth) return null;

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });

  return (
    // Using the holographic card style
    <div className="p-4 shadow rounded-lg holographic-card">
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-100">
        {monthName} {selectedYear}
      </h3>
      {/* --- Reduced gap to zero --- */}
      <div className="grid grid-cols-5 gap-0 place-items-center"> {/* Changed gap-px to gap-0 */}
        {daysArray.map((day) => {
          const selected = isSelected(day, selectedDay);
          const today = isToday(day, selectedYear, selectedMonth);

          return (
            <button
              key={day}
              onClick={() => onDaySelect(day)}
              type="button"
              className={`
                /* Using increased size from previous step */
                w-11 h-11 md:w-12 md:h-12
                flex items-center justify-center
                /* Using increased text size */
                text-base md:text-lg
                font-medium
                cursor-pointer
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500
                rounded-full
                ${selected
                  ? 'bg-blue-600 text-white scale-105 shadow-md z-10' // Added z-10 for selected
                  : `text-gray-300 bg-transparent hover:bg-blue-500 hover:text-white hover:scale-105 hover:shadow hover:z-10` // Added hover:z-10
                }
                ${today && !selected
                  ? 'text-blue-400 ring-1 ring-blue-400/50 hover:text-white'
                  : 'ring-1 ring-transparent'
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DaySelector;
// // src/components/DaySelector.jsx
// import React from 'react';

// // Helpers remain the same
// const isSelected = (day, selectedDay) => day === selectedDay;
// const isToday = (day, year, month) => {
//     const today = new Date();
//     return day === today.getDate() &&
//            month === today.getMonth() + 1 &&
//            year === today.getFullYear();
// }

// function DaySelector({ selectedYear, selectedMonth, onDaySelect, selectedDay }) {
//   if (!selectedMonth) return null;

//   const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
//   const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
//   const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });

//   return (
//     // Using the holographic card style from previous step
//     <div className="p-4 shadow rounded-lg holographic-card">
//       <h3 className="text-lg font-semibold mb-4 text-center text-gray-100">
//         {monthName} {selectedYear}
//       </h3>
//       {/* --- Decreased gap --- */}
//       <div className="grid grid-cols-5 gap-px place-items-center"> {/* Changed gap-1 to gap-px */}
//         {daysArray.map((day) => {
//           const selected = isSelected(day, selectedDay);
//           const today = isToday(day, selectedYear, selectedMonth);

//           return (
//             <button
//               key={day}
//               onClick={() => onDaySelect(day)}
//               type="button"
//               className={`
//                 w-11 h-11 md:w-12 md:h-12 
//                 flex items-center justify-center
//                 text-base md:text-lg 
//                 font-medium
//                 cursor-pointer
//                 transition-all duration-200 ease-out
//                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500
//                 rounded-full
//                 ${selected
//                   ? 'bg-blue-600 text-white scale-105 shadow-md'
//                   : `text-gray-300 bg-transparent hover:bg-blue-500 hover:text-white hover:scale-105 hover:shadow`
//                 }
//                 ${today && !selected
//                   ? 'text-blue-400 ring-1 ring-blue-400/50 hover:text-white'
//                   : 'ring-1 ring-transparent'
//                 }
//               `}
//             >
//               {day}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// export default DaySelector;
// // src/components/DaySelector.jsx
// import React from 'react';

// // Helpers remain the same
// const isSelected = (day, selectedDay) => day === selectedDay;
// const isToday = (day, year, month) => { /* ... */ };

// function DaySelector({ selectedYear, selectedMonth, onDaySelect, selectedDay }) {
//   if (!selectedMonth) return null;

//   const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
//   const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
//   const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });

//   return (
//     // Outer div - Holographic effect will be applied here later
//     <div className="p-4 bg-gray-800 rounded-lg shadow holographic-card holo-shimmer"> {/* Added holographic-card class */}
//       <h3 className="text-lg font-semibold mb-4 text-center text-gray-100">
//         {monthName} {selectedYear}
//       </h3>
//       <div className="grid grid-cols-5 gap-1 place-items-center"> {/* Reduced gap for tighter fit */}
//         {daysArray.map((day) => {
//           const selected = isSelected(day, selectedDay);
//           const today = isToday(day, selectedYear, selectedMonth);

//           return (
//             <button
//               key={day}
//               onClick={() => onDaySelect(day)}
//               type="button"
//               // --- Style changes for hover effect ---
//               className={`
//                 w-10 h-10 md:w-11 md:h-11 /* Ensure consistent size container */
//                 flex items-center justify-center /* Always flex center */
//                 text-sm md:text-base font-medium
//                 cursor-pointer
//                 transition-all duration-200 ease-out /* Slightly longer duration */
//                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 /* Adjust focus offset color */
//                 rounded-full /* Keep rounded-full always for smooth transition */
//                 ${selected
//                   ? 'bg-blue-600 text-white scale-105 shadow-md' // Selected state (always circle)
//                   : `text-gray-300 bg-transparent hover:bg-blue-500 hover:text-white hover:scale-105 hover:shadow` // Default & Hover
//                 }
//                 ${today && !selected
//                   ? 'text-blue-400 ring-1 ring-blue-400/50 hover:text-white' // Today marker (subtle ring, changes color on hover)
//                   : 'ring-1 ring-transparent' // Placeholder ring to prevent size shift
//                 }
//               `}
//             >
//               {day}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// export default DaySelector;
// // src/components/DaySelector.jsx
// import React from 'react';

// // Helper to check if a day is selected
// const isSelected = (day, selectedDay) => day === selectedDay;

// // Helper to check if it's today
// const isToday = (day, year, month) => {
//     const today = new Date();
//     return day === today.getDate() &&
//            month === today.getMonth() + 1 &&
//            year === today.getFullYear();
// }

// function DaySelector({ selectedYear, selectedMonth, onDaySelect, selectedDay }) {
//   if (!selectedMonth) {
//     return null;
//   }

//   const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
//   const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

//   // Get month name for the title
//   const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });

//   return (
//     <div className="p-4 bg-gray-800 rounded-lg shadow">
//       <h3 className="text-lg font-semibold mb-4 text-center"> {/* Increased margin-bottom */}
//           {monthName} {selectedYear}
//       </h3>
//       {/* --- Changed grid-cols-7 to grid-cols-5 and adjusted gap --- */}
//       <div className="grid grid-cols-5 gap-2 md:gap-3 place-items-center"> {/* Use gap-2 or gap-3 */}
//         {daysArray.map((day) => (
//           <button
//             key={day}
//             onClick={() => onDaySelect(day)}
//             type="button"
//             className={`
//               w-10 h-10 md:w-11 md:h-11  /* Slightly adjusted size, make sure they are equal */
//               rounded-full
//               flex items-center justify-center
//               text-sm md:text-base font-medium
//               cursor-pointer
//               border-2 border-transparent /* Add transparent border to prevent layout shift on hover/select */
//               transition-all duration-150 ease-in-out
//               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 /* Focus style */
//               ${isSelected(day, selectedDay)
//                 ? 'bg-blue-600 text-white border-blue-700 scale-105 shadow-md' // Enhanced selected style
//                 : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-gray-500 hover:scale-105' // Enhanced default/hover
//               }
//               ${isToday(day, selectedYear, selectedMonth) && !isSelected(day, selectedDay)
//                   ? '!border-blue-400' // Use !important if needed to override hover, or manage specificity
//                   : ''
//               }
//             `}
//           >
//             {day}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default DaySelector;
// import React from 'react';

// function getDaysInMonth(year, month) {
//   return new Date(year, month, 0).getDate();
// }
// function DaySelector({ selectedYear, selectedMonth, onDaySelect }) {
//   const daysCount = getDaysInMonth(selectedYear, selectedMonth);
//   const days = Array.from({ length: daysCount }, (_, i) => i + 1);
//   const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


//   return (
//     <div>
//     <div className="p-4 bg-gray-700 rounded-lg shadow-md text-gray-100 max-h-96 overflow-y-auto">
//        <h2 className="text-lg font-semibold mb-3 text-center">Select Day ({monthNames[selectedMonth-1]} {selectedYear})</h2>
//       <div className="grid grid-cols-5 gap-2"> {/* Adjust grid columns as needed */}
//         {days.map((day) => (
//           <button
//             key={day}
//             onClick={() => onDaySelect(day)}
//             className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-center font-medium transition duration-150 aspect-square flex items-center justify-center" // aspect-square for square buttons
//           >
//             {day}
//           </button>
          
//         ))}
//       </div>
//     </div>
    


//     </div>
//   );
// }

// export default DaySelector;