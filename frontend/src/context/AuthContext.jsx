/**
 * Authentication Context - Global auth state management
 */

import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is logged in on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem(ACCESS_TOKEN_KEY);
            const userData = localStorage.getItem(USER_DATA_KEY);

            if (token && userData) {
                try {
                    setUser(JSON.parse(userData));
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Auth init error:', error);
                    logout();
                }
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    // Login function
    const login = async (username, password) => {
        try {
            const response = await authAPI.login({ username, password });
            const { access, refresh, user: userData } = response.data;

            // Store tokens and user data
            localStorage.setItem(ACCESS_TOKEN_KEY, access);
            localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

            setUser(userData);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Login failed'
            };
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { access, refresh, user: newUser } = response.data;

            // Store tokens and user data
            localStorage.setItem(ACCESS_TOKEN_KEY, access);
            localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(newUser));

            setUser(newUser);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.response?.data || 'Registration failed'
            };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
            if (refreshToken) {
                await authAPI.logout(refreshToken);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(USER_DATA_KEY);

            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
