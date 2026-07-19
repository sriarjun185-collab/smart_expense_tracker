import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  
  const [categoryData, setCategoryData] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all incomes and expenses for dashboard calculations
        const [incRes, expRes] = await Promise.all([
          axios.get('/api/incomes?limit=1000'),
          axios.get('/api/expenses?limit=1000')
        ]);

        const incList = incRes.data.incomes || [];
        const expList = expRes.data.expenses || [];

        setIncomes(incList);
        setExpenses(expList);

        // --- STATS CALCULATIONS ---
        const totalInc = incList.reduce((acc, item) => acc + item.amount, 0);
        const totalExp = expList.reduce((acc, item) => acc + item.amount, 0);
        setTotalIncome(totalInc);
        setTotalExpense(totalExp);
        setCurrentBalance(totalInc - totalExp);

        // Monthly calculations (current calendar month)
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const monthlyExpSum = expList
          .filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
          })
          .reduce((acc, e) => acc + e.amount, 0);

        setMonthlyExpense(monthlyExpSum);

        // Category splits for Expenses Pie Chart
        const categories = {};
        expList.forEach(e => {
          const cat = e.category || 'Other';
          categories[cat] = (categories[cat] || 0) + e.amount;
        });
        setCategoryData(categories);

        // Mix and sort recent transactions
        const mixed = [
          ...incList.map(i => ({ ...i, type: 'income', title: i.source })),
          ...expList.map(e => ({ ...e, type: 'expense' }))
        ];
        mixed.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentTransactions(mixed.slice(0, 5));

      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="mt-4 text-gray-400 font-medium text-sm">Aggregating metrics...</p>
      </div>
    );
  }

  // --- PIE CHART CONFIG ---
  const pieLabels = Object.keys(categoryData);
  const pieValues = Object.values(categoryData);

  const pieChartData = {
    labels: pieLabels.length > 0 ? pieLabels : ['No Expenses Yet'],
    datasets: [
      {
        data: pieValues.length > 0 ? pieValues : [1],
        backgroundColor: pieValues.length > 0 ? [
          'rgba(139, 92, 246, 0.65)', // primary violet
          'rgba(6, 182, 212, 0.65)',  // cyan
          'rgba(244, 63, 94, 0.65)',  // rose
          'rgba(245, 158, 11, 0.65)',  // amber
          'rgba(16, 185, 129, 0.65)',  // emerald
          'rgba(236, 72, 153, 0.65)'   // pink
        ] : ['rgba(255, 255, 255, 0.08)'],
        borderColor: pieValues.length > 0 ? [
          '#8b5cf6', '#06b6d4', '#f43f5e', '#f59e0b', '#10b981', '#ec4899'
        ] : ['rgba(255, 255, 255, 0.1)'],
        borderWidth: 1.5,
      },
    ],
  };

  const pieChartOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#9ca3af',
          font: { family: 'Outfit', size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (pieValues.length === 0) return ' No data recorded';
            const value = context.raw;
            return ` ₹${Number(value).toLocaleString('en-IN')}`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  // --- BAR CHART CONFIG (INCOME VS EXPENSE) ---
  const barChartData = {
    labels: ['Total Metrics'],
    datasets: [
      {
        label: 'Income',
        data: [totalIncome],
        backgroundColor: 'rgba(16, 185, 129, 0.65)',
        borderColor: '#10b981',
        borderWidth: 1.5,
        borderRadius: 8
      },
      {
        label: 'Expense',
        data: [totalExpense],
        backgroundColor: 'rgba(244, 63, 94, 0.65)',
        borderColor: '#f43f5e',
        borderWidth: 1.5,
        borderRadius: 8
      }
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9ca3af',
          font: { family: 'Outfit', size: 11 }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af' }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#9ca3af' }
      }
    }
  };

  // Check budget warnings
  const budgetLimit = user?.monthlyBudgetLimit || 0;
  const isBudgetExceeded = budgetLimit > 0 && monthlyExpense > budgetLimit;
  const budgetProgress = budgetLimit > 0 ? (monthlyExpense / budgetLimit) * 100 : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Hi, {user?.name || 'User'} <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-gray-400 text-sm font-light mt-0.5">
            Here's your financial status overview for this month.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-400 self-start md:self-center">
          <Calendar className="w-4 h-4 text-primary-400" />
          <span>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Budget Limit Warnings */}
      {budgetLimit > 0 && (
        <div className={`glass-card rounded-2xl border p-5 ${
          isBudgetExceeded 
            ? 'border-rose-500/20 bg-rose-500/5 shadow-glow-rose' 
            : 'border-white/5 bg-white/5'
        }`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className={`rounded-xl p-2.5 mt-0.5 ${
                isBudgetExceeded 
                  ? 'bg-rose-500/10 text-rose-400' 
                  : 'bg-primary-500/10 text-primary-400'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isBudgetExceeded ? 'Monthly Budget Threshold Exceeded!' : 'Monthly Budget Goal Tracker'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  You spent <span className="font-semibold text-white">₹{monthlyExpense.toLocaleString('en-IN')}</span> of your 
                  <span className="font-semibold text-white"> ₹{budgetLimit.toLocaleString('en-IN')}</span> limit.
                </p>
              </div>
            </div>
            
            <div className="text-right flex-shrink-0">
              <span className={`text-sm font-bold ${
                isBudgetExceeded ? 'text-rose-400' : 'text-primary-400'
              }`}>
                {budgetProgress.toFixed(0)}% Used
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <div 
              style={{ width: `${Math.min(budgetProgress, 100)}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isBudgetExceeded 
                  ? 'bg-gradient-to-r from-rose-500 to-orange-500' 
                  : 'bg-gradient-to-r from-primary-500 to-accent-cyan'
              }`}
            />
          </div>
        </div>
      )}

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Net Balance */}
        <div className="glass-card rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Net Balance</span>
            <div className="rounded-xl bg-primary-500/10 p-2 text-primary-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <span className={`text-[10px] font-semibold flex items-center gap-1 mt-2.5 ${
              currentBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {currentBalance >= 0 ? (
                <><TrendingUp className="w-3.5 h-3.5" /> Balance is in surplus</>
              ) : (
                <><TrendingDown className="w-3.5 h-3.5" /> Deficit: Incurring debt</>
              )}
            </span>
          </div>
        </div>

        {/* Total Income */}
        <div className="glass-card rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Income</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-emerald-400">
              ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-gray-500 mt-2.5">
              Accumulated earnings from all logged sources
            </p>
          </div>
        </div>

        {/* Total Expense */}
        <div className="glass-card rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Expense</span>
            <div className="rounded-xl bg-rose-500/10 p-2 text-rose-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-rose-400">
              ₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-gray-500 mt-2.5">
              Sum of all registered expenses since account creation
            </p>
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="glass-card rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Spent This Month</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              ₹{monthlyExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-gray-500 mt-2.5">
              Total spending recorded in {new Date().toLocaleString('default', { month: 'long' })}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Category Split Chart (Pie) */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 lg:col-span-3 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Expense splits by Category</h3>
            <p className="text-xs text-gray-400 mt-0.5">Visualize where you spend the most.</p>
          </div>
          <div className="relative h-64 mt-6 flex items-center justify-center">
            {pieLabels.length > 0 ? (
              <Pie data={pieChartData} options={pieChartOptions} />
            ) : (
              <div className="text-center">
                <p className="text-gray-500 text-sm">No expenses logged to chart yet</p>
                <Link to="/add-expense" className="text-primary-400 hover:underline text-xs mt-2 inline-block font-semibold">
                  Add Expense
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Overall Bar Chart */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Financial Compare</h3>
            <p className="text-xs text-gray-400 mt-0.5">Income vs Expenses ratio.</p>
          </div>
          <div className="relative h-64 mt-6">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
            <p className="text-xs text-gray-400 mt-0.5">Your latest 5 financial activities.</p>
          </div>
          <Link to="/transactions" className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1 hover:underline">
            View All History
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentTransactions.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">
                  <th className="pb-3">Details</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-white truncate max-w-[180px]">{tx.title}</div>
                      {tx.description && (
                        <div className="text-xs text-gray-400 truncate max-w-[180px] mt-0.5">{tx.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 text-gray-400 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 text-gray-300">
                      <span className="inline-flex items-center rounded-md border border-white/5 bg-white/5 px-2 py-0.5 text-xs font-medium">
                        {tx.type === 'income' ? 'Earnings' : tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-bold whitespace-nowrap">
                      <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No transactions logged yet.</p>
              <div className="flex gap-4 justify-center mt-3">
                <Link to="/add-income" className="text-xs font-bold text-emerald-400 hover:underline">
                  + Add Income
                </Link>
                <Link to="/add-expense" className="text-xs font-bold text-rose-400 hover:underline">
                  + Add Expense
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
