import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Calendar, 
  Filter, 
  Download, 
  Printer, 
  Trash2, 
  Loader2, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import Toast from '../components/Toast';

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('all'); // all, income, expense
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, amount_desc, amount_asc
  const [month, setMonth] = useState(''); // 0-11
  const [year, setYear] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const categories = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Travel', 'Education', 'Shopping', 'Healthcare', 'Other'];
  
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [incRes, expRes] = await Promise.all([
        axios.get('/api/incomes?limit=1000'),
        axios.get('/api/expenses?limit=1000')
      ]);

      const incList = (incRes.data.incomes || []).map(i => ({
        ...i,
        type: 'income',
        title: i.source,
        category: 'Income'
      }));
      
      const expList = (expRes.data.expenses || []).map(e => ({
        ...e,
        type: 'expense'
      }));

      // Combine and store
      const combined = [...incList, ...expList];
      setAllTransactions(combined);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to fetch transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter & Sort Logic
  useEffect(() => {
    let result = [...allTransactions];

    // Filter by type
    if (type !== 'all') {
      result = result.filter(tx => tx.type === type);
    }

    // Filter by search query (title or description)
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(tx => 
        (tx.title && tx.title.toLowerCase().includes(q)) || 
        (tx.description && tx.description.toLowerCase().includes(q))
      );
    }

    // Filter by category (only for expenses)
    if (category) {
      result = result.filter(tx => tx.category === category);
    }

    // Filter by Month
    if (month !== '') {
      result = result.filter(tx => new Date(tx.date).getMonth() === Number(month));
    }

    // Filter by Year
    if (year !== '') {
      result = result.filter(tx => new Date(tx.date).getFullYear() === Number(year));
    }

    // Filter by Date Range
    if (startDate) {
      const start = new Date(startDate);
      result = result.filter(tx => new Date(tx.date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      result = result.filter(tx => new Date(tx.date) <= end);
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'amount_desc') {
      result.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount_asc') {
      result.sort((a, b) => a.amount - b.amount);
    }

    setFilteredTransactions(result);
    setCurrentPage(1); // reset page
  }, [allTransactions, search, category, type, startDate, endDate, sortBy, month, year]);

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handleDelete = async (id, txType) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      const endpoint = txType === 'income' ? `/api/incomes/${id}` : `/api/expenses/${id}`;
      const res = await axios.delete(endpoint);
      if (res.data.success) {
        setSuccessMsg('Record deleted successfully.');
        fetchAllData();
      }
    } catch (err) {
      setErrorMsg('Failed to delete transaction.');
    }
  };

  // CSV Exporter
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      setErrorMsg('No data to export.');
      return;
    }
    const headers = ['Type', 'Title/Source', 'Amount (INR)', 'Category', 'Date', 'Description'];
    const rows = filteredTransactions.map(tx => [
      tx.type.toUpperCase(),
      tx.title,
      tx.amount,
      tx.category,
      new Date(tx.date).toLocaleDateString('en-IN'),
      tx.description || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMsg('CSV exported successfully!');
  };

  // PDF / Print Exporter
  const exportToPDF = () => {
    if (filteredTransactions.length === 0) {
      setErrorMsg('No data to export.');
      return;
    }

    const printWindow = window.open('', '_blank');
    const tableRows = filteredTransactions.map(tx => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; text-transform: uppercase; font-weight: bold; color: ${tx.type === 'income' ? '#10b981' : '#f43f5e'}">${tx.type}</td>
        <td style="padding: 10px;">${tx.title}</td>
        <td style="padding: 10px; font-weight: bold;">₹${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 10px;">${tx.category}</td>
        <td style="padding: 10px;">${new Date(tx.date).toLocaleDateString('en-IN')}</td>
        <td style="padding: 10px; font-style: italic; color: #555;">${tx.description || '-'}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Transactions Report</title>
          <style>
            body { font-family: 'Outfit', sans-serif; padding: 20px; color: #333; }
            h1 { text-align: center; color: #111; margin-bottom: 5px; }
            p { text-align: center; color: #666; margin-top: 0; margin-bottom: 30px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f3f4f6; padding: 12px 10px; text-align: left; border-bottom: 2px solid #ddd; font-size: 12px; text-transform: uppercase; color: #666; }
            td { font-size: 13px; }
          </style>
        </head>
        <body>
          <h1>Smart Expense Tracker Report</h1>
          <p>Generated on ${new Date().toLocaleDateString('en-IN')} | Total Records: ${filteredTransactions.length}</p>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setSuccessMsg('PDF printer triggered successfully!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Alert Messages */}
      {errorMsg && <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />}
      {successMsg && <Toast message={successMsg} type="success" onClose={() => setSuccessMsg('')} />}

      {/* Header with Export Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Transaction History
          </h1>
          <p className="text-gray-400 text-sm font-light mt-0.5">
            View, search, filter, and export all recorded transactions.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button 
            onClick={fetchAllData}
            className="btn-secondary p-3 rounded-xl text-gray-400 hover:text-white"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={exportToCSV}
            className="btn-secondary px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
          >
            <Download className="w-4.5 h-4.5 text-primary-400" />
            CSV
          </button>

          <button
            onClick={exportToPDF}
            className="btn-secondary px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
          >
            <Printer className="w-4.5 h-4.5 text-accent-cyan" />
            PDF Report
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          <Filter className="w-4 h-4 text-primary-400" />
          <span>Filters & Search</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search query */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by title/notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input pl-9 w-full text-xs"
            />
          </div>

          {/* Type dropdown */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="glass-input w-full text-xs bg-[#0e0f14]"
          >
            <option value="all">All Types</option>
            <option value="income">Earnings (Income)</option>
            <option value="expense">Spendings (Expenses)</option>
          </select>

          {/* Category dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={type === 'income'}
            className="glass-input w-full text-xs bg-[#0e0f14] disabled:opacity-50"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sort By dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="glass-input w-full text-xs bg-[#0e0f14]"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="oldest">Sort by: Oldest</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
        </div>

        {/* Date Ranges and specific Months/Years */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-1">
          {/* Month Filter */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="glass-input w-full text-xs bg-[#0e0f14]"
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="glass-input w-full text-xs bg-[#0e0f14]"
          >
            <option value="">All Years</option>
            {[2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Start Date */}
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="glass-input w-full text-xs pr-2"
              placeholder="Start Date"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="glass-input w-full text-xs pr-2"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Grid List Table */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="mt-4 text-sm text-gray-500">Retrieving ledger entries...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">
                    <th className="pb-3">Transaction</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {currentItems.map((tx) => (
                    <tr key={tx._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-semibold text-white truncate max-w-[200px] sm:max-w-[300px]">
                          {tx.title}
                        </div>
                        {tx.description && (
                          <div className="text-xs text-gray-400 truncate max-w-[200px] sm:max-w-[300px] mt-0.5">
                            {tx.description}
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-gray-400 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 text-gray-300">
                        <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                          tx.type === 'income'
                            ? 'border-emerald-500/10 bg-emerald-500/5 text-emerald-400'
                            : 'border-white/5 bg-white/5 text-gray-300'
                        }`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-4 text-right font-bold whitespace-nowrap">
                        <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                          {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleDelete(tx._id, tx.type)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-rose-500/15 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-xs text-gray-400 font-light">
                  Showing <span className="font-semibold text-white">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-semibold text-white">
                    {Math.min(indexOfLastItem, filteredTransactions.length)}
                  </span>{' '}
                  of <span className="font-semibold text-white">{filteredTransactions.length}</span> records
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary p-2 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-8 w-8 text-xs font-semibold rounded-lg flex items-center justify-center border transition ${
                        currentPage === i + 1
                          ? 'bg-primary-500/10 border-primary-500/30 text-primary-300'
                          : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary p-2 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-sm py-16">No transactions match your search/filter parameters.</p>
        )}
      </div>
    </div>
  );
};

export default Transactions;
