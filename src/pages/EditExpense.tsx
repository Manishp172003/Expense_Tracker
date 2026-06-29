/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ExpenseService } from "../services/ExpenseService";
import { Expense } from "../types";
import ExpenseForm from "../components/ExpenseForm";
import { ArrowLeft, Edit3, AlertCircle } from "lucide-react";

export default function EditExpense() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchExpenseDetails(parseInt(id, 10));
    }
  }, [id]);

  const fetchExpenseDetails = async (expenseId: number) => {
    try {
      setLoading(true);
      const data = await ExpenseService.getExpenseById(expenseId);
      setExpense(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          `Could not retrieve expense details for record ID ${expenseId}. It may have been deleted.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await ExpenseService.updateExpense(parseInt(id, 10), data);
      navigate("/"); // Redirect on success
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "An unexpected error occurred while saving updates. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" id="edit-expense-page">
      {/* Back Button Link */}
      <div>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center space-x-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors group cursor-pointer"
          id="btn-back-to-dashboard-edit"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="flex items-center space-x-4">
        <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
          <Edit3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-zinc-900 dark:text-zinc-50" id="edit-page-title">
            Edit Expense
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Modify the details of transaction record ID: {id}.
          </p>
        </div>
      </div>

      {/* Loading & Main Form Container */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12" id="edit-loading">
            <svg className="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-xs text-zinc-500 font-medium">Fetching transaction info...</p>
          </div>
        ) : error && !expense ? (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-start space-x-3 text-sm font-medium" id="edit-error">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-start space-x-3 text-sm font-medium">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <ExpenseForm
              initialData={{
                title: expense?.title || "",
                amount: expense?.amount || 0,
                category: expense?.category || "",
                date: expense?.date || ""
              }}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onCancel={() => navigate("/")}
              submitLabel="Save Changes"
            />
          </>
        )}
      </div>
    </div>
  );
}
