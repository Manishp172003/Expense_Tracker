/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("expense-tracker-user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("expense-tracker-user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate a brief API call delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Basic credentials validation
    if (!email || !password) {
      setIsLoading(false);
      throw new Error("Email and password are required.");
    }

    if (password.length < 6) {
      setIsLoading(false);
      throw new Error("Password must be at least 6 characters.");
    }

    // Standard demo user or custom registered user login
    const registeredUsersStr = localStorage.getItem("expense-tracker-registered-users");
    const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : {};

    if (registeredUsers[email]) {
      if (registeredUsers[email].password !== password) {
        setIsLoading(false);
        throw new Error("Invalid password.");
      }
      const loggedUser: User = { email, name: registeredUsers[email].name };
      setUser(loggedUser);
      localStorage.setItem("expense-tracker-user", JSON.stringify(loggedUser));
    } else {
      // Default fallback demo user for quick access
      if (email === "demo@example.com" && password === "demo123") {
        const demoUser: User = { email, name: "Demo User" };
        setUser(demoUser);
        localStorage.setItem("expense-tracker-user", JSON.stringify(demoUser));
      } else if (email === "admin@example.com" && password === "admin123") {
        const adminUser: User = { email, name: "Administrator" };
        setUser(adminUser);
        localStorage.setItem("expense-tracker-user", JSON.stringify(adminUser));
      } else {
        setIsLoading(false);
        throw new Error("User not found. Please register or use demo accounts.");
      }
    }
    setIsLoading(false);
  };

  const register = async (email: string, name: string, password: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!email || !name || !password) {
      setIsLoading(false);
      throw new Error("All fields are required.");
    }

    if (password.length < 6) {
      setIsLoading(false);
      throw new Error("Password must be at least 6 characters.");
    }

    const registeredUsersStr = localStorage.getItem("expense-tracker-registered-users");
    const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : {};

    if (registeredUsers[email] || email === "demo@example.com" || email === "admin@example.com") {
      setIsLoading(false);
      throw new Error("This email is already in use.");
    }

    // Save mock user in simulated database
    registeredUsers[email] = { name, password };
    localStorage.setItem("expense-tracker-registered-users", JSON.stringify(registeredUsers));

    // Sign them in directly
    const newUser: User = { email, name };
    setUser(newUser);
    localStorage.setItem("expense-tracker-user", JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("expense-tracker-user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
