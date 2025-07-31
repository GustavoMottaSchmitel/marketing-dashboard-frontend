'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface DashboardModeContextType {
  isViewMode: boolean;
  onToggleViewMode: () => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  setEditMode: (mode: boolean) => void; // Adicionado para permitir setar diretamente o modo de edição
  setViewMode: (mode: boolean) => void; // Adicionado para permitir setar diretamente o modo de visualização
}

const DashboardModeContext = createContext<DashboardModeContextType | undefined>(undefined);

interface DashboardModeProviderProps {
  children: React.ReactNode;
}

export const DashboardModeProvider: React.FC<DashboardModeProviderProps> = ({ children }) => {
  const [_isViewMode, _setIsViewMode] = useState(false); // Renomeado para evitar conflito com props do DashboardClientWrapper
  const [_isEditMode, _setIsEditMode] = useState(false); // Renomeado para evitar conflito com props do DashboardClientWrapper

  // Função para alternar o modo de visualização
  const onToggleViewMode = useCallback(() => {
    _setIsViewMode(prevMode => !prevMode);
    _setIsEditMode(false); // Sair do modo de edição ao entrar/sair do modo de visualização
  }, []); // Removido 'isViewMode' pois o useCallback usa o prevMode do useState

  // Função para setar o modo de visualização diretamente
  const setViewMode = useCallback((mode: boolean) => {
    _setIsViewMode(mode);
    if (mode) { // Se entrar no modo de visualização, sair do modo de edição
      _setIsEditMode(false);
    }
  }, []);

  // Função para alternar o modo de edição
  const onToggleEditMode = useCallback(() => {
    _setIsEditMode(prevMode => !prevMode);
    _setIsViewMode(false); // Sair do modo de visualização ao entrar/sair do modo de edição
  }, []); // Removido 'isEditMode' pois o useCallback usa o prevMode do useState

  // Função para setar o modo de edição diretamente
  const setEditMode = useCallback((mode: boolean) => {
    _setIsEditMode(mode);
    if (mode) { // Se entrar no modo de edição, sair do modo de visualização
      _setIsViewMode(false);
    }
  }, []);

  const value = useMemo(() => ({
    isViewMode: _isViewMode,
    onToggleViewMode,
    isEditMode: _isEditMode,
    onToggleEditMode,
    setEditMode,
    setViewMode,
  }), [_isViewMode, onToggleViewMode, _isEditMode, onToggleEditMode, setEditMode, setViewMode]);

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
