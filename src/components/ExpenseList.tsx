/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Expense, Category } from "../types";
import {
  Search,
  Filter,
  Calendar,
  Tag,
  Trash2,
  Edit2,
  ArrowUpDown,
  Download,
  Printer,
  ChevronDown,
  X,
  UtensilsCrossed,
  Film,
  Lightbulb,
  Car,
  ShoppingBag,
  HeartPulse,
  DollarSign,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: number) => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Food: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
    icon: <UtensilsCrossed className="h-4 w-4" />
  },
  Entertainment: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30",
    icon: <Film className="h-4 w-4" />
  },
  Utilities: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
    icon: <Lightbulb className="h-4 w-4" />
  },
  Transport: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
    icon: <Car className="h-4 w-4" />
  },
  Shopping: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    icon: <ShoppingBag className="h-4 w-4" />
  },
  Health: {
    bg: "bg-teal-50 dark:bg-teal-950/30",
    text: "text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/30",
    icon: <HeartPulse className="h-4 w-4" />
  },
  Other: {
    bg: "bg-zinc-50 dark:bg-zinc-800/50",
    text: "text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-700/80",
    icon: <Briefcase className="h-4 w-4" />
  }
};

export default function ExpenseList({ expenses, onDeleteExpense }: ExpenseListProps) {
  // Filter and Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "">("");
  const [selectedMonth, setSelectedMonth] = useState(""); // YYYY-MM format
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");

  // Dynamically compute months represented in our expenses for filtering
  const monthsList = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach((exp) => {
      if (exp.date) {
        months.add(exp.date.substring(0, 7)); // Get "YYYY-MM"
      }
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a)); // Newest first
  }, [expenses]);

  // Format month label (e.g. "2026-06" -> "June 2026")
  const formatMonthLabel = (yearMonthStr: string) => {
    const [year, month] = yearMonthStr.split("-");
    const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? exp.category === selectedCategory : true;
        const matchesMonth = selectedMonth ? exp.date.startsWith(selectedMonth) : true;
        return matchesSearch && matchesCategory && matchesMonth;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortBy === "date-asc") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortBy === "amount-desc") {
          return b.amount - a.amount;
        } else if (sortBy === "amount-asc") {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [expenses, searchTerm, selectedCategory, selectedMonth, sortBy]);

  // Clear all active filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedMonth("");
    setSortBy("date-desc");
  };

  // Export as CSV (Excel Friendly)
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) return;

    const headers = ["ID", "Title", "Amount (INR)", "Category", "Date"];
    const csvRows = [
      headers.join(","),
      ...filteredExpenses.map((exp) =>
        [
          exp.id,
          `"${exp.title.replace(/"/g, '""')}"`, // escape quotes
          exp.amount,
          exp.category,
          exp.date
        ].join(",")
      )
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF using native printing styled for papers
  const handlePrintPDF = () => {
    window.print();
  };

  // Helper to format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6" id="expense-list-container">
      {/* Search and Filters Card (Hidden in Print View via class 'print:hidden') */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs print:hidden">
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between lg:space-x-4">
          
          {/* Left Column: Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search expenses by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
              id="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right Column: Multi-filters */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Category || "")}
                className="appearance-none pl-9 pr-8 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 focus:outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
                id="filter-category"
              >
                <option value="">All Categories</option>
                {Object.keys(CATEGORY_STYLES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
                <Tag className="h-4 w-4" />
              </div>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>

            {/* Month Filter */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 focus:outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
                id="filter-month"
              >
                <option value="">All Months</option>
                {monthsList.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthLabel(m)}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>

            {/* Sorting Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-9 pr-8 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 focus:outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
                id="sort-select"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </select>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
                <ArrowUpDown className="h-4 w-4" />
              </div>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>

            {/* Reset Filters Trigger */}
            {(searchTerm || selectedCategory || selectedMonth || sortBy !== "date-desc") && (
              <button
                onClick={handleClearFilters}
                className="p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200 flex items-center justify-center border border-transparent hover:border-red-100 dark:hover:border-red-900/30 cursor-pointer"
                title="Clear Filters"
                id="btn-clear-filters"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expenses Count, Actions, and Layout Container */}
      <div className="space-y-4">
        {/* Results Header */}
        <div className="flex items-center justify-between print:mb-6">
          <div className="flex items-baseline space-x-2">
            <h3 className="font-display font-bold text-lg text-zinc-800 dark:text-zinc-200" id="results-title">
              Transactions
            </h3>
            <span className="text-sm font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full" id="results-count">
              {filteredExpenses.length} of {expenses.length}
            </span>
          </div>

          {/* Export Panel (Hidden in printing) */}
          {filteredExpenses.length > 0 && (
            <div className="flex items-center space-x-2 print:hidden">
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
                id="btn-export-excel"
              >
                <Download className="h-3.5 w-3.5 text-zinc-500" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={handlePrintPDF}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                id="btn-print-pdf"
              >
                <Printer className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>Print PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Expense Grid / Table */}
        {filteredExpenses.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center" id="empty-state">
            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <Search className="h-8 w-8" />
            </div>
            <h4 className="font-display font-bold text-zinc-900 dark:text-zinc-100 text-lg mb-1">
              No expenses match your filters
            </h4>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto text-sm">
              Try adjusting your keywords, categories, or select a different month range to view transactions.
            </p>
            {(searchTerm || selectedCategory || selectedMonth) && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl cursor-pointer transition-colors inline-flex items-center space-x-2"
                id="btn-empty-clear"
              >
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            {/* Desktop View Table: Shown on screen md+ */}
            <div className="hidden md:block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs print:border-none print:shadow-none">
              <table className="w-full text-left border-collapse" id="expenses-desktop-table">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/30 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-semibold tracking-wider uppercase">
                    <th className="py-4 px-6">Expense Title</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-6 text-right">Amount</th>
                    <th className="py-4 px-6 text-center print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  <AnimatePresence initial={false}>
                    {filteredExpenses.map((exp, idx) => {
                      const catStyle = CATEGORY_STYLES[exp.category] || CATEGORY_STYLES["Other"];
                      return (
                        <motion.tr
                          key={exp.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15, delay: Math.min(idx * 0.03, 0.3) }}
                          className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors duration-150 group"
                          id={`expense-row-${exp.id}`}
                        >
                          {/* Title */}
                          <td className="py-4 px-6 font-medium text-zinc-900 dark:text-zinc-100">
                            <span className="line-clamp-2 leading-relaxed" title={exp.title}>
                              {exp.title}
                            </span>
                          </td>

                          {/* Category Badge */}
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${catStyle.bg} ${catStyle.text}`}>
                              {catStyle.icon}
                              <span>{exp.category}</span>
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-4 text-sm text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                            {new Date(exp.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })}
                          </td>

                          {/* Amount */}
                          <td className="py-4 px-6 text-right font-mono font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap text-md">
                            {formatCurrency(exp.amount)}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-center print:hidden">
                            <div className="flex items-center justify-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <Link
                                to={`/edit/${exp.id}`}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-zinc-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/40 transition-colors duration-150"
                                title="Edit Expense"
                                id={`btn-edit-${exp.id}`}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => onDeleteExpense(exp.id)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-950/40 transition-colors duration-150 cursor-pointer"
                                title="Delete Expense"
                                id={`btn-delete-${exp.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile View Cards: Shown on screens below md */}
            <div className="grid grid-cols-1 gap-4 md:hidden" id="expenses-mobile-cards">
              <AnimatePresence initial={false}>
                {filteredExpenses.map((exp, idx) => {
                  const catStyle = CATEGORY_STYLES[exp.category] || CATEGORY_STYLES["Other"];
                  return (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, y: 15 }}
                      transition={{ duration: 0.15, delay: Math.min(idx * 0.03, 0.3) }}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                      id={`expense-card-${exp.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${catStyle.bg} ${catStyle.text}`}>
                          {catStyle.icon}
                          <span>{exp.category}</span>
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                          {new Date(exp.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      </div>

                      <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-sm mb-3 line-clamp-2">
                        {exp.title}
                      </h4>

                      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-base">
                          {formatCurrency(exp.amount)}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/edit/${exp.id}`}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-zinc-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/40 transition-colors"
                            id={`btn-edit-mobile-${exp.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => onDeleteExpense(exp.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            id={`btn-delete-mobile-${exp.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
