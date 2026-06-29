/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExpenseService } from "../services/ExpenseService";
import ExpenseForm from "../components/ExpenseForm";
import { ArrowLeft, Wallet, AlertCircle } from "lucide-react";

export default function AddExpense() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await ExpenseService.addExpense(data);
      navigate("/"); // Navigate back to dashboard on success
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "An unexpected error occurred while adding your expense. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" id="add-expense-page">
      {/* Back Button Link */}
      <div>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center space-x-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors group cursor-pointer"
          id="btn-back-to-dashboard"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="flex items-center space-x-4">
        <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-zinc-900 dark:text-zinc-50" id="add-page-title">
            Add New Expense
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Enter the details of your transaction below to keep your ledger balanced.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-start space-x-3 text-sm font-medium">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <ExpenseForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => navigate("/")}
          submitLabel="Add Transaction"
        />
      </div>
    </div>
  );
}
