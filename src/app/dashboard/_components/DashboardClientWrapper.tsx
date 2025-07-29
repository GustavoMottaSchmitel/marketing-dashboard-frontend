'use client';

import React, { useState } from 'react';
import { Header } from '@/app/components/layout/Header'; // Caminho corrigido para Header
import { Sidebar } from '@/app/components/layout/Sidebar'; // Caminho corrigido para Sidebar
import { cn } from '@/app/lib/utils';

interface DashboardClientWrapperProps {
  userEmail: string | null;
  children: React.ReactNode;
  // isEditModeFromParent foi removido, pois o isEditMode agora é gerenciado internamente no page.tsx
}

export const DashboardClientWrapper: React.FC<DashboardClientWrapperProps> = ({ userEmail, children }) => {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  // isEditMode e setIsEditMode foram removidos daqui, pois o modo de edição é específico da página do dashboard

  const handleToggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  const handleToggleViewMode = () => {
    setIsViewMode(!isViewMode);
    if (!isViewMode) {
      setIsSidebarMinimized(true);
      // setIsEditMode(false); // Removido, pois isEditMode não está mais aqui
    }
  };

  // handleToggleEditMode foi removido, pois não é mais usado aqui

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className={cn(
        "flex-shrink-0 transition-all duration-300 ease-in-out",
        isViewMode ? "hidden" : ""
      )}>
        <Sidebar isMinimized={isSidebarMinimized} />
      </aside>

      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out",
        isViewMode ? "ml-0" : (isSidebarMinimized ? "ml-[72px]" : "ml-[250px]") // Ajustado para corresponder ao layout.tsx
      )}>
        <header className={cn(
          "flex-shrink-0",
          isViewMode ? "hidden" : ""
        )}>
          <Header
            userEmail={userEmail}
            onToggleSidebar={handleToggleSidebar}
            isViewMode={isViewMode}
            onToggleViewMode={handleToggleViewMode}
            // isEditMode e onToggleEditMode NÃO SÃO MAIS PASSADOS AQUI
          />
        </header>

        <main className={cn(
          "flex-1 p-8 overflow-y-auto bg-gray-50",
          isViewMode ? "p-4" : ""
        )}>
          {/* O children (sua página do dashboard) agora gerencia seu próprio isEditMode */}
          {children}
        </main>
      </div>
    </div>
  );
};
