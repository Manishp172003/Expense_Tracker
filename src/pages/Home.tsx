/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Expense } from "../types";
import { ExpenseService } from "../services/ExpenseService";
import ExpenseList from "../components/ExpenseList";
import {
  IndianRupee,
  Coins,
  TrendingUp,
  CalendarRange,
  ArrowUpRight,
  TrendingDown,
  PlusCircle,
  PiggyBank,
  AlertCircle,
  HelpCircle,
  Sparkles
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  CartesianGrid
} from "recharts";

// Category color palettes mapping
const CATEGORY_COLORS: Record<string, string> = {
  Food: "#f43f5e",          // Rose 500
  Entertainment: "#a855f7", // Purple 500
  Utilities: "#f59e0b",     // Amber 500
  Transport: "#3b82f6",     // Blue 500
  Shopping: "#10b981",      // Emerald 500
  Health: "#14b8a6",        // Teal 500
  Other: "#71717a"          // Zinc 500
};

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  // Sync dark mode dynamically via MutationObserver
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Load expenses on mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await ExpenseService.getAllExpenses();
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch expenses. Please make sure the backend is active.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this expense record?")) {
      try {
        await ExpenseService.deleteExpense(id);
        // Optimistic state update
        setExpenses((prev) => prev.filter((exp) => exp.id !== id));
      } catch (err) {
        alert("Failed to delete the expense. Please try again.");
        console.error(err);
      }
    }
  };

  // 1. Calculations: Total spends
  const totalSpend = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  // 2. Calculations: Current month spends (June 2026 based on metadata)
  const currentMonthSpends = useMemo(() => {
    const currentMonthPrefix = "2026-06"; // Target current metadata time
    return expenses
      .filter((exp) => exp.date.startsWith(currentMonthPrefix))
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  // 3. Calculations: Top Spending Category
  const topCategoryInfo = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    let topCat = "N/A";
    let maxAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > maxAmount) {
        maxAmount = amt;
        topCat = cat;
      }
    });

    return { category: topCat, amount: maxAmount };
  }, [expenses]);

  // 4. Calculations: Average Expense
  const averageExpense = useMemo(() => {
    if (expenses.length === 0) return 0;
    return totalSpend / expenses.length;
  }, [expenses, totalSpend]);

  // 5. Chart Data: Category Distribution
  const pieChartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value
    }));
  }, [expenses]);

  // 6. Chart Data: Monthly Spending Timeline (Over last few months)
  const barChartData = useMemo(() => {
    const monthTotals: Record<string, number> = {};
    
    expenses.forEach((exp) => {
      const monthStr = exp.date.substring(0, 7); // e.g., "2026-06"
      monthTotals[monthStr] = (monthTotals[monthStr] || 0) + exp.amount;
    });

    // Format month labels nicely, sort them oldest to newest
    return Object.entries(monthTotals)
      .map(([key, value]) => {
        const [year, month] = key.split("-");
        const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
        const name = dateObj.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        return { key, name, amount: value };
      })
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [expenses]);

  // Currency Formatter Utility
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Custom tooltips for Recharts with consistent styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900/95 dark:bg-zinc-950/95 text-zinc-100 border border-zinc-800 p-3 rounded-xl shadow-lg font-sans">
          <p className="text-xs font-semibold text-zinc-400 mb-1">{payload[0].name}</p>
          <p className="text-sm font-bold font-mono text-indigo-300">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]" id="loading-container">
        <svg className="animate-spin h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading your transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 px-4" id="error-container">
        <div className="w-14 h-14 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50 mb-2">Backend Connection Error</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">{error}</p>
        <button
          onClick={fetchExpenses}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="home-page">
      {/* Welcome & Quick Action Header (Hidden in Print Mode) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-1.5 text-sm font-semibold tracking-wide uppercase">
            <Sparkles className="h-4 w-4" />
            <span>Smart Financial Dashboard</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-50">
            Keep Track of Every Rupee
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Analyze, visualize, and control your personal spending patterns seamlessly.
          </p>
        </div>

        <div>
          <Link
            to="/add"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-medium text-sm shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 cursor-pointer"
            id="btn-add-expense-hero"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Add New Expense</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards">
        {/* Card 1: Total Spending */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
              Total Spending
            </span>
            <span className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100 block">
              {formatCurrency(totalSpend)}
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              All transactions recorded
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Coins className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Current Month Spend (June 2026) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
              June 2026 Spending
            </span>
            <span className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100 block">
              {formatCurrency(currentMonthSpends)}
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Current reporting month
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
            <CalendarRange className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Top Category */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
              Top Category
            </span>
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 block truncate max-w-[150px]" title={topCategoryInfo.category}>
              {topCategoryInfo.category}
            </span>
            <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
              {topCategoryInfo.amount > 0 ? formatCurrency(topCategoryInfo.amount) : "₹0"} spent
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Average Expense */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
              Average Transaction
            </span>
            <span className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100 block">
              {formatCurrency(averageExpense)}
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Per recorded expense
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <PiggyBank className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Charts Visualization Section */}
      {expenses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="charts-visualizations">
          {/* Pie Chart Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-display font-bold text-lg text-zinc-800 dark:text-zinc-200" id="pie-chart-title">
                Category-wise Allocation
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Percentage breakdown of expenses across spending categories.
              </p>
            </div>
            
            <div className="h-72 w-full flex items-center justify-center">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS["Other"]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">No category breakdown available.</p>
              )}
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-display font-bold text-lg text-zinc-800 dark:text-zinc-200" id="bar-chart-title">
                Monthly Spending Timeline
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Trends of aggregate spending recorded month by month.
              </p>
            </div>

            <div className="h-72 w-full">
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#27272a" : "#eaeaea"} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: isDarkMode ? "#a1a1aa" : "#71717a", fontSize: 11, fontWeight: 500 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: isDarkMode ? "#a1a1aa" : "#71717a", fontSize: 11, fontWeight: 500 }}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                      {barChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill="#4f46e5" // Primary Indigo
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">No timeline trends available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Expense List Operations Section */}
      <div className="pt-2">
        <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
      </div>
    </div>
  );
}
