'use client';

import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';

export const useAuth = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAuth must be used within an AppProvider');
    }
    return { 
        user: context.user, 
        loading: context.loading, 
        login: context.login, 
        logout: context.logout 
    };
};
