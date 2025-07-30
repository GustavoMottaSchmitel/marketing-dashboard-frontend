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

  // Define a largura da coluna da sidebar para o grid usando valores explícitos em px.
  // Isso garante que o grid reserve o espaço exato.
  const sidebarColumnWidth = isViewMode
    ? '0px'
    : isSidebarMinimized
      ? '64px' // Tailwind w-16 é 64px
      : '240px'; // Tailwind w-60 é 240px

  return (
    <div
      className="grid h-screen w-full overflow-hidden" // O contêiner principal ocupa 100% da altura e esconde o overflow
      style={{
        gridTemplateColumns: `${sidebarColumnWidth} 1fr`, // Coluna da sidebar (largura dinâmica) e coluna de conteúdo (resto)
        gridTemplateRows: 'theme(height.20) 1fr', // Linha do header (80px) e linha do conteúdo principal (resto)
      }}
    >
      {/* Sidebar - Controla a largura e visibilidade com max-w e overflow-hidden para transição suave */}
      {/* Removido w-16 e w-60 daqui, pois a largura da coluna é definida no grid-template-columns */}
      {/* Z-index ajustado para ser menor que o header */}
      <aside className={cn(
        "col-start-1 row-start-1 row-span-2 flex flex-col bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out z-20", // z-index ajustado
        "overflow-hidden", // Garante que o conteúdo seja cortado ao colapsar
        isViewMode ? "max-w-0 opacity-0 pointer-events-none" : "max-w-full opacity-100" // max-w-full para garantir que ocupe a largura da coluna do grid
      )}>
        <Sidebar isMinimized={isSidebarMinimized} isViewMode={isViewMode} />
      </aside>

      {/* Header - Sempre montado, sua opacidade é controlada para o modo de visualização */}
      {/* Z-index ajustado para ser maior que a sidebar */}
      <header className={cn(
        "col-start-2 row-start-1 flex-shrink-0 bg-white border-b border-gray-200 shadow-sm relative z-30 flex items-center px-6 w-full transition-all duration-300",
        isViewMode ? "h-0 opacity-0 pointer-events-none" : "h-20 opacity-100"
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

      {/* Conteúdo Principal - Esta é a ÚNICA parte que deve ter rolagem vertical */}
      <main className={cn(
        "col-start-2 p-8 overflow-y-auto bg-gray-100 transition-all duration-300 ease-in-out",
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
