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

  const gridTemplateColumns = isViewMode
    ? '0px 1fr' 
    : isSidebarMinimized
      ? 'theme(width.16) 1fr'
      : 'theme(width.60) 1fr';

  return (
    <div
      className="grid min-h-screen w-full overflow-hidden"
      style={{
        gridTemplateColumns: gridTemplateColumns,
        gridTemplateRows: 'theme(height.20) 1fr',
      }}
    >
      {!isViewMode && (
        <aside className={cn(
          "col-start-1 row-start-1 row-span-2 flex flex-col bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out",
          isSidebarMinimized ? "w-16" : "w-60"
        )}>
          <Sidebar isMinimized={isSidebarMinimized} isViewMode={isViewMode} />
        </aside>
      )}

      {!isViewMode && (
        <header className="col-start-2 row-start-1 flex-shrink-0 bg-white border-b border-gray-200 shadow-sm relative z-30 h-20 flex items-center px-6 w-full">
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

      {/* Conteúdo Principal - Posicionado na segunda coluna, segunda linha.
          É a ÚNICA área que deve ter overflow-y-auto para rolagem.
          Quando em modo de visualização, ele ocupa a primeira linha também (onde estaria o header). */}
      <main className={cn(
        "col-start-2 p-8 overflow-y-auto bg-gray-100", // Fundo cinza para o conteúdo principal
        isViewMode ? "row-start-1 row-span-2 p-4 pt-16" : "row-start-2" // Ajusta o posicionamento e padding em modo de visualização
      )}>
        {children} {/* O conteúdo do dashboard (gráficos, etc.) é sempre renderizado aqui */}
      </main>

      {/* Botão "Sair do Modo Visualização" - Posição fixa, fora do fluxo do grid. */}
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
