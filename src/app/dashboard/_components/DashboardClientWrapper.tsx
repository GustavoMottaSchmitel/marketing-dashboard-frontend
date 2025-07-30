'use client';

import React, { useState } from 'react';
import { Header } from '@/app/components/layout/Header';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { cn } from '@/app/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/app/components/ui/custom-elements';
import { DashboardModeProvider, useDashboardMode } from '@/app/contexts/DashboardModeContext'; // Importar o provedor e o hook

interface DashboardClientWrapperProps {
  userEmail: string | null;
  children: React.ReactNode;
}

export const DashboardClientWrapper: React.FC<DashboardClientWrapperProps> = ({ userEmail, children }) => {
  // O estado de isSidebarMinimized ainda é local a este wrapper
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
        isViewMode ? "ml-0" : (isSidebarMinimized ? "ml-16" : "ml-60")
      )}>
        {/* Header - Condicionalmente renderizado */}
        {!isViewMode && (
          <header className="flex-shrink-0">
            <Header
              userEmail={userEmail}
              onToggleSidebar={handleToggleSidebar}
              isViewMode={isViewMode}
              onToggleViewMode={onToggleViewMode} // Passa a função do contexto
              isEditMode={isEditMode}
              onToggleEditMode={onToggleEditMode} // Passa a função do contexto
            />
          </header>
        )}

        {/* Botão "Sair do Modo Visualização" - Sempre visível quando em modo de visualização */}
        {isViewMode && (
          <div className="fixed top-4 right-4 z-50">
            <Button
              onClick={onToggleViewMode} // Usa a função do contexto
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
          {/* O children é renderizado diretamente, e ele usará o useDashboardMode */}
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
