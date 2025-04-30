// src/App.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react'; // Import useCallback
import WelcomeScreen from './components/WelcomeScreen';
import YearSelector from './components/YearSelector';
import MonthSelector from './components/MonthSelector';
import DaySelector from './components/DaySelector';
import TransactionManager from './components/TransactionManager';
import BudgetSummary from './components/BudgetSummary';

// --- Constants for Steps ---
const STEP_WELCOME = 0;
const STEP_DATE_SELECT = 1; // Combined Year, Month & Day
const STEP_FORM = 2;

// Helper function to get step from hash, if present
const getStepFromHash = () => {
  const hash = window.location.hash; // e.g., #step=1
  if (hash.startsWith('#step=')) {
    const stepNum = parseInt(hash.substring(6), 10);
    if (!isNaN(stepNum) && stepNum >= STEP_WELCOME && stepNum <= STEP_FORM) {
      return stepNum;
    }
  }
  return STEP_WELCOME; // Default if no valid hash
};

function App() {
  const [currentStep, setCurrentStep] = useState(() => getStepFromHash());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null); // 1-12
  const [selectedDay, setSelectedDay] = useState(null); // 1-31

  // --- History Management Effect ---

  // Define handlePopState using useCallback to stabilize its identity
  // It now depends on the current selection state to make decisions
  const handlePopState = useCallback((event) => {
    const targetStep = event.state?.step ?? getStepFromHash();
    console.log("Popstate event:", event.state, "Target step:", targetStep, "Current state:", { step: currentStep, year: selectedYear, month: selectedMonth, day: selectedDay });

    // --- Block forward navigation to FORM if date is not fully selected ---
    // This check happens *before* we update the React state based on popstate
    // We check if the navigation *target* is the form AND if the required date state is missing.
    if (targetStep === STEP_FORM) {
      const isDateFullySelected = selectedYear !== null && selectedMonth !== null && selectedDay !== null;
      if (!isDateFullySelected) {
        console.log("Blocking forward nav to form - date not fully selected in current React state.");
        // Prevent navigation: Stay on the current step visually.
        // The browser *already* changed the URL/history index due to popstate.
        // We need to correct it by going back to where we were *supposed* to be.
        // Using replaceState on the *current* step's hash is often cleaner
        // than trying to force a 'go(-1)' which might have side effects.
        const currentValidHash = `#step=${currentStep}`; // Use the step state *before* this blocked update
        window.history.replaceState({ step: currentStep }, '', currentValidHash);
        console.log("Replaced history state to stay at:", currentStep);
        // IMPORTANT: Do not proceed to update React state
        return;
      }
       console.log("Allowing forward nav to form - date is selected.");
    }
    // --- End Block ---

    // If not blocked, proceed with state update and resets based on the TARGET step
    // Reset selections based on where we LANDED after popstate
    if (targetStep === STEP_DATE_SELECT) {
      // If landing on date select (e.g., back from form), clear day
      setSelectedDay(null);
    } else if (targetStep === STEP_WELCOME) {
      // If landing on welcome (e.g., back from date), clear everything
      setSelectedYear(new Date().getFullYear());
      setSelectedMonth(null);
      setSelectedDay(null);
    }

    // Update the React step state to match the browser history state
    setCurrentStep(targetStep);

  // Dependencies: The handler needs access to the latest state values to make decisions
  }, [currentStep, selectedYear, selectedMonth, selectedDay]); // Add state dependencies

  // Reset to welcome screen on page reload
  useEffect(() => {
    navigateToStep(STEP_WELCOME);
  }, []);

  useEffect(() => {
    // Add the event listener when the component mounts
    window.addEventListener('popstate', handlePopState);

    // Replace initial history state on load to match the currentStep
    const initialHash = `#step=${currentStep}`;
    if (window.location.hash !== initialHash) {
        window.history.replaceState({ step: currentStep }, '', initialHash);
    }

    // Cleanup function: remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
    // The main effect depends on the stabilized handlePopState function
  }, [handlePopState, currentStep]); // Ensure effect re-runs if handlePopState changes identity or initial currentStep logic needs re-eval


  // --- Navigation Function ---
  const navigateToStep = (newStep) => {
    console.log("Navigating from step:", currentStep, "to step:", newStep);
    const currentStateStep = currentStep; // Capture state *before* update

    // 1. Update React State - This should happen first
    setCurrentStep(newStep);

    // Reset selections when moving *forward* programmatically
    if (newStep > currentStateStep) {
      if (newStep === STEP_DATE_SELECT) { // Moving to Date Selection from Welcome
        // Keep the current year, but reset month and day
        setSelectedMonth(null);
        setSelectedDay(null);
      }
      // No reset needed when moving to STEP_FORM, as day selection just happened
    }
     // If moving BACK programmatically (e.g. using an in-app back button that calls this)
     else if (newStep < currentStateStep) {
         if (newStep === STEP_DATE_SELECT) { // Going back to Date Selection (from Form)
            setSelectedDay(null);
         } else if (newStep === STEP_WELCOME) { // Going back to Welcome (from Date Selection)
            // Optional: reset everything when going back to welcome
            setSelectedYear(new Date().getFullYear());
            setSelectedMonth(null);
            setSelectedDay(null);
         }
     }


    // 2. Update Browser History only if the step actually changes
    if (newStep !== currentStateStep) {
      const newHash = `#step=${newStep}`;
      window.history.pushState({ step: newStep }, '', newHash);
      console.log("Pushed state:", { step: newStep });
    }
  };

  // --- Selection Handlers (use navigateToStep) ---

  const handleStart = () => {
    navigateToStep(STEP_DATE_SELECT);
  };

  // Export functionality is now handled directly in the WelcomeScreen component

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setSelectedMonth(null); // Reset month/day immediately for UI responsiveness
    setSelectedDay(null);
    navigateToStep(STEP_DATE_SELECT);
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setSelectedDay(null); // Reset day when month changes
    // No history push needed as we are staying on STEP_DATE_SELECT
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
    navigateToStep(STEP_FORM);
  };

  // --- View Mapping (Task 2 - Dictionary/Map) ---
  const viewMap = useMemo(() => ({
    [STEP_WELCOME]: () => (
      <WelcomeScreen onStart={handleStart} />
    ),
    [STEP_DATE_SELECT]: () => (
      <div className="flex flex-col gap-4">
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Select Date</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedYear(selectedYear - 1)}
                className="flex-shrink-0 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                &lt;
              </button>

              {Array.from({ length: 7 }, (_, i) => {
                const year = new Date().getFullYear() - 3 + i;
                return (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg ${
                      selectedYear === year
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}

              <button
                onClick={() => setSelectedYear(selectedYear + 1)}
                className="flex-shrink-0 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                &gt;
              </button>

              <div className="flex-shrink-0 ml-2">
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      setSelectedYear(value);
                    }
                  }}
                  className="w-20 px-2 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-full md:w-1/3">
             <MonthSelector
               selectedYear={selectedYear}
               onMonthSelect={handleMonthSelect}
               selectedMonth={selectedMonth}
             />
          </div>
          <div className="w-full md:w-2/3">
             {selectedMonth !== null ? (
               <DaySelector
                 selectedYear={selectedYear}
                 selectedMonth={selectedMonth}
                 onDaySelect={handleDaySelect}
               />
             ) : (
               <div className="p-4 text-center text-gray-500 bg-gray-800 rounded-lg">
                   Select a month to see available days.
               </div>
             )}
          </div>
        </div>
      </div>
    ),
    [STEP_FORM]: () => (
      <TransactionManager
        selectedDate={{ year: selectedYear, month: selectedMonth, day: selectedDay }}
        // Use navigateToStep for the back button for consistency and correct state reset
        onBack={() => navigateToStep(STEP_DATE_SELECT)}
      />
    ),
  }), [selectedYear, selectedMonth, selectedDay]); // Removed currentStep dependency here, not strictly needed for rendering map


  // Determine which component function to call from the map
  const CurrentViewComponent = viewMap[currentStep] || viewMap[STEP_WELCOME]; // Fallback

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {CurrentViewComponent()}
      </div>
    </div>
  );
}

export default App;



// // src/App.jsx
// import React, { useState, useMemo, useEffect } from 'react'; // Import useEffect
// import WelcomeScreen from './components/WelcomeScreen';
// import YearSelector from './components/YearSelector';
// import MonthSelector from './components/MonthSelector';
// import DaySelector from './components/DaySelector';
// import TransactionForm from './components/TransactionForm';

// // --- Constants for Steps ---
// const STEP_WELCOME = 0;
// const STEP_YEAR_SELECT = 1;
// const STEP_DATE_SELECT = 2; // Combined Month & Day
// const STEP_FORM = 3;

// // Helper function to get step from hash, if present
// const getStepFromHash = () => {
//   const hash = window.location.hash; // e.g., #step=1
//   if (hash.startsWith('#step=')) {
//     const stepNum = parseInt(hash.substring(6), 10);
//     if (!isNaN(stepNum) && stepNum >= STEP_WELCOME && stepNum <= STEP_FORM) {
//       return stepNum;
//     }
//   }
//   return STEP_WELCOME; // Default if no valid hash
// };


// function App() {
//   // Initialize step based on URL hash or default
//   const [currentStep, setCurrentStep] = useState(() => getStepFromHash());
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [selectedMonth, setSelectedMonth] = useState(null); // 1-12
//   const [selectedDay, setSelectedDay] = useState(null); // 1-31

//   // --- History Management Effect ---
//   useEffect(() => {
//     // Function to handle browser back/forward button clicks
//     const handlePopState = (event) => {
//       // When popstate event occurs, update the React state
//       // event.state should contain the { step: number } we pushed
//       const previousStep = event.state?.step ?? getStepFromHash(); // Fallback to hash reading
//       console.log("Popstate event:", event.state, "Setting step to:", previousStep);
//        // Reset selections based on where we LANDED after popstate
//        if (previousStep === STEP_DATE_SELECT) {
//            // If landing on date select (e.g., back from form), clear day
//            // Note: We might not have selectedDay info in event.state easily,
//            // so clearing is often the simplest reliable approach here.
//            setSelectedDay(null);
//        } else if (previousStep === STEP_YEAR_SELECT) {
//            // If landing on year select (e.g., back from date), clear month/day
//            setSelectedMonth(null);
//            setSelectedDay(null);
//        } else if (previousStep === STEP_WELCOME) {
//            // If landing on welcome (e.g., back from year), clear everything
//            setSelectedYear(new Date().getFullYear());
//            setSelectedMonth(null);
//            setSelectedDay(null);
//        }
//       setCurrentStep(previousStep);
//     };

//     // Add the event listener when the component mounts
//     window.addEventListener('popstate', handlePopState);

//     // Replace initial history state on load to match the currentStep
//     // This prevents an "extra" back step just for the initial load state.
//     // We use the hash to make the URL reflect the state minimally.
//     const initialHash = `#step=${currentStep}`;
//     if (window.location.hash !== initialHash) {
//         // Only replace if the hash isn't already correct (e.g., on direct load with hash)
//         window.history.replaceState({ step: currentStep }, '', initialHash);
//     }


//     // Cleanup function: remove the event listener when the component unmounts
//     return () => {
//       window.removeEventListener('popstate', handlePopState);
//     };
//   }, []); // Empty dependency array means this effect runs only once on mount and cleanup on unmount

//   // --- Navigation Function ---
//   // Central function to handle step changes AND history
//   const navigateToStep = (newStep) => {
//     console.log("Navigating to step:", newStep);
//     const currentStateStep = currentStep; // Capture state *before* update

//     // 1. Update React State
//     setCurrentStep(newStep);

//     // Reset selections when moving *forward*
//     if (newStep > currentStateStep) { // Only reset when going forward
//         if (newStep === STEP_DATE_SELECT) { // Moving to Date Selection
//             setSelectedMonth(null);
//             setSelectedDay(null);
//         } else if (newStep === STEP_FORM) { // Moving to Form (day was just selected)
//             // No reset needed here usually, as day selection triggers this
//         } else if (newStep === STEP_YEAR_SELECT) { // Moving to Year (from Welcome)
//             // Reset defaults (might already be set, but safe)
//             setSelectedYear(new Date().getFullYear());
//             setSelectedMonth(null);
//             setSelectedDay(null);
//         }
//     }


//     // 2. Update Browser History if the step actually changes
//     // Check against currentStateStep to prevent duplicate entries if called rapidly
//     // or if the step didn't actually change.
//     if (newStep !== currentStateStep) {
//         const newHash = `#step=${newStep}`;
//         // Use pushState to add a new entry to the browser history
//         window.history.pushState({ step: newStep }, '', newHash); // Store step in state object, update hash
//         console.log("Pushed state:", { step: newStep });
//     }
//   };

//   // --- Selection Handlers (use navigateToStep) ---

//   const handleStart = () => {
//     navigateToStep(STEP_YEAR_SELECT);
//   };

//   const handleExport = () => {
//     alert('Export to Excel - Not implemented yet.');
//   };

//   const handleYearSelect = (year) => {
//     setSelectedYear(year);
//     // Reset month/day immediately for UI responsiveness
//     setSelectedMonth(null);
//     setSelectedDay(null);
//     navigateToStep(STEP_DATE_SELECT);
//   };

//   const handleMonthSelect = (month) => {
//     setSelectedMonth(month);
//     setSelectedDay(null); // Reset day when month changes
//     // Don't navigate here, DaySelector appears on the same step
//     // No history push needed as we are staying on STEP_DATE_SELECT
//   };

//   const handleDaySelect = (day) => {
//     setSelectedDay(day);
//     navigateToStep(STEP_FORM);
//   };

//   // --- View Mapping (Task 2 - Dictionary/Map) ---
//   const viewMap = useMemo(() => ({
//     [STEP_WELCOME]: () => (
//       <WelcomeScreen onStart={handleStart} onExport={handleExport} />
//     ),
//     [STEP_YEAR_SELECT]: () => (
//        // No explicit back button needed IF browser back works
//       <YearSelector onYearSelect={handleYearSelect} currentYear={selectedYear} />
//     ),
//     [STEP_DATE_SELECT]: () => (
//       <div className="flex flex-col md:flex-row gap-4 items-start">
//         <div className="w-full md:w-1/3">
//             {/* Can remove the explicit back button now */}
//            {/* <button onClick={() => navigateToStep(STEP_YEAR_SELECT)}>Back</button> */}
//            <MonthSelector
//              selectedYear={selectedYear}
//              onMonthSelect={handleMonthSelect}
//              selectedMonth={selectedMonth}
//            />
//         </div>
//         <div className="w-full md:w-2/3">
//            {selectedMonth !== null ? (
//              <DaySelector
//                selectedYear={selectedYear}
//                selectedMonth={selectedMonth}
//                onDaySelect={handleDaySelect}
//              />
//            ) : (
//              <div className="p-4 text-center text-gray-500">
//                  Select a month to see available days.
//              </div>
//            )}
//         </div>
//       </div>
//     ),
//     [STEP_FORM]: () => (
//       <TransactionForm
//         selectedDate={{ year: selectedYear, month: selectedMonth, day: selectedDay }}
//         onBack={() => navigateToStep(STEP_DATE_SELECT)} // Use navigate function for consistency
//       />
//     ),
//   }), [selectedYear, selectedMonth, selectedDay, currentStep]); // Add currentStep dependency if needed for highlighting etc.


//   // Determine which component function to call from the map
//   const CurrentViewComponent = viewMap[currentStep] || viewMap[STEP_WELCOME]; // Fallback

//   return (
//     <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-4xl">
//         {CurrentViewComponent()}
//       </div>
//     </div>
//   );
// }

// export default App;



// // import React, { useState, useMemo } from 'react';
// // import WelcomeScreen from './components/WelcomeScreen';
// // import YearSelector from './components/YearSelector';
// // import MonthSelector from './components/MonthSelector';
// // import DaySelector from './components/DaySelector';
// // import TransactionForm from './components/TransactionForm';

// // // --- Constants for Steps ---
// // const STEP_WELCOME = 0;
// // const STEP_YEAR_SELECT = 1;
// // const STEP_DATE_SELECT = 2; // Combined Month & Day
// // const STEP_FORM = 3;

// // function App() {
// //   const [currentStep, setCurrentStep] = useState(STEP_WELCOME);
// //   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
// //   const [selectedMonth, setSelectedMonth] = useState(null); // 1-12
// //   const [selectedDay, setSelectedDay] = useState(null); // 1-31

// //   // --- Navigation Handlers ---

// //   const handleNext = () => {
// //     setCurrentStep(prev => prev + 1);
// //   };

// //   const handleBack = () => {
// //     // Reset state based on which step we are going *back* to
// //     setCurrentStep(prev => {
// //       const nextStep = prev - 1;
// //       if (nextStep === STEP_DATE_SELECT) { // Going back to Date Selection (from Form)
// //         setSelectedDay(null); // Clear day selection
// //       } else if (nextStep === STEP_YEAR_SELECT) { // Going back to Year Selection (from Date Selection)
// //         setSelectedMonth(null); // Clear month selection
// //         setSelectedDay(null);  // Clear day selection
// //       } else if (nextStep < STEP_WELCOME) { // Prevent going back further than welcome
// //         return STEP_WELCOME;
// //       }
// //       // Reset selections for Welcome screen if needed (optional, depends on desired UX)
// //       // if (nextStep === STEP_WELCOME) {
// //       //   setSelectedYear(new Date().getFullYear());
// //       //   setSelectedMonth(null);
// //       //   setSelectedDay(null);
// //       // }
// //       return nextStep;
// //     });
// //   };

// //   // --- Selection Handlers ---

// //   const handleStart = () => {
// //     handleNext(); // Move from Welcome to Year Select
// //   };

// //   const handleExport = () => {
// //     alert('Export to Excel - Not implemented yet.');
// //     // Future implementation: generate and download Excel file
// //   };

// //   const handleYearSelect = (year) => {
// //     setSelectedYear(year);
// //     setSelectedMonth(null); // Reset month when year changes
// //     setSelectedDay(null); // Reset day when year changes
// //     handleNext(); // Move from Year Select to Date Select
// //   };

// //   const handleMonthSelect = (month) => {
// //     setSelectedMonth(month);
// //     setSelectedDay(null); // Reset day when month changes
// //     // Don't navigate here, DaySelector appears on the same step
// //   };

// //   const handleDaySelect = (day) => {
// //     setSelectedDay(day);
// //     handleNext(); // Move from Date Select to Form
// //   };

// //   // --- View Mapping (Task 2) ---
// //   // Using useMemo to potentially optimize if component creation was heavy,
// //   // though for simple components like these, it might be negligible.
// //   // It ensures the functions returning JSX are stable unless dependencies change.
// //   const viewMap = useMemo(() => ({
// //     [STEP_WELCOME]: () => (
// //       <WelcomeScreen onStart={handleStart} onExport={handleExport} />
// //     ),
// //     [STEP_YEAR_SELECT]: () => (
// //       // Added a back button here
// //       <div>
// //         <button
// //           onClick={() => setCurrentStep(STEP_WELCOME)} // Go directly back to welcome
// //           className="mb-4 text-blue-400 hover:text-blue-300 text-sm"
// //         > Go Back</button>

// //         <YearSelector onYearSelect={handleYearSelect} currentYear={selectedYear} />
// //       </div>
// //     ),
// //     [STEP_DATE_SELECT]: () => ( // Combined Month/Day View (Task 1)
// //       <div className="flex flex-col md:flex-row gap-4 items-start">
// //         <div className="w-full md:w-1/3">
// //            {/* Back button goes to Year Selection */}
// //            <button
// //              onClick={handleBack} // Use generic back handler
// //              className="mb-2 text-blue-400 hover:text-blue-300 text-sm"
// //            >Go Back</button>
// //            <MonthSelector
// //              selectedYear={selectedYear}
// //              onMonthSelect={handleMonthSelect}
// //              // Optionally pass selectedMonth to highlight the chosen one
// //              selectedMonth={selectedMonth}
// //            />
// //         </div>
// //         <div className="w-full md:w-2/3">
// //            {/* DaySelector appears only after a month is selected */}
// //            {selectedMonth !== null ? (
// //              <DaySelector
// //                selectedYear={selectedYear}
// //                selectedMonth={selectedMonth}
// //                onDaySelect={handleDaySelect}
// //              />
// //            ) : (
// //              <div className="p-4 text-center text-gray-500">
// //                  Select a month to see available days.
// //              </div>
// //            )}
// //         </div>
// //       </div>
// //     ),
// //     [STEP_FORM]: () => (
// //       <TransactionForm
// //         selectedDate={{ year: selectedYear, month: selectedMonth, day: selectedDay }}
// //         onBack={handleBack} // Use generic back handler
// //       />
// //     ),
// //   }), [selectedYear, selectedMonth, selectedDay]);


// //   // Determine which component function to call from the map
// //   const CurrentViewComponent = viewMap[currentStep] || viewMap[STEP_WELCOME]; // Fallback to Welcome

// //   return (
// //     <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
// //       <div className="w-full max-w-4xl">
// //         {/* Render the current view by calling the function from the map */}
// //         {CurrentViewComponent()}
// //       </div>
// //     </div>
// //   );
// // }

// // export default App;



// // src/App.jsx
// // import React, { useState } from 'react';
// // import WelcomeScreen from './components/WelcomeScreen';
// // import YearSelector from './components/YearSelector';
// // import MonthSelector from './components/MonthSelector';
// // import DaySelector from './components/DaySelector';
// // import TransactionForm from './components/TransactionForm';

// // function App() {
// //   const [currentView, setCurrentView] = useState('welcome'); // welcome, year, month, day, form
// //   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year
// //   const [selectedMonth, setSelectedMonth] = useState(null); // 1-12
// //   const [selectedDay, setSelectedDay] = useState(null); // 1-31

// //   const handleStart = () => {
// //     setCurrentView('year');
// //   };

// //   const handleExport = () => {
// //     alert('Export to Excel - Not implemented yet.');
// //     // Future implementation: generate and download Excel file
// //   };

// //   const handleYearSelect = (year) => {
// //     setSelectedYear(year);
// //     setCurrentView('month'); // Move to month selection after year
// //   };

// //   const handleMonthSelect = (month) => {
// //     setSelectedMonth(month);
// //     setCurrentView('day'); // Move to day selection
// //   };

// //   const handleDaySelect = (day) => {
// //     setSelectedDay(day);
// //     setCurrentView('form'); // Move to transaction form
// //   };

// //   const handleBackToMonths = () => {
// //        setSelectedMonth(null); // Reset month
// //        setCurrentView('month');
// //   }
// //    const handleBackToDays = () => {
// //        setSelectedDay(null); // Reset day
// //        setCurrentView('day');
// //   }


// //   // Determine which component to render
// //   const renderView = () => {
// //     switch (currentView) {
// //       case 'year':
// //         // Show Year and Month side-by-side (or sequentially based on interaction)
// //         // For simplicity now, showing Year first, then Month on selection
// //          return <YearSelector onYearSelect={handleYearSelect} currentYear={selectedYear} />;
// //       case 'month':
// //          return <MonthSelector selectedYear={selectedYear} onMonthSelect={handleMonthSelect} />;
// //       case 'day':
// //          // Show Month and Day side-by-side - let's try that layout
// //         return (
// //           <div className="flex flex-col md:flex-row gap-4 items-start">
// //               {/* Added a back button here */}
// //               <div className="w-full md:w-1/3">
// //                    <button onClick={() => setCurrentView('year')} className="mb-2 text-blue-400 hover:text-blue-300 text-sm"></button>
// //                   <MonthSelector selectedYear={selectedYear} onMonthSelect={handleMonthSelect} />
// //               </div>
// //               <div className="w-full md:w-2/3">
// //                    {/* Keep DaySelector, it shows only after month is selected */}
// //                    <DaySelector selectedYear={selectedYear} selectedMonth={selectedMonth} onDaySelect={handleDaySelect} />
// //               </div>
// //           </div>
// //         );
// //       case 'form':
// //         return <TransactionForm selectedDate={{ year: selectedYear, month: selectedMonth, day: selectedDay }} onBack={handleBackToDays} />;
// //       case 'welcome':
// //       default:
// //         return <WelcomeScreen onStart={handleStart} onExport={handleExport} />;
// //     }
// //   };

// //   return (
// //     // Main container with dark background and padding
// //     <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
// //        {/* Render the current view based on state */}
// //       <div className="w-full max-w-4xl"> {/* Max width container */}
// //          {renderView()}
// //       </div>
// //     </div>
// //   );
// // }

// // export default App;
// // src/App.jsx