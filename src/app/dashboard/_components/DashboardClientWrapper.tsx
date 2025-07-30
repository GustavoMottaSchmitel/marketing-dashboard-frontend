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
    <div className="grid h-screen w-full overflow-hidden">
      {/* Sidebar - Controla a largura e visibilidade com max-w e overflow-hidden para transição suave */}
      <aside className={cn(
        "col-start-1 row-start-1 row-span-2 flex flex-col bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out",
        isViewMode ? "max-w-0 opacity-0 pointer-events-none" : (isSidebarMinimized ? "max-w-16" : "max-w-60"), // Usa max-w para transição de largura
        "overflow-hidden" // Garante que o conteúdo seja cortado ao colapsar
      )}>
        <Sidebar isMinimized={isSidebarMinimized} isViewMode={isViewMode} />
      </aside>

      {/* Header - Controla a altura e visibilidade com h-0 para transição suave */}
      <header className={cn(
        "col-start-2 row-start-1 flex-shrink-0 bg-white border-b border-gray-200 shadow-sm relative z-30 flex items-center px-6 w-full transition-all duration-300 ease-in-out",
        isViewMode ? "h-0 opacity-0 pointer-events-none" : "h-20 opacity-100" // Controla altura e opacidade
      )}>
        <Header
          userEmail={userEmail}
          onToggleSidebar={handleToggleSidebar}
          isViewMode={isViewMode}
          onToggleViewMode={onToggleViewMode}
          isEditMode={isEditMode}
          onToggleEditMode={onToggleEditMode}
        />
      </header>

      {/* Conteúdo Principal - A única área que deve ter rolagem vertical */}
      <main className={cn(
        "col-start-2 p-8 overflow-y-auto bg-gray-100 transition-all duration-300 ease-in-out", // Adicionado transition-all
        isViewMode ? "row-start-1 row-span-2 p-4 pt-16" : "row-start-2"
      )}>
        {children}
      </main>

      {/* Botão "Sair do Modo Visualização" - Posição fixa, fora do fluxo do grid */}
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
