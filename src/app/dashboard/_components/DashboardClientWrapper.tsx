'use client';

import React, { useState } from 'react';
import { Header } from '@/app/components/layout/Header';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { cn } from '@/app/lib/utils';

interface DashboardClientWrapperProps {
  userEmail: string | null;
  children: React.ReactNode;
  // isEditModeFromParent REMOVIDO daqui. O estado isEditMode será gerenciado internamente.
}

export const DashboardClientWrapper: React.FC<DashboardClientWrapperProps> = ({ userEmail, children }) => {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Inicializa isEditMode como false internamente

  const handleToggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  const handleToggleViewMode = () => {
    setIsViewMode(!isViewMode);
    if (!isViewMode) { // Se está entrando no modo de visualização
      setIsSidebarMinimized(true); // Minimiza a sidebar
      setIsEditMode(false); // Desativa o modo de edição
    }
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className={cn(
        "flex-shrink-0 transition-all duration-300 ease-in-out",
        isViewMode ? "hidden" : "" // Oculta a sidebar completamente em modo de visualização
      )}>
        <Sidebar isMinimized={isSidebarMinimized} />
      </aside>

      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out",
        isViewMode ? "ml-0" : (isSidebarMinimized ? "ml-[72px]" : "ml-[250px]") // Ajusta a margem do conteúdo principal
      )}>
        <header className={cn(
          "flex-shrink-0",
          isViewMode ? "hidden" : "" // Oculta o header completamente em modo de visualização
        )}>
          <Header
            userEmail={userEmail}
            onToggleSidebar={handleToggleSidebar}
            isViewMode={isViewMode}
            onToggleViewMode={handleToggleViewMode}
            isEditMode={isEditMode} // Passando o estado interno
            onToggleEditMode={handleToggleEditMode} // Passando a função interna
          />
        </header>

        <main className={cn(
          "flex-1 p-8 overflow-y-auto bg-gray-50",
          isViewMode ? "p-4 pt-0" : "" // Ajusta o padding em modo de visualização
        )}>
          {/* Clona o elemento filho para passar as props isEditMode, isViewMode e onToggleViewMode */}
          {React.isValidElement(children) ? (
            React.cloneElement(children, {
              isEditMode,
              isViewMode,
              onToggleViewMode: handleToggleViewMode, // Passa a função para o children
            } as { isEditMode: boolean; isViewMode: boolean; onToggleViewMode: () => void })
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};
