/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { NavLink, Link } from "react-router-dom";
import { Wallet, PlusCircle, LayoutDashboard, Sun, Moon, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Navbar({ darkMode, toggleDarkMode }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b transition-colors duration-300 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform duration-200">
                <Wallet className="h-6 w-6" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
                Expense<span className="text-indigo-600 dark:text-indigo-400">Tracker</span>
              </span>
            </Link>
          </div>

          {/* Nav Items & Theme Toggle & Auth State */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated && (
              <>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`
                  }
                  id="nav-dashboard"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </NavLink>

                <NavLink
                  to="/add"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`
                  }
                  id="nav-add-expense"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Expense</span>
                </NavLink>

                {/* Divider */}
                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
              </>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              aria-label="Toggle Theme"
              id="btn-theme-toggle"
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-zinc-600" />}
            </button>

            {/* User Profile Badge & Logout (If Authenticated) */}
            {isAuthenticated && user && (
              <>
                {/* Vertical Divider */}
                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

                <div className="flex items-center space-x-2">
                  {/* Avatar Circle */}
                  <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold text-sm shadow-xs select-none" title={user.name || user.email}>
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>

                  {/* Desktop user text display */}
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hidden md:inline">
                    {user.name || user.email}
                  </span>

                  {/* Logout Icon Button */}
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150 cursor-pointer"
                    title="Logout"
                    id="btn-logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
