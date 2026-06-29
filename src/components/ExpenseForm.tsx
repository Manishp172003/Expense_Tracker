/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Expense, Category } from "../types";
import { FileText, IndianRupee, Tag, Calendar, AlertCircle, Sparkles } from "lucide-react";

interface ExpenseFormProps {
  initialData?: Omit<Expense, "id">;
  onSubmit: (data: Omit<Expense, "id">) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
}

const CATEGORIES: Category[] = [
  "Food",
  "Entertainment",
  "Utilities",
  "Transport",
  "Shopping",
  "Health",
  "Other"
];

export default function ExpenseForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
  submitLabel = "Save Expense"
}: ExpenseFormProps) {
  // Local states for form inputs
  const [title, setTitle] = useState(initialData?.title || "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [category, setCategory] = useState<Category | "">(initialData?.category as Category || "");
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0]);

  // Validation states
  const [errors, setErrors] = useState<{
    title?: string;
    amount?: string;
    category?: string;
    date?: string;
  }>({});

  // Sync state if initialData changes (e.g. when editing loads)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category as Category);
      setDate(initialData.date);
    }
  }, [initialData]);

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    const newErrors: typeof errors = {};

    // Validate Title
    if (!title.trim()) {
      newErrors.title = "Title is required.";
    }

    // Validate Amount
    const parsedAmount = parseFloat(amount);
    if (!amount) {
      newErrors.amount = "Amount is required.";
    } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = "Amount must be a positive number greater than 0.";
    }

    // Validate Category
    if (!category) {
      newErrors.category = "Category is required.";
    }

    // Validate Date
    if (!date) {
      newErrors.date = "Date is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // No errors, trigger onSubmit
    onSubmit({
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="expense-form">
      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Title / Description
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <FileText className="h-5 w-5" />
          </div>
          <input
            type="text"
            name="title"
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="e.g. Pizza with friends, Electricity Bill"
            className={`block w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-800 border rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all duration-200 outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 ${
              errors.title
                ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/10"
                : "border-zinc-200 dark:border-zinc-700"
            }`}
          />
        </div>
        {errors.title && (
          <p className="mt-1.5 flex items-center text-xs text-red-600 dark:text-red-400 font-medium" id="title-error">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            {errors.title}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amount Field */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Amount (₹)
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
              <span className="text-md font-semibold select-none">₹</span>
            </div>
            <input
              type="number"
              step="any"
              name="amount"
              id="amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
              }}
              placeholder="0.00"
              className={`block w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-800 border rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 font-mono transition-all duration-200 outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 ${
                errors.amount
                  ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/10"
                  : "border-zinc-200 dark:border-zinc-700"
              }`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1.5 flex items-center text-xs text-red-600 dark:text-red-400 font-medium" id="amount-error">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              {errors.amount}
            </p>
          )}
        </div>

        {/* Category Field */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Category
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
              <Tag className="h-5 w-5" />
            </div>
            <select
              name="category"
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as Category);
                if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
              }}
              className={`block w-full pl-11 pr-10 py-3 bg-white dark:bg-zinc-800 border rounded-xl text-zinc-900 dark:text-zinc-100 appearance-none transition-all duration-200 outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 ${
                errors.category
                  ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/10"
                  : "border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <option value="" disabled>Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {/* Custom arrow decoration */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.category && (
            <p className="mt-1.5 flex items-center text-xs text-red-600 dark:text-red-400 font-medium" id="category-error">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              {errors.category}
            </p>
          )}
        </div>
      </div>

      {/* Date Field */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Date
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <Calendar className="h-5 w-5" />
          </div>
          <input
            type="date"
            name="date"
            id="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
            }}
            className={`block w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-800 border rounded-xl text-zinc-900 dark:text-zinc-100 transition-all duration-200 outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 ${
              errors.date
                ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/10"
                : "border-zinc-200 dark:border-zinc-700"
            }`}
          />
        </div>
        {errors.date && (
          <p className="mt-1.5 flex items-center text-xs text-red-600 dark:text-red-400 font-medium" id="date-error">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            {errors.date}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 cursor-pointer disabled:opacity-50"
            id="btn-cancel"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-sm shadow-indigo-600/10 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/25 cursor-pointer disabled:opacity-50"
          id="btn-save"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>{submitLabel}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
