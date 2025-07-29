'use client';

import React, { useState } from 'react';
import { Header } from '@/app/components/layout/Header';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { cn } from '@/app/lib/utils';

interface DashboardClientWrapperProps {
  userEmail: string | null;
  children: React.ReactNode;
  isEditModeFromParent: boolean;
}

export const DashboardClientWrapper: React.FC<DashboardClientWrapperProps> = ({ userEmail, children, isEditModeFromParent }) => {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(isEditModeFromParent);

  const handleToggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  const handleToggleViewMode = () => {
    setIsViewMode(!isViewMode);
    if (!isViewMode) {
      setIsSidebarMinimized(true);
      setIsEditMode(false);
    }
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

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
        isViewMode ? "ml-0" : (isSidebarMinimized ? "ml-16" : "ml-64")
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
            isEditMode={isEditMode}
            onToggleEditMode={handleToggleEditMode}
          />
        </header>

        <main className={cn(
          "flex-1 p-8 overflow-y-auto bg-gray-50",
          isViewMode ? "p-4" : ""
        )}>
          {/* AQUI ESTÁ A CORREÇÃO ANTERIOR PARA O ERRO DE TIPAGEM */}
          {React.isValidElement(children) ? (
            React.cloneElement(children, { isEditMode } as { isEditMode: boolean })
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};