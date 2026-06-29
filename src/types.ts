/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
}

export type Category = 'Food' | 'Entertainment' | 'Utilities' | 'Transport' | 'Shopping' | 'Health' | 'Other';

export interface MonthlyReport {
  month: string; // e.g. "June 2026"
  total: number;
}

export interface CategoryReport {
  category: string;
  total: number;
  percentage: number;
}

export interface User {
  email: string;
  name?: string;
}

