/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, AlertCircle, ArrowRight, Wallet, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const errors: typeof formErrors = {};
    if (!email) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setFormErrors({});
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8" id="login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xs"
      >
        {/* Logo and Greeting */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-4">
            <Wallet className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to manage and review your expenses
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-start space-x-3 text-sm font-medium">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} id="login-form">
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`block w-full pl-11 pr-4 py-2.5 bg-white dark:bg-zinc-800 border rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all duration-200 outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm ${
                    formErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-zinc-200 dark:border-zinc-700"
                  }`}
                  placeholder="name@example.com"
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 flex items-center text-xs text-red-600 dark:text-red-400 font-medium" id="email-error-msg">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`block w-full pl-11 pr-4 py-2.5 bg-white dark:bg-zinc-800 border rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all duration-200 outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm ${
                    formErrors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-zinc-200 dark:border-zinc-700"
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {formErrors.password && (
                <p className="mt-1 flex items-center text-xs text-red-600 dark:text-red-400 font-medium" id="password-error-msg">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {formErrors.password}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 focus:outline-hidden focus:ring-4 focus:ring-indigo-500/25 transition-colors duration-150 cursor-pointer disabled:opacity-50"
              id="btn-login-submit"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <span className="flex items-center space-x-1">
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Quick Fill Box */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-3 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Demo credentials (Click to Fill)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickFill("demo@example.com", "demo123")}
              className="p-2.5 text-left border border-zinc-100 dark:border-zinc-800 hover:border-indigo-100 dark:hover:border-indigo-900/45 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl hover:bg-indigo-50/20 dark:hover:bg-indigo-950/15 transition-all text-xs"
              type="button"
              id="btn-fill-demo"
            >
              <div className="font-semibold text-zinc-700 dark:text-zinc-300">Demo User</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">demo@example.com</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500">demo123</div>
            </button>
            <button
              onClick={() => handleQuickFill("admin@example.com", "admin123")}
              className="p-2.5 text-left border border-zinc-100 dark:border-zinc-800 hover:border-indigo-100 dark:hover:border-indigo-900/45 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl hover:bg-indigo-50/20 dark:hover:bg-indigo-950/15 transition-all text-xs"
              type="button"
              id="btn-fill-admin"
            >
              <div className="font-semibold text-zinc-700 dark:text-zinc-300">Administrator</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">admin@example.com</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500">admin123</div>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-1">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            id="link-to-register"
          >
            Create account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
