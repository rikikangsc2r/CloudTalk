'use client';

import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';

export const useJsonBlob = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useJsonBlob must be used within an AppProvider');
    }
    return {
        data: context.data,
        loading: context.loading,
        error: context.error,
        fetchData: context.fetchData,
        updateData: context.updateData
    };
};
