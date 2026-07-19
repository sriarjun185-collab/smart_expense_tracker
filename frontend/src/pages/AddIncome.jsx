import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUpRight, Calendar, Landmark, AlignLeft, CreditCard, Trash2, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';

const AddIncome = () => {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const sources = ['Salary', 'Freelance', 'Investments', 'Business', 'Gift', 'Refund', 'Other'];

  const fetchIncomes = async () => {
    try {
      setListLoading(true);
      const res = await axios.get('/api/incomes?limit=10&sortBy=newest');
      setIncomes(res.data.incomes || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load recent incomes.');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !source) {
      setErrorMsg('Please specify both amount and source.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await axios.post('/api/incomes', {
        amount: Number(amount),
        source,
        date: new Date(date).toISOString(),
        description
      });

      if (res.data.success) {
        setSuccessMsg('Income logged successfully!');
        setAmount('');
        setSource('');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        fetchIncomes();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to register income.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income record?')) return;
    try {
      const res = await axios.delete(`/api/incomes/${id}`);
      if (res.data.success) {
        setSuccessMsg('Income record removed successfully.');
        fetchIncomes();
      }
    } catch (err) {
      setErrorMsg('Failed to delete income record.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Messages */}
      {errorMsg && <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />}
      {successMsg && <Toast message={successMsg} type="success" onClose={() => setSuccessMsg('')} />}

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          Income Management <ArrowUpRight className="text-emerald-400 w-7 h-7" />
        </h1>
        <p className="text-gray-400 text-sm font-light mt-0.5">
          Log new earnings and view your income sources.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Log Income Form */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 h-fit lg:col-span-1">
          <h2 className="text-base font-bold text-white mb-5">Register Income</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount (INR)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="glass-input pl-8 w-full text-sm font-medium"
                  required
                />
              </div>
            </div>

            {/* Source select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Source</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Landmark className="w-4 h-4" />
                </span>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="glass-input pl-10 w-full text-sm bg-[#0e0f14]"
                  required
                >
                  <option value="" disabled>Select Source</option>
                  {sources.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* If custom source is needed, can double-check with simple input fallback */}
            {source === 'Other' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Specify Custom Source</label>
                <input
                  type="text"
                  placeholder="e.g. Garage Sale"
                  onChange={(e) => setSource(e.target.value)}
                  className="glass-input w-full text-sm"
                  required
                />
              </div>
            )}

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="glass-input pl-10 w-full text-sm"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
              <div className="relative">
                <span className="absolute top-3.5 left-3.5 text-gray-500">
                  <AlignLeft className="w-4 h-4" />
                </span>
                <textarea
                  placeholder="Optional details..."
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input pl-10 w-full text-sm resize-none"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Income'}
            </button>
          </form>
        </div>

        {/* Recent Incomes Table */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 lg:col-span-2">
          <h2 className="text-base font-bold text-white mb-5">Recent Incomes</h2>

          {listLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
          ) : incomes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">
                    <th className="pb-3">Source</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {incomes.map((inc) => (
                    <tr key={inc._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-white truncate max-w-[150px]">{inc.source}</div>
                        {inc.description && (
                          <div className="text-xs text-gray-400 truncate max-w-[150px] mt-0.5">{inc.description}</div>
                        )}
                      </td>
                      <td className="py-3.5 text-gray-400 whitespace-nowrap">
                        {new Date(inc.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 text-right font-bold text-emerald-400 whitespace-nowrap">
                        +₹{inc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => handleDelete(inc._id)}
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
          ) : (
            <p className="text-center text-gray-500 text-sm py-12">No incomes logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddIncome;
