'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface DashboardModeContextType {
  isViewMode: boolean;
  onToggleViewMode: () => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

const DashboardModeContext = createContext<DashboardModeContextType | undefined>(undefined);

export const DashboardModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const onToggleViewMode = useCallback(() => {
    setIsViewMode(prev => {
      if (!prev) { 
        setIsEditMode(false); 
      }
      return !prev;
    });
  }, []);

  const onToggleEditMode = useCallback(() => {
    setIsEditMode(prev => {
      if (!prev) { 
        setIsViewMode(false); 
      }
      return !prev;
    });
  }, [isViewMode]); 

  const value = {
    isViewMode,
    onToggleViewMode,
    isEditMode,
    onToggleEditMode,
  };

  return (
    <DashboardModeContext.Provider value={value}>
      {children}
    </DashboardModeContext.Provider>
  );
};

export const useDashboardMode = () => {
  const context = useContext(DashboardModeContext);
  if (context === undefined) {
    throw new Error('useDashboardMode must be used within a DashboardModeProvider');
  }
  return context;
};
