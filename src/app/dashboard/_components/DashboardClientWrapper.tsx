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
  const { isViewMode, onToggleViewMode, isEditMode, onToggleEditMode } = useDashboardMode();

  const handleToggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  return (
    <div className={cn(
      "grid min-h-screen bg-gray-100",
      isViewMode
        ? "grid-cols-[0fr_1fr]" 
        : isSidebarMinimized
          ? "grid-cols-[theme(width.16)_1fr]" 
          : "grid-cols-[theme(width.60)_1fr]"
    )}>

      {/* Sidebar - Agora um item do grid, não mais 'fixed' */}
      {/* A visibilidade é controlada pelo 'grid-cols' e 'hidden' para acessibilidade */}

      <aside className={cn(
        "flex flex-col bg-white border-r border-gray-200 shadow-lg z-40 transition-all duration-300 ease-in-out",
        isViewMode ? "hidden" : "block"
      )}>
        <Sidebar isMinimized={isSidebarMinimized} isViewMode={isViewMode} />
      </aside>

      {/* Área de Conteúdo Principal (Header + Main) - Agora um item do grid */}

      <div className="flex flex-col flex-1 transition-all duration-300 ease-in-out overflow-hidden">

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
