import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usersAPI } from '../utils/api';

interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
  profileImage?: string;
  addresses?: any[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Load current user from localStorage (for session persistence)
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const parsedUser = JSON.parse(stored);
        // Check for stored profile image
        return parsedUser;
        return parsedUser;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Save user to localStorage when it changes (for session persistence)
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    // Admin login (hardcoded for now)
    if (email === 'admin@jeevita.com' && password === 'jeevita009') {
      const adminUser = {
        id: 'admin',
        _id: 'admin',
        name: 'Admin User',
        email: 'admin@jeevita.com',
        role: 'admin' as const,
        status: 'approved' as const,
      };
      setUser(adminUser);
      return;
    }

    // Regular user login via API
    try {
      const loggedInUser = await usersAPI.login(email, password);

      // Convert _id to id for compatibility
      const userWithId = {
        ...loggedInUser,
        id: loggedInUser._id || loggedInUser.id,
      };

      if (userWithId.status === 'rejected') {
        throw new Error('Your account has been disabled. Please contact admin.');
      }

      // Check for stored profile image


      setUser(userWithId);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      // Check if user already exists
      try {
        await usersAPI.getByEmail(email);
        throw new Error('User with this email already exists');
      } catch (error: any) {
        if (error.message === 'User with this email already exists') {
          throw error;
        }
        // User doesn't exist, continue with signup
      }

      // Create new user with approved status (auto-approved after OTP verification)
      const newUser = await usersAPI.create({
        name,
        email,
        password,
        role: 'user',
        status: 'approved',
      });

      // Convert _id to id for compatibility
      const userWithId = {
        ...newUser,
        id: newUser._id || newUser.id,
      };

      setUser(userWithId);
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      try {
        // Update local state immediately for UI responsiveness
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);

        // Persist to backend
        await usersAPI.update(user.id, updates);

        // Update localStorage for session persistence
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Failed to update user profile:', error);
        // Revert local state if API fails (optional, but good practice)
        // For now, we'll just log the error as the UI might have already updated
      }
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
