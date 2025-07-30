'use client';

import React, { useState } from 'react';
import { Header } from '@/app/components/layout/Header';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { cn } from '@/app/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/app/components/ui/custom-elements';
import { DashboardModeProvider, useDashboardMode } from '@/app/contexts/DashboardModeContext';

interface DashboardClientWrapperProps {
  userEmail: string | null;
  children: React.ReactNode;
}

export const DashboardClientWrapper: React.FC<DashboardClientWrapperProps> = ({ userEmail, children }) => {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  // Usar o hook do contexto para acessar os estados e funções de modo
  const { isViewMode, onToggleViewMode, isEditMode, onToggleEditMode } = useDashboardMode();

  const handleToggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Condicionalmente renderizada */}
      {!isViewMode && (
        <aside className={cn(
          "flex-shrink-0 transition-all duration-300 ease-in-out",
          isSidebarMinimized ? "w-16" : "w-60"
        )}>
          <Sidebar isMinimized={isSidebarMinimized} isViewMode={isViewMode} />
        </aside>
      )}

      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out",
        // Ajustado ml para considerar a borda de 1px da sidebar
        isViewMode ? "ml-0" : (isSidebarMinimized ? "ml-[65px]" : "ml-[241px]")
      )}>
        {/* Header - Condicionalmente renderizado */}
        {!isViewMode && (
          <header className="flex-shrink-0">
            <Header
              userEmail={userEmail}
              onToggleSidebar={handleToggleSidebar}
              isViewMode={isViewMode}
              onToggleViewMode={onToggleViewMode}
              isEditMode={isEditMode}
              onToggleEditMode={onToggleEditMode}
            />
          </header>
        )}

        {/* Botão "Sair do Modo Visualização" - Sempre visível quando em modo de visualização */}
        {isViewMode && (
          <div className="fixed top-4 right-4 z-50">
            <Button
              onClick={onToggleViewMode}
              className="flex items-center px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-lg transition-colors duration-300"
            >
              <X className="h-5 w-5 mr-2" /> Sair do Modo Visualização
            </Button>
          </div>
        )}

        <main className={cn(
          "flex-1 p-8 overflow-y-auto",
          isViewMode ? "p-4 pt-16" : ""
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};

export const DashboardLayoutWithProvider: React.FC<DashboardClientWrapperProps> = ({ userEmail, children }) => {
  return (
    <DashboardModeProvider>
      <DashboardClientWrapper userEmail={userEmail}>
        {children}
      </DashboardClientWrapper>
    </DashboardModeProvider>
  );
};
