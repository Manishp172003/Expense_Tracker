/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
}

const app = express();
const DEFAULT_PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const DATA_FILE = path.join(process.cwd(), "expenses.json");

// Helper to read expenses from file
function readExpenses(): Expense[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Initialize with realistic seed data for the first run
      const seedData: Expense[] = [
        { id: 1, title: "Groceries Weekly Shopping", amount: 4500, category: "Food", date: "2026-06-25" },
        { id: 2, title: "Netflix Monthly Subscription", amount: 649, category: "Entertainment", date: "2026-06-27" },
        { id: 3, title: "Electricity Bill", amount: 3200, category: "Utilities", date: "2026-06-15" },
        { id: 4, title: "Fuel Refill", amount: 1800, category: "Transport", date: "2026-06-20" },
        { id: 5, title: "New Running Shoes", amount: 2499, category: "Shopping", date: "2026-06-28" },
        { id: 6, title: "Dental Checkup", amount: 1500, category: "Health", date: "2026-06-10" }
      ];
      fs.writeFileSync(DATA_FILE, JSON.stringify(seedData, null, 2), "utf8");
      return seedData;
    }
    const content = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading expenses file:", err);
    return [];
  }
}

// Helper to write expenses to file
function writeExpenses(expenses: Expense[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(expenses, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing expenses file:", err);
  }
}

// Middleware
app.use(express.json());

// API Endpoints
// GET /api/expenses - Get all expenses
app.get("/api/expenses", (req, res) => {
  const expenses = readExpenses();
  res.json(expenses);
});

// GET /api/expenses/:id - Get expense by ID
app.get("/api/expenses/:id", (req, res) => {
  const expenses = readExpenses();
  const id = parseInt(req.params.id, 10);
  const expense = expenses.find((e) => e.id === id);
  if (!expense) {
    return res.status(404).json({ error: `Expense with ID ${id} not found` });
  }
  res.json(expense);
});

// POST /api/expenses - Create new expense
app.post("/api/expenses", (req, res) => {
  const { title, amount, category, date } = req.body;

  // Validation
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required and must be a string." });
  }
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number greater than 0." });
  }
  if (!category || typeof category !== "string" || category.trim() === "") {
    return res.status(400).json({ error: "Category is required." });
  }
  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ error: "A valid date is required." });
  }

  const expenses = readExpenses();
  const nextId = expenses.length > 0 ? Math.max(...expenses.map((e) => e.id)) + 1 : 1;

  const newExpense: Expense = {
    id: nextId,
    title: title.trim(),
    amount: parsedAmount,
    category: category.trim(),
    date: date
  };

  expenses.push(newExpense);
  writeExpenses(expenses);

  res.status(201).json(newExpense);
});

// PUT /api/expenses/:id - Update expense
app.put("/api/expenses/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, amount, category, date } = req.body;

  // Validation
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required and must be a string." });
  }
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number greater than 0." });
  }
  if (!category || typeof category !== "string" || category.trim() === "") {
    return res.status(400).json({ error: "Category is required." });
  }
  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ error: "A valid date is required." });
  }

  const expenses = readExpenses();
  const index = expenses.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Expense with ID ${id} not found` });
  }

  expenses[index] = {
    id,
    title: title.trim(),
    amount: parsedAmount,
    category: category.trim(),
    date: date
  };

  writeExpenses(expenses);
  res.json(expenses[index]);
});

// DELETE /api/expenses/:id - Delete expense
app.delete("/api/expenses/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const expenses = readExpenses();
  const initialLength = expenses.length;
  const filtered = expenses.filter((e) => e.id !== id);

  if (filtered.length === initialLength) {
    return res.status(404).json({ error: `Expense with ID ${id} not found` });
  }

  writeExpenses(filtered);
  res.json({ success: true, message: `Expense with ID ${id} deleted successfully` });
});

// Setup Vite Dev Server / Static Assets handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html for SPA router on all non-API paths
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(DEFAULT_PORT, "0.0.0.0", () => {
    console.log(`Expense Tracker server running on http://localhost:${DEFAULT_PORT}`);
  });
}

startServer();
