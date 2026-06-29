/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from "axios";
import { Expense } from "../types";

const API_BASE_URL = "/api/expenses";

export const ExpenseService = {
  // Get all expenses
  async getAllExpenses(): Promise<Expense[]> {
    try {
      const response = await axios.get<Expense[]>(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error in getAllExpenses:", error);
      throw error;
    }
  },

  // Get a single expense by ID
  async getExpenseById(id: number): Promise<Expense> {
    try {
      const response = await axios.get<Expense>(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error in getExpenseById(${id}):`, error);
      throw error;
    }
  },

  // Add a new expense
  async addExpense(expense: Omit<Expense, "id">): Promise<Expense> {
    try {
      const response = await axios.post<Expense>(API_BASE_URL, expense);
      return response.data;
    } catch (error) {
      console.error("Error in addExpense:", error);
      throw error;
    }
  },

  // Update an existing expense
  async updateExpense(id: number, expense: Omit<Expense, "id">): Promise<Expense> {
    try {
      const response = await axios.put<Expense>(`${API_BASE_URL}/${id}`, expense);
      return response.data;
    } catch (error) {
      console.error(`Error in updateExpense(${id}):`, error);
      throw error;
    }
  },

  // Delete an expense
  async deleteExpense(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete<{ success: boolean; message: string }>(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error in deleteExpense(${id}):`, error);
      throw error;
    }
  },
};
