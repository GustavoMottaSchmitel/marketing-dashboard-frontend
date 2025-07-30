'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Download, Bell, Settings, ChevronDown, ChevronUp, FileText, DownloadCloud, Printer, User, LogOut, EyeIcon, EditIcon, MenuIcon } from "lucide-react";
import { logoutAction } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { NotificationsDropdown } from '@/app/dashboard/_components/NotificationsDropdown';
import { getAlerts, markAlertAsRead } from '@/app/lib/alerts';
import { AlertData, PaginatedAlertsResponse } from '@/app/types/alerts';
import Link from 'next/link';
import { Card } from "../ui/custom-elements";
import { Button } from '@/app/components/ui/custom-elements';
import { cn } from '@/app/lib/utils';

interface HeaderProps {
  userEmail: string | null;
  onToggleSidebar: () => void;
  isViewMode: boolean; 
  onToggleViewMode: () => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

interface NextRedirectError extends Error {
  digest?: string;
}

const NEXT_REDIRECT_ERROR_CODE = 'NEXT_REDIRECT';

const Header: React.FC<HeaderProps> = ({
  userEmail,
  onToggleSidebar,
  isViewMode, 
  onToggleViewMode,
  isEditMode,
  onToggleEditMode, 
}) => {
  const router = useRouter();
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notifications, setNotifications] = useState<AlertData[]>([]);

  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response: PaginatedAlertsResponse = await getAlerts(0, 5);
      setNotifications(response.content);
    } catch (error: unknown) {
      console.error("Erro ao buscar notificações:", error);
      toast.error('Erro ao carregar notificações.');
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fetchNotifications]);

  const handleMarkNotificationAsRead = async (alertId: number) => {
    try {
      await markAlertAsRead(alertId);
      toast.success('Alerta marcado como lido!');
      setNotifications(prev => prev.map(n => n.id === alertId ? { ...n, read: true } : n));
    } catch (error: unknown) {
      toast.error('Erro ao marcar alerta como lido.');
      console.error('Erro ao marcar alerta como lido:', error);
    }
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setShowNotificationsDropdown(false);
    toast.info('Todas as notificações foram limpas (apenas localmente).');
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
      toast.success('Sessão encerrada com sucesso!');
    } catch (error: unknown) {
      if (error instanceof Error && (error as NextRedirectError).digest?.includes(NEXT_REDIRECT_ERROR_CODE)) {
        throw error;
      }
      console.error('Erro ao fazer logout:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Erro ao encerrar sessão.');
      } else {
        toast.error('Erro desconhecido ao encerrar sessão.');
      }
    }
  };

  const handleNotificationClick = () => {
    setShowNotificationsDropdown(prev => !prev);
    if (!showNotificationsDropdown) {
      fetchNotifications();
    }
  };

  const handleExportPdfClick = () => {
    setShowExportDropdown(false);
  };

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm relative z-30 h-20 flex items-center px-6 py-4 w-full">
      <div className="flex items-center">

        {/* Botão de alternar Sidebar */}

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="mr-4 text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
          aria-label="Toggle Sidebar"
        >
          <MenuIcon className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">Dashboard</h1> {/* Título do Dashboard */}
      </div>

      <div className="flex items-center space-x-4 ml-auto">

        {/* Botão MODO VISUALIZAÇÃO */}

        <Button
          variant={isViewMode ? "default" : "outline"}
          onClick={onToggleViewMode}
          className={cn(
            "py-2 px-4 rounded-lg transition-all duration-300 ease-in-out",
            isViewMode
              ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-800 shadow-sm hover:shadow-md" // Melhorado hover
          )}
        >
          <EyeIcon className="h-5 w-5 mr-2" />
          {isViewMode ? 'Sair do Modo Visualização' : 'MODO VISUALIZAÇÃO'}
        </Button>

        {/* Botão EDIT MODE */}

        <Button
          variant={isEditMode ? "default" : "outline"}
          onClick={onToggleEditMode}
          className={cn(
            "py-2 px-4 rounded-lg transition-all duration-300 ease-in-out",
            isEditMode
              ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
              : "bg-white border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 shadow-sm hover:shadow-md" // Melhorado hover
          )}
        >
          <EditIcon className="h-5 w-5 mr-2" />
          {isEditMode ? 'Sair do Modo Edição' : 'EDIT MODE'}
        </Button>

        {/* Export Dropdown */}

        <div className="relative" ref={exportDropdownRef}>
          <Button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-md hover:shadow-lg" // Melhorado hover
          >
            <Download size={18} />
            Exportar {showExportDropdown ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
          </Button>
          {showExportDropdown && (
            <Card className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-40 p-1">
              <Link
                href="/dashboard/report-builder"
                onClick={handleExportPdfClick}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FileText size={16} /> Exportar para PDF
              </Link>
              <button className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <DownloadCloud size={16} /> Exportar para Excel
              </button>
              <button className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <Printer size={16} /> Imprimir
              </button>
            </Card>
          )}
        </div>

        {/* Notifications Bell Button and Dropdown */}

        <div className="relative" ref={notificationsDropdownRef}>
          <Button
            onClick={handleNotificationClick}
            className="relative p-2 text-yellow-500 bg-white hover:bg-gray-100 rounded-full transition-colors shadow-sm hover:shadow-md" // Melhorado hover
            aria-label="Notificações e Alertas"
          >
            <Bell size={20} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce-once">
                {unreadNotificationsCount}
              </span>
            )}
          </Button>
          {showNotificationsDropdown && (
            <NotificationsDropdown
              isOpen={showNotificationsDropdown}
              onClose={() => setShowNotificationsDropdown(false)}
              notifications={notifications}
              onMarkAsRead={handleMarkNotificationAsRead}
              onClearAll={handleClearAllNotifications}
            />
          )}
        </div>

        {/* Settings Button */}

        <Button className="p-2 text-gray-700 bg-white hover:bg-gray-100 rounded-full transition-colors shadow-sm hover:shadow-md"> {/* Melhorado hover */}
          <Settings size={20} />
        </Button>

        {/* User Profile Dropdown */}

        <div className="relative" ref={userDropdownRef}>
          <Button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-gray-100 transition-colors cursor-pointer shadow-sm hover:shadow-md" // Melhorado hover
            aria-label="Perfil do usuário e sair"
          >
            <span className="text-sm font-medium text-gray-800 hidden sm:block">
              {userEmail || 'Carregando...'}
            </span>
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {userInitial}
            </div>
            {showUserDropdown ? <ChevronUp size={16} className="ml-1 text-gray-500" /> : <ChevronDown size={16} className="ml-1 text-gray-500" />}
          </Button>
          {showUserDropdown && (
            <Card className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-40 p-1">
              <button
                onClick={() => { router.push('/dashboard/configuracoes-conta'); setShowUserDropdown(false); }}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <User size={16} /> Configurações da Conta
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut size={16} /> Sair
              </button>
            </Card>
          )}
        </div>
      </div>
    </header>
  );
};

export { Header };
