import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowDownRight, Calendar, Tag, AlignLeft, AlertTriangle, Trash2, Loader2, Info } from 'lucide-react';
import Toast from '../components/Toast';

const AddExpense = () => {
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  const [expenses, setExpenses] = useState([]);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const categories = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Travel', 'Education', 'Shopping', 'Healthcare', 'Other'];

  const fetchExpensesAndMonthlySum = async () => {
    try {
      setListLoading(true);
      const res = await axios.get('/api/expenses?limit=10&sortBy=newest');
      const allExpenses = res.data.expenses || [];
      setExpenses(allExpenses);

      // Fetch all to compute actual monthly spending sum
      const allRes = await axios.get('/api/expenses?limit=1000');
      const allList = allRes.data.expenses || [];
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const monthlyExpSum = allList
        .filter(e => {
          const d = new Date(e.date);
          return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        })
        .reduce((acc, e) => acc + e.amount, 0);

      setMonthlyExpense(monthlyExpSum);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load recent expenses.');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndMonthlySum();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !category) {
      setErrorMsg('Please specify title, amount, and category.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await axios.post('/api/expenses', {
        title,
        amount: Number(amount),
        category,
        date: new Date(date).toISOString(),
        description
      });

      if (res.data.success) {
        setSuccessMsg('Expense logged successfully!');
        setTitle('');
        setAmount('');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        fetchExpensesAndMonthlySum();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to register expense.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const res = await axios.delete(`/api/expenses/${id}`);
      if (res.data.success) {
        setSuccessMsg('Expense record removed successfully.');
        fetchExpensesAndMonthlySum();
      }
    } catch (err) {
      setErrorMsg('Failed to delete expense record.');
    }
  };

  // Real-time limit check
  const budgetLimit = user?.monthlyBudgetLimit || 0;
  const newExpenseAmount = Number(amount) || 0;
  const projectedMonthlyExpense = monthlyExpense + newExpenseAmount;
  const isThresholdCrossed = budgetLimit > 0 && projectedMonthlyExpense > budgetLimit;
  const crossedAmount = projectedMonthlyExpense - budgetLimit;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Messages */}
      {errorMsg && <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} />}
      {successMsg && <Toast message={successMsg} type="success" onClose={() => setSuccessMsg('')} />}

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          Expense Management <ArrowDownRight className="text-rose-400 w-7 h-7" />
        </h1>
        <p className="text-gray-400 text-sm font-light mt-0.5">
          Log new expenditures and monitor real-time limits.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Log Expense Form */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 h-fit lg:col-span-1">
          <h2 className="text-base font-bold text-white mb-5">Register Expense</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</label>
              <input
                type="text"
                placeholder="e.g. Electricity Bill"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input w-full text-sm font-medium"
                required
              />
            </div>

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
              
              {/* Real-time Budget Limit Alert */}
              {isThresholdCrossed && (
                <div className="mt-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Warning: Logging this will push your monthly spending to ₹{projectedMonthlyExpense.toLocaleString('en-IN')}, 
                    exceeding your budget limit of ₹{budgetLimit.toLocaleString('en-IN')} by ₹{crossedAmount.toLocaleString('en-IN')}!
                  </span>
                </div>
              )}
            </div>

            {/* Category select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Tag className="w-4 h-4" />
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="glass-input pl-10 w-full text-sm bg-[#0e0f14]"
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Expense'}
            </button>
          </form>
        </div>

        {/* Recent Expenses Table */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 lg:col-span-2">
          <h2 className="text-base font-bold text-white mb-5">Recent Expenses</h2>

          {listLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
          ) : expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {expenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-white truncate max-w-[150px]">{exp.title}</div>
                        {exp.description && (
                          <div className="text-xs text-gray-400 truncate max-w-[150px] mt-0.5">{exp.description}</div>
                        )}
                      </td>
                      <td className="py-3.5 text-gray-400 whitespace-nowrap">
                        {new Date(exp.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 text-gray-300">
                        <span className="inline-flex items-center rounded-md border border-white/5 bg-white/5 px-2 py-0.5 text-xs font-medium">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-rose-400 whitespace-nowrap">
                        -₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => handleDelete(exp._id)}
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
            <p className="text-center text-gray-500 text-sm py-12">No expenses logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
