import React, { useState, useEffect } from 'react';

function TransactionForm({ selectedDate, onBack, editTransaction = null, onSaveComplete = null }) {
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('DEBIT'); // CREDIT/DEBIT
  const [transactionType, setTransactionType] = useState('CASH'); // CASH/UPI/CARD
  const [gateway, setGateway] = useState(''); // Gateway options
  const [vendor, setVendor] = useState('Gokhana'); // Default value
  const [category, setCategory] = useState('Personal'); // Primary category
  const [category2, setCategory2] = useState('Food(Compulsory)'); // Secondary category
  const [splitDetails, setSplitDetails] = useState('');
  const [comments, setComments] = useState('');
  const [documents, setDocuments] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [ignore, setIgnore] = useState(false);

  // Load transaction data when editing
  useEffect(() => {
    if (editTransaction) {
      setReason(editTransaction.reason || '');
      setAmount(editTransaction.amount?.toString() || '');
      setMode(editTransaction.mode || 'DEBIT');
      setTransactionType(editTransaction.transaction_type || 'CASH');
      setVendor(editTransaction.vendor || 'Gokhana');
      setCategory(editTransaction.category || 'Personal');
      setCategory2(editTransaction.category2 || 'Food(Compulsory)');
      setSplitDetails(editTransaction.split_details || '');
      setComments(editTransaction.comments || '');
      setDocuments(editTransaction.documents || '');
      setIgnore(editTransaction.ignore || false);

      // Set gateway based on transaction type
      if (editTransaction.transaction_type === 'CASH') {
        setGateway('');
      } else {
        setGateway(editTransaction.gateway || '');
      }
    }
  }, [editTransaction]);

  // Update gateway options based on transaction type
  useEffect(() => {
    if (!editTransaction) {  // Only auto-set gateway if not editing
      if (transactionType === 'CARD') {
        setGateway('CREDIT');
      } else if (transactionType === 'UPI') {
        setGateway('GPay');
      } else {
        setGateway('');
      }
    }
  }, [transactionType, editTransaction]);

  const displayDate = `${String(selectedDate.day).padStart(2, '0')}.${String(selectedDate.month).padStart(2, '0')}.${selectedDate.year}`;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle file upload submission
  const handleFileUpload = async (apiDate) => {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('date', apiDate);
    formData.append('reason', reason);
    formData.append('amount', parseFloat(amount) || 0);
    formData.append('mode', mode);
    formData.append('transaction_type', transactionType);
    formData.append('gateway', transactionType === 'CASH' ? '' : gateway);
    formData.append('vendor', vendor);
    formData.append('category', category);
    formData.append('category2', category2);
    formData.append('split_details', splitDetails || '');
    formData.append('comments', comments || '');
    formData.append('ignore', ignore);
    formData.append('file', documentFile);

    console.log('Submitting to API with file:', documentFile.name);

    // Use the file upload endpoint
    const response = await fetch('http://127.0.0.1:8000/transactions/upload/', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to save transaction with file');
    }

    return response;
  };

  // Handle transaction submission
  const handleTransactionSubmit = async (apiDate) => {
    // Prepare the transaction data
    const transactionData = {
      date: apiDate,
      reason,
      amount: parseFloat(amount) || 0,
      mode,
      transaction_type: transactionType,
      gateway: transactionType === 'CASH' ? '' : gateway,
      vendor,
      category,
      category2,
      split_details: splitDetails || null,
      comments: comments || null,
      documents: documents || null,
      ignore: ignore
    };

    console.log('Submitting to API:', transactionData);

    // Use the regular JSON endpoint
    const response = await fetch('http://127.0.0.1:8000/transactions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to save transaction');
    }

    return response;
  };

  // Handle update transaction
  const handleUpdateTransaction = async (transactionId) => {
    // Prepare the transaction data
    const transactionData = {
      reason,
      amount: parseFloat(amount) || 0,
      mode,
      transaction_type: transactionType,
      gateway: transactionType === 'CASH' ? '' : gateway,
      vendor,
      category,
      category2,
      split_details: splitDetails || null,
      comments: comments || null,
      documents: documents || null,
      ignore: ignore
    };

    console.log('Updating transaction:', transactionData);

    // Use the PUT endpoint
    const response = await fetch(`http://127.0.0.1:8000/transactions/${transactionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update transaction');
    }

    return response;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      let response;

      // Format date for API (YYYY-MM-DD)
      const apiDate = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;

      if (editTransaction) {
        // Update existing transaction
        response = await handleUpdateTransaction(editTransaction.id);
      } else {
        // Create new transaction
        response = documentFile
          ? await handleFileUpload(apiDate)
          : await handleTransactionSubmit(apiDate);
      }

      // Get the saved transaction data from the response
      const savedTransaction = await response.json();
      console.log('Transaction saved:', savedTransaction);

      // If we uploaded a document, show a link to download it
      if (documentFile && !editTransaction) {
        alert(`Transaction saved with document. You can download it from the export screen or directly at: http://127.0.0.1:8000/transactions/${savedTransaction.id}/document`);
      }

      setSuccess(true);

      // If this is an edit, notify the parent component
      if (editTransaction && onSaveComplete) {
        onSaveComplete(savedTransaction);
      } else {
        // Reset form for new transactions
        setReason('');
        setAmount('');
        setMode('DEBIT');
        setTransactionType('CASH');
        setGateway('');
        setVendor('Gokhana');
        setCategory('Personal');
        setCategory2('Food(Compulsory)');
        setSplitDetails('');
        setComments('');
        setDocuments('');
        setDocumentFile(null);
        setIgnore(false);

        setTimeout(() => setSuccess(false), 3000); // Clear success message after 3 seconds

        // Navigate back to welcome screen after successful submission if not editing
        if (!editTransaction) {
          setTimeout(() => {
            if (onSaveComplete) {
              onSaveComplete(savedTransaction);
            } else {
              window.location.href = '/';
            }
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-xl text-gray-100 w-full max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
         <button onClick={onBack} className="text-blue-400 hover:text-blue-300 text-sm">← Back</button>
         <h2 className="text-xl font-semibold text-center flex-grow">
           {editTransaction ? 'Edit Transaction' : `Add Transaction for ${displayDate}`}
         </h2>
         {/* Spacer to balance the back button */}
         <span className="w-12"></span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-1">Reason</label>
            <input
              type="text" id="reason" value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="If credit then funds like 25"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
            <input
              type="number" id="amount" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="25/Deduction..excel"
            />
          </div>
        </div>

        {/* Mode and Transaction Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="mode" className="block text-sm font-medium text-gray-300 mb-1">Mode</label>
            <select
              id="mode" value={mode} onChange={(e) => setMode(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="CREDIT">CREDIT</option>
              <option value="DEBIT">DEBIT</option>
            </select>
          </div>

          <div>
            <label htmlFor="transactionType" className="block text-sm font-medium text-gray-300 mb-1">Transaction Type</label>
            <select
              id="transactionType" value={transactionType} onChange={(e) => setTransactionType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="CASH">CASH</option>
              <option value="UPI">UPI</option>
              <option value="CARD">CARD</option>
            </select>
          </div>
        </div>

        {/* Gateway and Vendor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="gateway" className="block text-sm font-medium text-gray-300 mb-1">Gateway</label>
            {transactionType === 'CASH' ? (
              <div className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-400">
                Cash Payment (No Gateway)
              </div>
            ) : (
              <select
                id="gateway" value={gateway} onChange={(e) => setGateway(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {transactionType === 'CARD' && (
                  <>
                    <option value="CREDIT">CREDIT</option>
                    <option value="DEBIT">DEBIT</option>
                  </>
                )}
                {transactionType === 'UPI' && (
                  <>
                    <option value="GPay">GPay</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="ICICI UPI">ICICI UPI</option>
                    <option value="SBI UPI">SBI UPI</option>
                    <option value="Other UPI">Other UPI</option>
                  </>
                )}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="vendor" className="block text-sm font-medium text-gray-300 mb-1">Vendor</label>
            <select
              id="vendor" value={vendor} onChange={(e) => setVendor(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Gokhana">Gokhana</option>
              <option value="vending machine">vending machine</option>
              <option value="Zomato/Swiggy">Zomato/Swiggy</option>
              <option value="Online Ecommerce">Online Ecommerce</option>
              <option value="Flipkart/Amazon/Insta/BigBasket">Flipkart/Amazon/Insta/BigBasket</option>
              <option value="Shop">Shop</option>
              <option value="Person">Person</option>
              <option value="Cab/Auto">Cab/Auto</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select
              id="category" value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Personal">Personal</option>
              <option value="Split">Split</option>
            </select>
          </div>

          <div>
            <label htmlFor="category2" className="block text-sm font-medium text-gray-300 mb-1">Category-2</label>
            <select
              id="category2" value={category2} onChange={(e) => setCategory2(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Food(Compulsory)">Food(Compulsory)</option>
              <option value="Vegetables/Groceries">Vegetables/Groceries</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Food(Optional)">Food(Optional)</option>
              <option value="Education">Education</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="splitDetails" className="block text-sm font-medium text-gray-300 mb-1">Split Details</label>
            <textarea
              id="splitDetails" rows="2" value={splitDetails} onChange={(e) => setSplitDetails(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-300 mb-1">Comments</label>
            <textarea
              id="comments" rows="2" value={comments} onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="documents" className="block text-sm font-medium text-gray-300 mb-1">
              Documents <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="documents"
                value={documents}
                onChange={(e) => setDocuments(e.target.value)}
                placeholder="Document name or reference"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-300"
              />
              <input
                type="file"
                id="documentFile"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setDocumentFile(file);
                    setDocuments(file.name);
                  }
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById('documentFile').click()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Browse
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {documentFile ? `Selected file: ${documentFile.name}` : "Enter document name or upload a file (PDF, JPG, PNG)"}
            </p>
          </div>

          <div className="flex items-center mt-8">
            <div className="flex items-center">
              <input
                id="ignore"
                type="checkbox"
                checked={ignore}
                onChange={(e) => setIgnore(e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
              />
              <label htmlFor="ignore" className="ml-2 block text-sm font-medium text-gray-300">
                Ignore in calculations
              </label>
            </div>
            <div className="ml-2">
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                Will show as \{amount} in exports
              </span>
            </div>
          </div>
        </div>
        {error && (
          <div className="p-3 bg-red-800 text-white rounded-md text-sm">
            Error: {error}
            <br></br>
            Reason-1: May be not selected the required
            <br></br>
            Reason-2: May be not selected the date
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-800 text-white rounded-md text-sm">
            Transaction saved successfully!
          </div>
        )}

        <div className="pt-2 text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-2 rounded text-white font-semibold transition duration-200 ${
              isSubmitting
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSubmitting ? 'Saving...' : editTransaction ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;