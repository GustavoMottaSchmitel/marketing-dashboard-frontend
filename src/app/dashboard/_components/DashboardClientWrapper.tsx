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

  // Determina a largura da sidebar dinamicamente para grid-template-columns
  const sidebarWidth = isViewMode ? '0px' : (isSidebarMinimized ? 'theme(width.16)' : 'theme(width.60)');

  return (
    <div
      className="grid min-h-screen w-full" // Adicionado w-full para garantir que o grid ocupe toda a largura
      style={{
        // Define as colunas: uma para a sidebar (largura dinâmica) e outra para o resto do conteúdo (1fr)
        gridTemplateColumns: `${sidebarWidth} 1fr`,
        // Define as linhas: uma para o header (altura h-20) e outra para o conteúdo principal (1fr)
        gridTemplateRows: 'theme(height.20) 1fr',
      }}
    >
      {/* Sidebar - Posicionada na primeira coluna e estendendo-se por ambas as linhas */}
      {/* A visibilidade é controlada pelo 'grid-template-columns' e 'hidden' para acessibilidade */}
      <aside className={cn(
        "col-start-1 row-start-1 row-span-2 bg-white border-r border-gray-200 shadow-lg z-40 transition-all duration-300 ease-in-out",
        isViewMode ? "hidden" : "block" // Oculta completamente em modo de visualização
      )}>
        <Sidebar isMinimized={isSidebarMinimized} isViewMode={isViewMode} />
      </aside>

      {/* Header - Posicionado na segunda coluna, primeira linha */}
      <header className={cn(
        "col-start-2 row-start-1 flex-shrink-0 bg-white border-b border-gray-200 shadow-sm relative z-30 h-20 flex items-center px-6 w-full", // Adicionado classes do Header aqui para garantir consistência
        isViewMode ? "hidden" : "block" // Oculta completamente se estiver no modo de visualização
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

      {/* Conteúdo Principal - Posicionado na segunda coluna, segunda linha, e é a única área rolável */}
      <main className={cn(
        "col-start-2 row-start-2 p-8 overflow-y-auto", // Apenas o conteúdo principal rola verticalmente
        "bg-gray-100", // Garante que o fundo do main seja cinza
        isViewMode ? "p-4 pt-16" : "" // Ajusta o padding superior se o header estiver oculto no modo de visualização
      )}>
        {children} {/* O children (DashboardPage) sempre é renderizado aqui */}
      </main>

      {/* Botão "Sair do Modo Visualização" - Posição fixa, fora do fluxo do grid para o modo de visualização */}
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
